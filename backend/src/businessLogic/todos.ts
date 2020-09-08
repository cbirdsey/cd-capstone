import * as uuid from 'uuid'
import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'

const todoAccess = new TodoAccess()

export async function getTodos(
   userId: string
): Promise<TodoItem[]> {
  return todoAccess.getTodos(userId)
}

export async function createTodo(
  userId: string,
  createTodoRequest: CreateTodoRequest
): Promise<TodoItem> {

  const timestamp = new Date().toISOString()
  const todoId = uuid.v4()

  return await todoAccess.createTodo(
    userId,
    todoId,
    timestamp,
    createTodoRequest.name,
    createTodoRequest.dueDate
   )
}

export async function updateTodo(
  userId: string,
  todoId: string,
  updateTodoRequest: UpdateTodoRequest
): Promise<string> {

  return await todoAccess.updateTodo(
    userId,
    todoId,
    updateTodoRequest.name,
    updateTodoRequest.dueDate,
    updateTodoRequest.done
  )
}


export async function deleteTodo(
  userId: string,
  todoId: string
): Promise<String> {

  return await todoAccess.deleteTodo(
    userId,
    todoId
  )
}

export async function setAttachmentUrl(
  userId: string,
  todoId: string,
  attachmentUrl: string
): Promise<String> {

  return await todoAccess.setAttachmentUrl(
    userId,
    todoId,
    attachmentUrl
  )
}
