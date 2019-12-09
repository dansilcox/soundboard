const uuidv4 = require('uuid/v4')
const AWS = require('aws-sdk')
const s3 = new AWS.S3();

const s3BucketName = process.env.S3_BUCKET_NAME || '';

if (s3BucketName === '') {
  console.error('Missing environment variable S3_BUCKET_NAME')
  throw Error('Missing environment variable S3_BUCKET_NAME')
}

exports.handler = async (event) => {
  return await getUploadURL()
}
const getUploadURL = async () => {
  const actionId = uuidv4()
  const s3Params = {
    Bucket: s3BucketName,
    Key:  `${actionId}.mp3`,
    ContentType: 'audio/mpeg',
    ACL: 'public-read',
  }
  return new Promise((resolve, reject) => {
    let uploadURL = s3.getSignedUrl('putObject', s3Params)
    resolve({
      "statusCode": 200,
      "isBase64Encoded": false,
      "headers": { "Access-Control-Allow-Origin": "*" },
      "body": JSON.stringify({
        "uploadURL": uploadURL,
        "audioFilename": `${actionId}.mp3`
      })
    })
  })
})