export const CREATE_USER = `
mutation CreateUser($userDetails: CreateUserDetails) {
  createUser(userDetails: $userDetails) {
    email
    firstName
    lastName
    id
  }
}`;

export const CHECK_EMAIL = `
query CheckEmail($email: String) {
  checkEmail(email: $email) {
    code
    message
  }
}`;


export const SEND_EMAIL_OTP = `
mutation SendEmailOTP($userDetails: SendEmailOTPInput!) {
  sendEmailOTP(userDetails: $userDetails) {
    message
    success
  }
}`;

export const VERIFY_OTP = `
mutation VerifyOTP($otpDetails: OTPDetails!) {
  verifyOTP(otpDetails: $otpDetails) {
    message
    success
  }
}`;