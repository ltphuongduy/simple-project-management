import { Task } from "./Task"

export interface Project {
    userId: string
    projectId: string
    title: string
    description: string
    priority: string
    projectStatus: string
    createdAt: string
    tasks?: Task[]
    attachmentUrl?: string
  }