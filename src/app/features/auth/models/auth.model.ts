import { FormControl, FormGroup } from "@angular/forms";

export interface CreateUserArguments {
  userDetails: UserDetailsInput;
}

interface UserDetailsInput {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface ICreateUserDetails {
  createUser: ICreateUserResponse;
}

interface ICreateUserResponse {

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
  otp: string;
}

export interface SendEmailOTPArguments {
  email: string;
  firstName: string;
  lastName?: string;
}

export interface ISignUpForm {
  firstName: FormControl<string>;
  lastName: FormControl<string | null>
  email: FormControl<string>
  password?: FormControl<string | null>
  repeatPassword?: FormControl<string | null>
}

export interface ISignUpState {
  password: {
    isVisible: boolean;
    isRepeatVisible: boolean;
  };
  email: {
    status: string;
    isVerified: boolean;
    isChangeEnabled: boolean;
    isEmailAvailable: boolean;
  };
  otp: {
    status: string;
    error: string | null;
    remainingAttempts: number;
    isSubmitting: boolean;
    form: FormGroup | null;
  };
}