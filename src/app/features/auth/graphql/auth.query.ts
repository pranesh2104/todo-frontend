export const CREATE_USER = `
mutation CreateUser($userDetails: CreateUserDetails) {
  createUser(userDetails: $userDetails) {
    user {
      email
      name
      updatedAt
    }
  }
}`;

export const CHECK_EMAIL = `
query CheckEmail($email: String) {
  checkEmail(email: $email) {
    code
    message
    success
  }
}`;


export const SEND_EMAIL_OTP = `
mutation SendEmailOTP($userDetails: SendEmailOTPInput!) {
  sendEmailOTP(userDetails: $userDetails) {
    message
    success
    code
  }
}`;

export const VERIFY_OTP = `
mutation VerifyOTP($otpDetails: OTPDetails!) {
  verifyOTP(otpDetails: $otpDetails) {
    message
    success
    code
    attempt
  }
}`;

export const SEND_RESET_PASSWORD_LINK = `
mutation SendEmailResetPasswordLink($email: String) {
  sendEmailResetPasswordLink(email: $email) {
    code
    message
    success
  }
}`;


export const UPDATE_PASSWORD = `
mutation UpdatePassword($passwordDetails: UpdatePasswordInput) {
  updatePassword(passwordDetails: $passwordDetails) {
    message
    code
    success
  }
}`;

export const LOGIN = `
mutation Login {
  login {
    user {
      email
      name
      updatedAt
    }
  }
}`;