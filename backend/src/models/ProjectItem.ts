import { TaskItem } from "./TaskItem"

export interface ProjectItem {
  userId: string
  projectId: string
  title: string
  description: string
  priority: string
  projectStatus: string
  createdAt: string
  tasks?: TaskItem[]
  attachmentUrl?: string
}
