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

export const GET_ACCESS_TOKEN = `
mutation RefreshAccessToken {  
  refreshAccessToken { 
   accessToken 
  } 
}`;