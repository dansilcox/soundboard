const doc = require('dynamodb-doc');
// const s3 = require('s3');
const uuid = require('uuid');

const dynamo = new doc.DynamoDB();
const tableName = process.env.TABLE_NAME || '';
const s3BucketArn = process.env.S3_BUCKET_ARN || '';


if (tableName === '') {
  console.error('Missing environment variable TABLE_NAME')
  throw Error('Missing environment variable TABLE_NAME')
}

if (s3BucketArn === '') {
  console.error('Missing environment variable S3_BUCKET_ARN')
  throw Error('Missing environment variable S3_BUCKET_ARN')
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
  console.log(parsedBody);
  const item = {
    id: id,
    title: parsedBody.title,
    text: parsedBody.text,
    fileUrl: parsedBody.audioFile
  };
  
  const fail = (err, code = '400') => {
    console.error(err);
    console.error(code);
    callback(
      null, 
      {
        statusCode: code || '400',
        body: err.message,
        headers: {
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
    res = item;
    callback(
      null,
      {
        statusCode: 201,
        body: JSON.stringify(res),
        headers: {
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
  
  switch (event.httpMethod) {
    case 'DELETE':
      console.info('DELETE /sounds/' + event.pathParameters.id);
      dynamo.deleteItem(
        {TableName: tableName, Key: {id: event.pathParameters.id}},
        noContent
      );
      break;
    case 'GET':
      console.info('GET /sounds/' + event.pathParameters.id);
      dynamo.getItem(
        { TableName: tableName, Key: {id: event.pathParameters.id}},
        got
      );
      break;
    case 'POST':
      console.info('POST /sounds ');
      console.info(JSON.stringify(item));
      dynamo.putItem(
        {TableName: tableName, Item: item},
        created
      );
      break;
    default:
      fail({message:`Unsupported method "${event.httpMethod}"`});
  }
};
