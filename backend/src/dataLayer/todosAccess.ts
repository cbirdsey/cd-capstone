import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('TodoAccess')

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {

  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME) {
  }


  async getTodos(userId: string): Promise<TodoItem[]> {
    logger.info('Getting all todos')

    const result = await this.docClient.query({
      TableName: this.todosTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodo(userId: string, todoId: string, createdAt: string, name: string, dueDate: string): Promise<TodoItem> {

      const todoItem: TodoItem = {
        userId: userId,
        todoId: todoId,
        createdAt: createdAt,
        name: name,
        dueDate: dueDate,
        done: false
      }

     logger.info('Storing new todo: ', todoItem)

      await this.docClient.put({
         TableName: this.todosTable,
         Item: todoItem
       }).promise()

      return todoItem
  }


  async updateTodo(userId: string, todoId: string, name: string, dueDate: string, done: boolean): Promise<string> {

      logger.info('Storing updated todo: ', todoId)

      await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          todoId,
          userId
        },
        UpdateExpression:
          'set #n = :n, dueDate = :dd, done = :d',
        ExpressionAttributeValues: {
          ':n': name,
          ':dd': dueDate,
          ':d': done
        },
        ExpressionAttributeNames: {
          '#n': 'name',
        },
        ReturnValues: 'UPDATED_OLD'
      }).promise();

      return ''
  }


  async deleteTodo(userId: string, todoId: string): Promise<string> {

    logger.info('Deleting todoId: ', todoId)
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            userId: userId,
            todoId: todoId
        }
    }).promise()

    return ''
  }

   async setAttachmentUrl(userId: string, todoId: string, attachmentUrl: string): Promise<string> {
     logger.info('Setting attachmentUrl for todoId: ', todoId)

     await this.docClient.update({
          TableName: this.todosTable,
          Key: {
              userId: userId,
              todoId: todoId
          },
          UpdateExpression: "set attachmentUrl = :a",
          ExpressionAttributeValues: {
              ":a": attachmentUrl
          }
     }).promise()

     return ''
   }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE) {
    logger.info('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}
