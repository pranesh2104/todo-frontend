import { FormControl } from "@angular/forms";

export interface CreateUserArguments {
  userDetails: UserDetailsInput;
}

interface UserDetailsInput {
  name: string;
  email: string;
  password: string;
}

export interface ICreateUserDetails {
  createUser: ILoginResponse;
}

export interface IEmailCheckResponse {
  checkEmail: ICheckEmail;
}

interface ICheckEmail {
  code: 'EMAIL_REGISTERED' | 'EMAIL_NOT_REGISTERED';
  message: string;
  success: true;
}

export interface IVerifyOTPArguments {
  otpDetails: {
    email: string;
    otp: string;
  }
}

export interface SendEmailOTPArguments {
  email: string;
  name: string;
}

export interface ISignUpForm {
  name: FormControl<string>;
  email: FormControl<string>;
  otp: FormControl<number | null>;
  password: FormControl<string>;
  repeatPassword: FormControl<string>;
}

export interface ISignUpState {
  email: IEmailCommonState;
  otp: IOTPCommonState;
}

export interface IEmailCommonState {
  status: string;
  isVerified?: boolean;
  isChangeEnabled?: boolean;
  isEmailRegistered: boolean;
}

interface IOTPCommonState {
  status: string;
  error: string | null;
  remainingAttempts: number;
  isSubmitting: boolean;
  isDisabled: boolean;
}
export interface IUpdatePasswordArguments {
  passwordDetails: {
    email: string;
    password: string;
    token: string;
  }
}

export interface IResetForm {
  userEmail: FormControl<string>;
  password: FormControl<string>;
  repeatPassword: FormControl<string>;
}


export interface ILoginSuccessResponse {
  login: ILoginResponse;
}

export interface ILoginResponse {
  user: IUserReponse;
}

export interface IGetOneUserResponse {
  getOneUser: IUserReponse;
}
export interface IUserReponse {
  email: string;
  name: string;
  updatedAt: string;
}

export interface IVerifyOTPResponse {
  attempt: string;
}