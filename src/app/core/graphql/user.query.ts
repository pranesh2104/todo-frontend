export const GET_ALL_USER = `
query GetAllUsers {
  getAllUsers {
    name
    email
    updatedAt
  }
}`;

export const GET_CURRENT_USER = `
query GetOneUser {
  getOneUser {
    email
    name
    updatedAt
  }
}`;

export const UPDATE_SESSION_TOKEN = `
mutation RotateAuthTokens {
  rotateAuthTokens {
    success
  }
}`;