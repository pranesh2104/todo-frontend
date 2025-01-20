import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CustomValidators } from '../../custom-validators/email-password.validator';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { GraphqlClientService } from '../../../../shared/services/graphql-client.service';
import { debounceTime, distinctUntilChanged, filter, of, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { IEmailCheckResponse, IOTPForm, ISignUpForm, ISignUpState, ICreateUserDetails } from '../../models/auth.model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CommonModule } from '@angular/common';
import { CommonAPIResponse, CommonResponse } from '@shared/models/shared.model';
import { AUTH_STATUS, EMAIL_PATTERN, OTP_RELATED_API_RESPONSE_CODES, PASSWORD_PATTERN } from '../../constants/auth.constant';


@Component({
  selector: 'app-sign-up',
  imports: [MatCardModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule, CommonModule],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  providers: [GraphqlClientService]
})
export class SignUpComponent implements OnInit {

  readonly AUTH_STATUS = AUTH_STATUS;

  state: ISignUpState = {
    password: {
      isVisible: false,
      isRepeatVisible: false
    },
    email: {
      status: AUTH_STATUS.EMAIL.INITIAL,
      isVerified: false,
      isChangeEnabled: false,
      isEmailAvailable: false
    },
    otp: {
      status: AUTH_STATUS.OTP.INITIAL,
      error: null as string | null,
      remainingAttempts: 3,
      isSubmitting: false,
      form: null as FormGroup | null
    }
  }

  isEmailCheckLoading: boolean = false;

  isEmailChangeEnabled: boolean = false;

  signupForm!: FormGroup<ISignUpForm>;

  isOTPResending: boolean = false;

  constructor(private authService: AuthService, private router: Router, private formBuilder: FormBuilder, private elementRef: ElementRef) { }


  readonly showOTPInput = () => this.state.otp.status === AUTH_STATUS.OTP.SENT && !this.state.email.isVerified;

  readonly showPasswordFields = () => this.state.email.isVerified;

  readonly canResendOTP = () => this.state.otp.remainingAttempts === 0;

  readonly showOTPError = () => this.state.otp.error !== null;


  ngOnInit(): void {
    this.initializeForm();
    this.setupEmailValidation();
  }

  private initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      firstName: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[a-zA-Z]/)], nonNullable: true }),
      lastName: new FormControl(''),
      email: new FormControl('', { validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)], nonNullable: true })
    });
  }

  private setupEmailValidation(): void {
    this.signupForm.get('email')?.valueChanges.pipe(debounceTime(500), distinctUntilChanged(), filter((email: string | null) => Boolean(email && this.signupForm.get('email')?.valid)),
      switchMap((email) => {
        if (!email) return of(null);
        this.state.email.status = AUTH_STATUS.EMAIL.CHECKING;
        return this.authService.checkEmailExist(email);
      })
    ).subscribe({
      next: (res: IEmailCheckResponse | null) => {
        if (res?.checkEmail) {
          const emailExists = res.checkEmail.code === 'EMAIL_EXIST';
          this.updateEmailValidationError(emailExists);
        }
      }
    });
  }

  private updateEmailValidationError(emailExists: boolean): void {
    const emailControl = this.signupForm.get('email');
    if (!emailControl) return;
    const currentErrors = emailControl.errors || {};
    this.isEmailCheckLoading = false;
    this.state.email.isEmailAvailable = !emailExists;
    if (emailExists) {
      emailControl.markAsTouched();
      emailControl.setErrors({ ...currentErrors, emailExists: true });
    } else {
      delete currentErrors['emailExists'];
      emailControl.setErrors(Object.keys(currentErrors).length ? currentErrors : null);
    }
  }

  onSendOTP(): void {
    if (this.state.otp.status === AUTH_STATUS.OTP.SENDING) return;
    const emailFormControl = this.signupForm.get('email');
    const { firstName, lastName } = this.signupForm.value;
    if (emailFormControl && emailFormControl.value && firstName && (emailFormControl.disabled ? true : emailFormControl?.valid)) {
      this.state.otp.status = AUTH_STATUS.OTP.SENDING;
      this.authService.sendEmailOTP({ email: emailFormControl.value.toLowerCase(), firstName, lastName: lastName || '' }).subscribe({
        next: () => this.handleOTPSendSuccess(),
        error: () => {
          this.state.otp.status = AUTH_STATUS.OTP.ERROR;
          this.signupForm.get('email')?.setErrors({ isOTPSendError: true });
        }
      });
    }
  }

  private handleOTPSendSuccess() {
    this.signupForm.get('email')?.disable();
    if (!this.state.otp.form) {
      this.buildOTPForm();
    }
    this.state.otp.status = AUTH_STATUS.OTP.SENT;
    this.state.email.isChangeEnabled = false;
    if (this.isOTPResending) {
      this.state.otp.remainingAttempts = 3;
      this.isOTPResending = false;
    }
    if (this.isEmailChangeEnabled) {
      this.isEmailChangeEnabled = false;
    }
  }

  onChangeEmail() {
    if (this.isEmailChangeEnabled) return;
    this.signupForm.get('email')?.enable();
    this.isEmailChangeEnabled = true;
  }

  buildOTPForm() {
    this.state.otp.form = this.formBuilder.group({
      digit0: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
      digit1: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
      digit2: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
      digit3: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
      digit4: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
      digit5: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[0-9]$/)], nonNullable: true }),
    });
  }

  get otpControls(): string[] {
    if (this.state.otp && this.state.otp.form)
      return Object.keys(this.state.otp.form.controls);
    return ['']
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    const key = event.key;

    if (!/^\d$/.test(key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(key)) {
      event.preventDefault();
      return;
    }

    if (key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      this.focusInput(index - 1);
    } else if (key === 'ArrowRight' && index < 5) {
      event.preventDefault();
      this.focusInput(index + 1);
    }

    if (key === 'Backspace') {
      if (input.value === '' && index > 0) {
        event.preventDefault();
        this.focusInput(index - 1);
        const controlName = `digit${index - 1}` as keyof IOTPForm;
        const control = this.state.otp.form?.get(controlName);
        if (control) {
          control.setValue('');
        }
      }
    }
  }

  onInput(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    if (value.length > 1) { // If user enter more than 1 number in one field.
      value = value.slice(-1);
      input.value = value;
      const controlName = `digit${index + 1}` as keyof IOTPForm;
      const control = this.state.otp.form?.get(controlName);
      if (control)
        control.setValue(value);
    }

    if (value && index < 5)
      this.focusInput(index + 1);
  }

  handlePaste(event: ClipboardEvent) {
    event.preventDefault();

    const pastedData = event.clipboardData?.getData('text');
    if (!pastedData) return;

    const numbers = pastedData.replace(/\D/g, '').slice(0, 6);

    numbers.split('').forEach((num, index) => {
      if (index < 6) {
        const controlName = `digit${index}` as keyof IOTPForm;
        const control = this.state.otp.form?.get(controlName);
        if (control) {
          control.setValue(num);
        }
      }
    });
    const focusIndex = Math.min(numbers.length, 5);
    this.focusInput(focusIndex);
  }

  private focusInput(index: number) {
    const focusInputField = this.elementRef.nativeElement.querySelector(`#otp-input-${index}`);
    if (focusInputField)
      focusInputField.focus();
  }

  getOtpValue(): string {
    return Object.values(this.state.otp.form?.value).join('');
  }

  onVerifyOTP(): void {
    if (!this.state.otp.form?.valid) return;
    const email = this.signupForm.get('email')?.value;
    const otp = this.getOtpValue();
    if (!email || !otp) return;
    this.state.otp.isSubmitting = true;
    this.authService.verifyOTP({ email, otp: otp }).subscribe({
      next: (res: CommonAPIResponse) => {
        this.handleOTPVerificationResponse(res);
      },
      error: () => {
        this.state.otp.isSubmitting = false;
        this.state.otp.status = AUTH_STATUS.OTP.ERROR;
      }
    });
  }

  private handleOTPVerificationResponse(res: CommonAPIResponse): void {
    if (res?.['verifyOTP']?.success &&
      res['verifyOTP'].code === OTP_RELATED_API_RESPONSE_CODES.OTP_VERIFIED) {
      this.setPasswordControlAndValidator();
      this.state.otp.status = AUTH_STATUS.OTP.VERIFIED;
      this.state.email.isVerified = true;
    } else if (res?.['verifyOTP']) {
      this.handleOTPError(res['verifyOTP']);
    }
    this.state.otp.isSubmitting = false;
  }

  private handleOTPError(verifyOTP: CommonResponse): void {
    switch (verifyOTP.code) {
      case OTP_RELATED_API_RESPONSE_CODES.OTP_EXPIRED:
      case OTP_RELATED_API_RESPONSE_CODES.OTP_NOT_FOUND:
        this.state.otp.error = null;
        this.state.otp.status = AUTH_STATUS.OTP.EXPIRED;
        break;
      case OTP_RELATED_API_RESPONSE_CODES.INVALID_OTP:
        this.state.otp.error = `Invalid verification code. ${verifyOTP.attempt} attempt remaining`;
        this.state.otp.remainingAttempts = Number(verifyOTP.attempt);
        break;
      case OTP_RELATED_API_RESPONSE_CODES.OTP_EXCEED:
        this.state.otp.remainingAttempts = 0;
        this.state.otp.error = null;
        break;
    }
    this.state.otp.form?.reset();
  }

  setPasswordControlAndValidator() {
    this.signupForm.addControl('password', new FormControl('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true }));
    this.signupForm.addControl('repeatPassword', new FormControl('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true }));
    this.signupForm.addValidators(CustomValidators.matchPasswordValidator());
  }

  onUserRegister() {
    if (this.signupForm.value && this.signupForm.valid) {
      const firstName = this.signupForm.value.firstName;
      const lastName = this.signupForm.value.lastName || '';
      const emailFormControl = this.signupForm.get('email');
      const password = this.signupForm.value.password;
      if (firstName && emailFormControl && emailFormControl.value && password) {
        const data = { userDetails: { firstName, lastName, email: emailFormControl.value, password } };
        this.authService.createUser(data).subscribe({
          next: (res: ICreateUserDetails) => {
            if (res && res.createUser && res.createUser.email) {
              this.authService.setRegistrationEmail(res.createUser.email);
              this.router.navigate(['/login']);
            }
          },
          error: (error) => {
            console.log('error ', error);
          }
        });
      }
    }
  }
}
