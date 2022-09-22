import { ProjectAccess } from '../dataAccess/projectAccess'
import { ProjectItem } from '../models/ProjectItem'
import { CreateProjectRequest } from '../requests/CreateProjectRequest'
import { UpdateProjectRequest } from '../requests/UpdateProjectRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TaskItem } from '../models/TaskItem'
import { CreateTaskRequest } from '../requests/CreateTaskRequest'
import { UpdateTaskRequest } from '../requests/UpdateTaskRequest'

const logger = createLogger('project-bussiness-layer')
const projectAccess = new ProjectAccess()

export const getProjects = async (userId: string): Promise<ProjectItem[]> => {
    return await projectAccess.getProjects(userId);
}

export const createProject = async (userId: string, project: CreateProjectRequest): Promise<ProjectItem> => {
    logger.log('info', 'Received project create request: '.concat(JSON.stringify(project)))
    const projectId = uuid.v4();
    const newProject: ProjectItem = {
        ...project,
        userId,
        projectId,
        projectStatus: "pending",
        tasks: [],
        createdAt: new Date().toISOString()
    }
    await projectAccess.createProject(newProject);
    return newProject;
}

export const updateProject = async (userId: string, projectId: string, updateProject: UpdateProjectRequest): Promise<void> => {
    logger.log('info', 'Received project update request: '.concat(projectId))
    await projectAccess.updateProject(userId, projectId, updateProject)
}

export const deleteProject = async (userId: string, projectId: string): Promise<void> => {
    logger.log('info', 'Received project delete request: '.concat(projectId))
    await projectAccess.deleteProject(userId, projectId)
}

export const generateUploadURL = async (userId: string, projectId: string): Promise<string> => {
    logger.log('info', 'Uploading image for project: '.concat(projectId))
    const url = await projectAccess.getUploadURL(userId, projectId)
    return url 
}

export const createTask = async (task: CreateTaskRequest, userId: string, projectId: string): Promise<ProjectItem> => {
    logger.log('info', 'Received task create request for project: '.concat(projectId))
    const taskId = uuid.v4()
    const newTask: TaskItem = {
        ...task,
        taskId,
        taskStatus:'doing'
    }
    let res = await projectAccess.createTask(newTask, userId, projectId)
    return res;
}

export const updateTask = async (updatedTask: UpdateTaskRequest, userId: string, projectId: string, taskId: string): Promise<void> => {
    logger.log('info', 'Received task create request for project: '.concat(projectId))
    await projectAccess.updateTask(updatedTask, userId, projectId, taskId)
}

export const deleteTask = async (userId: string, projectId: string, taskId: string): Promise<ProjectItem> => {
    logger.log('info', 'Received task delte request for project: '.concat(projectId))
    let res = await projectAccess.deleteTask(userId, projectId, taskId)
    return res
}
