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

    const created = (err, res) => {
      if (err) {
        fail(err);
        return;
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

    const notFound = () => {
      callback(
        null, 
        {
          statusCode: 404,
          body: JSON.stringify({message: 'Resource not found'}),
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }
    const finished = (err, res) => {
        let successCode = '200';
        switch (event.httpMethod) {
            case 'POST':
                successCode = '201';
                res = item;
                break;
            case 'GET':
                if (res == null) {
                    return notFound();
                }
                break;
            default:
                successCode = res.length > 0 ? '200' : '204';
                break;
        }
        const code = err ? '400' : successCode;
        let body = err ? err.message : JSON.stringify(res);
        if (res.hasOwnProperty('Item')) {
            body = JSON.stringify(res.Item);
        }
        callback(
            null, 
            {
                statusCode: code,
                body: body,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }
    
    switch (event.httpMethod) {
        case 'DELETE':
            dynamo.deleteItem({TableName: tableName, Key: {id: event.pathParameters.id}}, finished);
            break;
        case 'GET':
            dynamo.getItem({ TableName: tableName, Key: {id: event.pathParameters.id}}, finished);
            break;
        case 'POST':
            dynamo.putItem({TableName: tableName, Item: item}, created);
            break;
        default:
            finished(new Error(`Unsupported method "${event.httpMethod}"`));
    }
};
