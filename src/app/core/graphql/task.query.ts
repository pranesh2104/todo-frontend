export const GET_ALL_TASKS = `query GetAllTasks {
  getAllTasks {
    comment
    createdAt
    description
    dueDate
    isCompleted
    priority
    subTasks {
      title
      updatedAt
      tags
      priority
      isCompleted
      dueDate
      description
      createdAt
      comment
    }
    tags
    title
    updatedAt
  }
}`;