import { History } from 'history'
import * as React from 'react'
import {
  Form,
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Loader,
  Modal
} from 'semantic-ui-react'

import { createProject, deleteProject, getProjects, createTask, deleteTask } from '../api/projects-api'
import Auth from '../auth/Auth'
import { Project } from '../types/Project'

interface ProjectsProps {
  auth: Auth
  history: History
}

interface ProjectsState {
  projects: Project[]
  newTitle: string
  newPriority: string
  newDescription: string
  loadingProjects: boolean
  modalIsShow: boolean
  projectId: string
  todo: string
  assignedTo: string
  dueDate: string
  taskPriority: string
}

export class Projects extends React.PureComponent<ProjectsProps, ProjectsState> {
  state: ProjectsState = {
    projects: [],
    newTitle: '',
    newPriority: '',
    newDescription: '',
    loadingProjects: true,
    modalIsShow: false,
    projectId: '',
    todo: '',
    assignedTo: '',
    dueDate: '',
    taskPriority: 'low',
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTitle: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newDescription: event.target.value })
  }

  handlePriorityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newPriority: event.target.value })
  }

  handleTodoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ todo: event.target.value })
  }

  handleAssignedToChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ assignedTo: event.target.value })
  }

  handleDueDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ dueDate: event.target.value })
  }

  handleTaskPriorityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ taskPriority: event.target.value })
  }

  onEditButtonClick = (projectId: string) => {
    this.props.history.push(`/projects/${projectId}/edit`)
  }

  onProjectCreate = async () => {
    try {
      const newProject = await createProject(this.props.auth.getIdToken(), {
        title: this.state.newTitle,
        description: this.state.newDescription,
        priority: this.state.newPriority
      })
      this.setState({
        projects: [...this.state.projects, newProject],
        newTitle: '',
        newPriority: '',
        newDescription: ''
      })
    } catch (err) {
      console.log(err)
      alert('Project creation failed')
    }
  }

  onProjectDelete = async (projectId: string) => {
    try {
      await deleteProject(this.props.auth.getIdToken(), projectId)
      this.setState({
        projects: this.state.projects.filter(project => project.projectId !== projectId)
      })
    } catch (err) {
      console.log(err)
      alert('Project deletion failed')
    }
  }

  onTaskCreate = async () => {
    try {
      const newProject = await createTask(this.props.auth.getIdToken(), {
        todo: this.state.todo,
        assignedTo: this.state.assignedTo,
        dueDate: this.state.dueDate,
        priority: this.state.taskPriority
      }, this.state.projectId)
      console.log(newProject)
      this.setState({
        projects: [...this.state.projects.filter(project => project.projectId !== newProject.projectId), newProject],
        newTitle: '',
        newPriority: '',
        newDescription: '',
        projectId: '',
        todo: '',
        assignedTo: '',
        dueDate: '',
        taskPriority: 'low',
        modalIsShow: false
      })
    } catch (err) {
      console.log(err)
      alert('Task creation failed')
    }
  }

  onTaskDelete = async (projectId: string, taskId: string) => {
    try {
      console.log(this.props.auth.getIdToken())
      let updatedProject = await deleteTask(this.props.auth.getIdToken(), projectId, taskId)
      this.setState({
        projects: [...this.state.projects.filter(project => project.projectId !== updatedProject.projectId), updatedProject]
      })
    } catch (err) {
      console.log(err)
      alert(`Task deletion failed: ${(err as Error).message}`)
    }
  }

  async componentDidMount() {
    try {
      const projects = await getProjects(this.props.auth.getIdToken())
      this.setState({
        projects,
        loadingProjects: false
      })
    } catch (err) {
      console.log(err)
      alert(`Failed to fetch todos: ${(err as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Projects</Header>
        {this.renderCreateProjectInput()}
        {this.renderModal()}
        {this.renderProjects()}
      </div>
    )
  }

  renderCreateProjectInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Form>
            <Form.Field>
              <label>Title</label>
              <input placeholder='Tree house project, ...' onChange={this.handleTitleChange} />
            </Form.Field>
            <Form.Field>
              <label>Description</label>
              <input placeholder='Funny project for kids' onChange={this.handleDescriptionChange} />
            </Form.Field>
            <Form.Field>
              <label>Priority</label>
              <input placeholder='High, Low, ...' onChange={this.handlePriorityChange} />
            </Form.Field>
            <Button type='submit' primary onClick={this.onProjectCreate}>Create</Button>
          </Form>
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderModal() {
    return (
      <Modal
        open={this.state.modalIsShow}
      >
        <Modal.Header>Add task</Modal.Header>
        <Modal.Content image>
          <Modal.Description>
            <Form>
              <Form.Field>
                <label>To do</label>
                <input placeholder='Ex: Buy stuff, ...' onChange={this.handleTodoChange} />
              </Form.Field>
              <Form.Field>
                <label>Assign To</label>
                <input placeholder='Ex: Jimmy' onChange={this.handleAssignedToChange} />
              </Form.Field>
              <Form.Field>
                <label>Due date</label>
                <input type='date' onChange={this.handleDueDateChange} />
              </Form.Field>
              <Form.Field>
                <label>Priority</label>
                <select onChange={this.handleTaskPriorityChange}>
                  <option value='low'>Low</option>
                  <option value='high'>High</option>
                </select>
              </Form.Field>
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={() => this.setState({ modalIsShow: false, projectId: '' })}>
            Cancel
          </Button>
          <Button
            type='submit'
            content="Create"
            labelPosition='right'
            icon='add'
            onClick={() => this.onTaskCreate()}
            positive
          />
        </Modal.Actions>
      </Modal>
    )
  }

  renderProjects() {
    if (this.state.loadingProjects) {
      return this.renderLoading()
    }
    return this.renderProjectsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Projects
        </Loader>
      </Grid.Row>
    )
  }

  renderProjectItem(project: Project) {

  }

  renderProjectsList() {
    return (
      <Grid padded>
        <Grid.Row key={Math.random()}>
          <Grid.Column width={4} verticalAlign="middle"><b>Title</b></Grid.Column>
          <Grid.Column width={4} verticalAlign="middle"><b>Description</b></Grid.Column>
          <Grid.Column width={3} verticalAlign="middle"><b>Priority</b></Grid.Column>
          <Grid.Column width={2} verticalAlign="middle"><b>Report</b></Grid.Column>
          <Grid.Column width={3} verticalAlign="middle"><b>Actions</b></Grid.Column>
        </Grid.Row>
        {this.state.projects.map((project, pos) => {
          return (
            <>
              <Grid.Row key={project.projectId}>
                <Grid.Column width={4} verticalAlign="middle">
                  {project.title}
                </Grid.Column>
                <Grid.Column width={4} floated="right" verticalAlign="middle">
                  {project.description}
                </Grid.Column>
                <Grid.Column width={3} floated="right" verticalAlign="middle">
                  {project.priority}
                </Grid.Column>
                <Grid.Column width={2} floated="right" verticalAlign="middle">
                  {project.attachmentUrl ?
                    <a href={project.attachmentUrl}>Download</a> :
                    'N/A'
                  }
                </Grid.Column>
                <Grid.Column width={1} floated="right" verticalAlign="middle">
                  <Button
                    icon
                    color="blue"
                    onClick={() => this.onEditButtonClick(project.projectId)}
                  >
                    <Icon name="pencil" />
                  </Button>
                </Grid.Column>
                <Grid.Column width={1} floated="right" verticalAlign="middle">
                  <Button
                    icon
                    color="red"
                    onClick={() => this.onProjectDelete(project.projectId)}
                  >
                    <Icon name="delete" />
                  </Button>
                </Grid.Column>
                <Grid.Column width={1} floated="right" verticalAlign="middle">
                  <Button
                    icon
                    color="green"
                    onClick={() => this.setState({ modalIsShow: true, projectId: project.projectId })}
                  >
                    <Icon name="add" />
                  </Button>
                </Grid.Column>
                {project.tasks ?
                  (
                    <>
                      <Grid.Column width={3}></Grid.Column>
                      <Grid.Column width={13}><Divider /></Grid.Column>
                      <Grid.Column width={3}></Grid.Column>
                      <Grid.Column width={1}></Grid.Column>
                      <Grid.Column width={2}><b>Todo</b></Grid.Column>
                      <Grid.Column width={2}><b>Assigned to</b></Grid.Column>
                      <Grid.Column width={2}><b>Due date</b></Grid.Column>
                      <Grid.Column width={2}><b>Priority</b></Grid.Column>
                      <Grid.Column width={2}><b>Status</b></Grid.Column>
                      <Grid.Column width={2}><b>Action</b></Grid.Column>
                      {
                        project.tasks?.map(task => {
                          return (
                            <>
                              <Grid.Column width={3}></Grid.Column>
                              <Grid.Column width={1}><Icon name="tasks" /></Grid.Column>
                              <Grid.Column width={2}>{task.todo}</Grid.Column>
                              <Grid.Column width={2}>{task.assignedTo}</Grid.Column>
                              <Grid.Column width={2}>{task.dueDate}</Grid.Column>
                              <Grid.Column width={2}>{task.priority}</Grid.Column>
                              <Grid.Column width={2}>{task.taskStatus}</Grid.Column>
                              <Grid.Column width={2}>
                                <Button
                                  icon
                                  size='mini'
                                  color="red"
                                onClick={() => this.onTaskDelete(project.projectId, task.taskId)}
                                >
                                  <Icon name="delete" />
                                </Button>
                              </Grid.Column>
                            </>
                          )
                        })
                      }
                    </>
                  ) : <></>}
                <Grid.Column width={16}>
                  <Divider />
                </Grid.Column>
              </Grid.Row>
            </>
          )
        })}
      </Grid>
    )
  }
}
