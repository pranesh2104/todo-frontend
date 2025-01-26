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
  createUser: ICreateUserResponse;
}

interface ICreateUserResponse {

  email: string;
  name: string;
  id: number;
}
export interface IEmailCheckResponse {
  checkEmail: ICheckEmail;
}

interface ICheckEmail {
  code: 'EMAIL_EXIST' | 'EMAIL_NOT_EXIST';
  message: string;
}

export interface IOTPForm {
  digit0: FormControl<string>;
  digit1: FormControl<string>;
  digit2: FormControl<string>;
  digit3: FormControl<string>;
  digit4: FormControl<string>;
  digit5: FormControl<string>;
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