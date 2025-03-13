export const GET_ALL_TASKS_TAGS = `query GetAllTasksAndTags {
  getAllTasks {
    id
    title
    comment
    description
    dueDate
    isCompleted
    priority
    subTasks {
      id
      title
      comment
      priority
      isCompleted
      dueDate
      description
      updatedAt
      createdAt
    }
    tags {
      name
      color
    }
    updatedAt
    createdAt
  }
  getAllTags {
    id
    color
    name
  }
}`;

export const CREATE_TASK = `mutation CreateTask($taskDetails: CreateTaskInput) {
  createTask(taskDetails: $taskDetails) {
    code
    message
    success
    task {
      id
      comment
      description
      createdAt
      dueDate
      isCompleted
      priority
      tags {
        name
        color
      }
      title
      updatedAt
      subTasks {
        id
        comment
        createdAt
        description
        dueDate
        isCompleted
        priority
        title
        updatedAt
      }
    }
  }
}`;

export const CREATE_TAG = `mutation CreateTag($tagDetails: CreateTagInput) {
  createTag(tagDetails: $tagDetails) {
    success
    message
    code
    tag {
      id
      name
      color
    }
  }
}`

export const UPDATE_TASK = `mutation UpdateTask($updateTaskDetails: UpdateTaskInput) {
  updateTask(updateTaskDetails: $updateTaskDetails) {
    success
    message
    code
    task {
      updatedAt
      title
      tags {
        name
        color
      }
      subTasks {
        priority
        isCompleted
        id
        dueDate
        description
        createdAt
        comment
        updatedAt
        title
      }
      priority
      isCompleted
      id
      dueDate
      description
      createdAt
      comment
    }
  }
}`;


export const DELETE_TASK = `mutation DeleteTask($taskId: String) {
  deleteTask(taskId: $taskId) {
    message
    code
    success
  }
}`;