const aws = require('aws-sdk');
const doc = require('dynamodb-doc');

const s3 = new aws.S3({ apiVersion: '2006-03-01' });
const uuid = require('uuid');

const dynamo = new doc.DynamoDB();
const tableName = process.env.TABLE_NAME || '';
const s3BucketName = process.env.S3_BUCKET_NAME || '';


if (tableName === '') {
  console.error('Missing environment variable TABLE_NAME')
  throw Error('Missing environment variable TABLE_NAME')
}

if (s3BucketName === '') {
  console.error('Missing environment variable S3_BUCKET_NAME')
  throw Error('Missing environment variable S3_BUCKET_NAME')
}

const isEmpty = function(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

exports.handler = (event, context, callback) => {
  // Remove the '-' from the UUID
  const id = uuid().split('-').join('');
  let parsedBody = {};
  if (event.httpMethod !== 'GET') {
    parsedBody = JSON.parse(event.body) || {};
  }

  const fail = (err, code = '400') => {
    console.error(err);
    console.error(code);
    callback(
      null, 
      {
        statusCode: code || '400',
        body: err.message,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    ); 
  }

  const notFound = () => {
    fail({message: 'Resource not found'}, '404')
  }

  const created = (err, res) => {
    if (err) {
      return fail(err);
    }

    // Pull in item from the wider scope...
    // res = item;
    console.log(res);
    callback(
      null,
      {
        statusCode: 201,
        body: JSON.stringify(res),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    )
  }

  const gotCollection = (err, res) => {
    if (err) {
      return fail(err)
    }
    
    callback(
      null,
      {
        statusCode: 200,
        body: JSON.stringify({collection: res.Items || []}),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    )
  }
  
  const got = (err, res) => {
    if (err) {
      return fail(err)
    }
    
    if (isEmpty(res)) {
      return notFound()
    }

    callback(
      null,
      {
        statusCode: 200,
        body: JSON.stringify(res.Item),
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json'
        }
      }
    )
  }

  const noContent = (err, res) => {
    if (err) {
      return fail(err)
    }

    callback(
      null,
      {
        statusCode: 204
      }
    )
  }
  
  const idFromRequest = typeof event.pathParameters !== 'undefined' &&
    event.pathParameters !== null ? 
      event.pathParameters.id || ''
      : '';
  switch (event.httpMethod) {
    case 'DELETE':
      console.info('DELETE /sounds/' + idFromRequest);
      dynamo.deleteItem(
        {TableName: tableName, Key: {id: idFromRequest}},
        noContent
      );
      break;
    case 'GET':
      if (idFromRequest === '') {
        console.info('GET /sounds');
        return dynamo.scan(
          { TableName: tableName},
          gotCollection
        );
      }
      
      console.info('GET /sounds/' + idFromRequest);
      dynamo.getItem(
        { TableName: tableName, Key: {id: idFromRequest}},
        got
      );
      break;
    case 'POST':
      console.info('POST /sounds ');
      
      let item = {};
      if (!isEmpty(parsedBody)) {
        const byteString = new Buffer(parsedBody.audioUrl.split(',')[1], 'base64');
    
        item = {
          id: id,
          title: parsedBody.title,
          text: parsedBody.text,
          // yyyy/mm/dd/title
          fileUrl: ((new Date()).toISOString().slice(0,10).split('-').join('/')) + 
            parsedBody.title.split(' ').join('-').toLowerCase(),
          fileContents: byteString
        };
      }
      const params = {
        Bucket: s3BucketName,
        Key: item.fileUrl,
        Body: item.audioFile
      };

      s3.putObject(params);
      dynamo.putItem(
        {TableName: tableName, Item: item},
        created
      );
      break;
    default:
      fail({message:`Unsupported method "${event.httpMethod}"`});
  }
};
