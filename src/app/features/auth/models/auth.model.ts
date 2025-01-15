import { FormControl } from "@angular/forms";

export interface SignUpForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface CreateUserArguments {
  userDetails: UserDetailsInput;
}

interface UserDetailsInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface IUserDetails {
  email: string;
  firstName: string;
  lastName?: string | null;
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
  otp: number;
}

export interface SendEmailOTPArguments {
  email: string;
  firstName: string;
  lastName?: string;
}