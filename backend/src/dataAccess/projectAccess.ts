import * as AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { ProjectItem } from '../models/ProjectItem'
import { UpdateProjectRequest } from '../requests/UpdateProjectRequest'
import { genPresignUrl } from '../attachment/attachementHelper'
import * as uuid from 'uuid'
import { TaskItem } from '../models/TaskItem'
import { UpdateTaskRequest } from '../requests/UpdateTaskRequest'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('project-DAL')

export class ProjectAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly projectsTable = process.env.PROJECTS_TABLE,
        private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET) { }

    getProjects = async (userId: string): Promise<ProjectItem[]> => {
        logger.log('info', 'Querying all projects ...')
        let projects: ProjectItem[]
        const result = await this.docClient.query({
            TableName: this.projectsTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        projects = result.Items as ProjectItem[]
        return projects
    }

    getProjectByProjectId = async (userId: string, projectId: string): Promise<ProjectItem> => {
        logger.log('info', 'Querying project with ID: '.concat(projectId))
        let project: ProjectItem
        const res = await this.docClient.query({
            TableName: this.projectsTable,
            KeyConditionExpression: 'userId = :userId AND projectId = :projectId',
            ExpressionAttributeValues: {
                ':userId': userId,
                ':projectId': projectId
            }
        }).promise()
        logger.log('info', 'res.Items: '.concat(JSON.stringify(res)))
        project = (res.Items as ProjectItem[])[0]
        return project
    }

    createProject = async (project: ProjectItem): Promise<ProjectItem> => {
        logger.log('info', 'Create new project: '.concat(JSON.stringify(project)))
        await this.docClient.put({
            TableName: this.projectsTable,
            Item: project
        }).promise()
        return project
    }

    createTask = async (task: TaskItem, userId: string, projectId: string): Promise<void> => {
        logger.log('info', 'Create new task: '.concat(JSON.stringify(task)))
        let currentProject = await this.getProjectByProjectId(userId, projectId);
        let newTasks: TaskItem[]
        logger.log('info', 'currentProject: '.concat(JSON.stringify(newTasks)))
        if (currentProject) {
            newTasks = currentProject.tasks.concat(task)
            logger.log('info', 'newTasks: '.concat(JSON.stringify(newTasks)))
            await this.docClient.update({
                TableName: this.projectsTable,
                Key: {
                    "userId": userId,
                    "projectId": projectId
                },
                UpdateExpression: "set tasks=:tasks",
                ExpressionAttributeValues: {
                    ":tasks": newTasks
                }
            }).promise()
        } else {
            logger.log('error', 'project not found: '.concat(JSON.stringify(currentProject)))
            throw new Error("Project not found")
        }
    }

    updateProject = async (userId: string, projectId: string, updateProject: UpdateProjectRequest): Promise<void> => {
        logger.log('info', 'Updating project info: '.concat(JSON.stringify({ ...updateProject, userId, projectId })))
        await this.docClient.update({
            TableName: this.projectsTable,
            Key: {
                "userId": userId,
                "projectId": projectId
            },
            UpdateExpression: "set title=:title, description=:description, projectStatus=:projectStatus, priority=:priority",
            ExpressionAttributeValues: {
                ":title": updateProject.title,
                ":description": updateProject.description,
                ":projectStatus": updateProject.projectStatus,
                ":priority": updateProject.priority
            }
        }).promise()
    }

    updateTask = async (updatedTask: UpdateTaskRequest, userId: string, projectId: string, taskId: string): Promise<void> => {
        logger.log('info', 'Update task: '.concat(JSON.stringify(updatedTask)))
        let currentProject = await this.getProjectByProjectId(userId, projectId);
        if (currentProject) {
            let currentTasks = currentProject.tasks
            logger.log('debug', 'before update: '.concat(JSON.stringify(currentTasks)))
            if (!currentTasks) throw new Error("Tasks list is empty")
            for (let task of currentTasks) {
                if (task.taskId === taskId) {
                    task.assignedTo = updatedTask.assignedTo
                    task.dueDate = updatedTask.dueDate
                    task.priority = updatedTask.priority
                    task.taskStatus = updatedTask.taskStatus
                    task.todo = updatedTask.todo
                    logger.log('debug', 'after update: '.concat(JSON.stringify(currentTasks)))
                    await this.docClient.update({
                        TableName: this.projectsTable,
                        Key: {
                            "userId": userId,
                            "projectId": projectId
                        },
                        UpdateExpression: "set tasks=:tasks",
                        ExpressionAttributeValues: {
                            ":tasks": currentTasks
                        }
                    }).promise()
                    return
                }
            }
            logger.log('info', 'task not found: '.concat(taskId))
        } else {
            logger.log('error', 'project not found: '.concat(JSON.stringify(currentProject)))
            throw new Error("Project not found")
        }
    }

    deleteProject = async (userId: string, projectId: string): Promise<void> => {
        logger.log('info', 'Deleting project: '.concat(projectId))
        await this.docClient.delete({
            TableName: this.projectsTable,
            Key: {
                "userId": userId,
                "projectId": projectId
            }
        }).promise()
    }

    deleteTask = async (userId: string, projectId: string, taskId: string): Promise<void> => {
        let currentProject = await this.getProjectByProjectId(userId, projectId);
        if (currentProject) {
            let currentTasks = currentProject.tasks
            logger.log('debug', 'before delete: '.concat(JSON.stringify(currentTasks)))
            if (!currentTasks) throw new Error("Tasks list is empty")
            let updatedTaskList = currentTasks.filter(task => task.taskId !== taskId);
            await this.docClient.update({
                TableName: this.projectsTable,
                Key: {
                    "userId": userId,
                    "projectId": projectId
                },
                UpdateExpression: "set tasks=:tasks",
                ExpressionAttributeValues: {
                    ":tasks": updatedTaskList
                }
            }).promise()
        } else {
            logger.log('error', 'project not found: '.concat(JSON.stringify(currentProject)))
            throw new Error("Project not found")
        }
    }

    getUploadURL = async (userId: string, projectId: string): Promise<string> => {
        const imageId = uuid.v4()
        const presignedUrl = await genPresignUrl(imageId)
        this.docClient.update({
            TableName: this.projectsTable,
            Key: {
                projectId,
                userId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": `https://${this.bucketName}.s3.amazonaws.com/${imageId}`,
            }
        }, (err, data) => {
            if (err) {
                logger.log('error', 'Error: '.concat(err.message))
                throw new Error(err.message)
            }
            logger.log('info', 'Created: '.concat(JSON.stringify(data)))
        })
        return presignedUrl
    }
}