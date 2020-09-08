import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import * as AWS  from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { getUserId } from "../utils"
import { setAttachmentUrl } from '../../businessLogic/todos'

const logger = createLogger('generateUploadUrl')


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  logger.info('Processing event: ', event)
  const userId = getUserId(event)
  const todoId  = event.pathParameters.todoId
  const s3BucketName = process.env.S3_BUCKET
  const urlExpiration = process.env.SIGNED_URL_EXPIRATION

  const s3 = new AWS.S3({
     signatureVersion: 'v4' // Use Sigv4 algorithm
  })

  const presignedUrl = s3.getSignedUrl('putObject', {
     Bucket: s3BucketName,
     Key: todoId,
     Expires: urlExpiration
  })

  logger.info('Getting presignedUrl: ', presignedUrl)

  const attachmentUrl = 'https://' + s3BucketName + '.s3.amazonaws.com/' + todoId

  logger.info('Setting attachmentUrl: ', attachmentUrl)

  await setAttachmentUrl(userId, todoId, attachmentUrl)

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: presignedUrl
    })
  }}
