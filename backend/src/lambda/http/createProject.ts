import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateProjectRequest } from '../../requests/CreateProjectRequest'
import { getUserId } from '../utils';
import { createProject } from '../../businessLogic/projectBussiness'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newProject: CreateProjectRequest = JSON.parse(event.body)
    const userId = getUserId(event)
    try {
      const newCreatedProject = await createProject(userId, newProject);
      return {
        statusCode: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify({ item: newCreatedProject })
      }
    }
    catch (err) {
      return {
        statusCode: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(err)
      }
    }
  }
)

handler.use(
  cors({
    credentials: true
  })
)
