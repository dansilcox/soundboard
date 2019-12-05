const doc = require('dynamodb-doc');
const uuid = require('uuid');

const dynamo = new doc.DynamoDB();
const tableName = process.env.TABLE_NAME || '';

exports.handler = (event, context, callback) => {
  // Remove the '-' from the UUID
  const id = uuid().split('-').join('');
  const parsedBody = JSON.parse(event.body) || {};
  
  const item = {
    id: id,
    title: parsedBody.title,
    text: parsedBody.text,
    fileUrl: parsedBody.audioFile
  };
  
  const fail = (err, code = '400') => {
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

    if (!res || res.length === 0) {
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
      dynamo.deleteItem(
        {TableName: tableName, Key: {id: event.pathParameters.id}},
        noContent
      );
      break;
    case 'GET':
      dynamo.getItem(
        { TableName: tableName, Key: {id: event.pathParameters.id}},
        got
      );
      break;
    case 'POST':
      dynamo.putItem(
        {TableName: tableName, Item: item},
        created
      );
      break;
    default:
      fail({message:`Unsupported method "${event.httpMethod}"`});
  }
};
