# simple-project-management
Capstone Project - Serverless - Udacity Cloud Developer

## Description
This application is a simple project management application that allow users to register their projects to use manage their project.
The application include with both serverless back-end and front-end modules.

## Note
This project is based on the starter code of project-04 in `cloud-developer` repository provided in Udacity Cloud Developer course.
All the deployment and run steps are similar to the project Serverless Application.

## Usage
### 1. Start-up client at local
Clone the repository to your local machine, then cd to `./client`, run the client service with command:

`npm run start`

After the UI started successfully on local machine, the new browser windows will be automatically show up with URL: `http://localhost:3000/`

At the first time use, user need to register for their account and login with that credential before registering any of their projects.

### 2. Register new project
To register new project, all the fields below should be provided:

- Title: Title of the project
- Description: Brief description of the project
- Priority: Priority of the project (high, low, ...)

You can also delete the project by clicking the big red button.

### 3. Create/Delete task for project
Each project will have one or more tasks, which can be created by pressing the green button with plus icon.
To create new task for project, all the fields below should be provided:

- To do: describe the thing that need to be done
- Assigned to: assign the task to specific person
- Due date: set the deadline for the task
- Priority: priority of the task

You can also delete the task by clicking on the red button at the end of each task row.

### 4. Upload project report
This action is done by clicking on the blue button and provide the report file. This file will then be uploaded to S3 bucket and ready for download any time at the "Report" column in the project list. If "N/A" is shown, this project has no report uploaded.

Note that all the field are not allowed to start with spaces and minimum length should be 2.

### 5. Note

- All the field need to be input with string with minimum length of 2 and no spacing allowed at the beginning.
- Due to it's running out of my time, I only provided with create new project/task and editing the project attachment on the UI, but backend services have all the features for create/read/update/delete project and task.