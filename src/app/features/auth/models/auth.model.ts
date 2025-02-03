import { FormControl } from "@angular/forms";
import { IAuthTokens } from "@core/models/core.model";

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
  code: 'EMAIL_EXIST' | 'EMAIL_NOT_EXIST';
  message: string;
  success: true;
}

export interface VerifyOTPArguments {
  email: string;
  otp: string;
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
  isEmailAvailable: boolean;
}

interface IOTPCommonState {
  status: string;
  error: string | null;
  remainingAttempts: number;
  isSubmitting: boolean;
  isDisabled: boolean;
}
export interface UpdatePasswordArguments {
  email: string;
  password: string;
  token: string;
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
  tokens: IAuthTokens;
}

export interface IGetOneUserResponse {
  getOneUser: IUserReponse;
}
export interface IUserReponse {
  email: string;
  name: string;
  updatedAt: string;
}