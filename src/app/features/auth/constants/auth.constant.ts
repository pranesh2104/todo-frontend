export const EMAIL_PATTERN = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
// One Uppercase, one lowercase, one number, one special character,min 8 characters
export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const OTP_RELATED_API_RESPONSE_CODES = {
  OTP_SUCCESS: 'OTP_SENDED_SUCCESSFULLY',
  OTP_FAILED: 'OTP_SENDING_FAILED',
  OTP_NOT_FOUND: 'OTP_NOT_FOUND',
  OTP_EXPIRED: 'OTP_EXPIRED',
  INVALID_OTP: 'OTP_INVALID',
  OTP_VERIFIED: 'OTP_VERIFIED',
  OTP_EXCEED: 'OTP_ATTEMPT_EXCEED'
}

export enum SIGNIN_API_RESPONSE_CODE {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  PASSWORD_MISMATCH = 'PASSWORD_MISMATCH',
  LOGIN_FAILED = 'LOGIN_FAILED'
}
export const AUTH_STATUS = {
  OTP: {
    INITIAL: 'INITIAL',
    SENDING: 'SENDING',
    SENT: 'SENT',
    VERIFIED: 'VERIFIED',
    ERROR: 'ERROR',
    EXPIRED: 'EXPIRED'
  },
  EMAIL: {
    INITIAL: 'INITIAL',
    CHECKING: 'CHECKING',
    VALID: 'VALID',
    INVALID: 'INVALID',
    CHECKED: 'CHECKED',
    FAILED: 'FAILED',
    SENDING: 'SENDING',
    SENT: 'SENT'
  }
}