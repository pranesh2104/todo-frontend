import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../custom-validators/email-password.validator';
import { AuthService } from '../../services/auth.service';
import { GraphqlClientService } from '../../../../shared/services/graphql-client.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { ISignUpForm, ISignUpState, ICreateUserDetails } from '../../models/auth.model';
import { CommonModule } from '@angular/common';
import { ICommonAPIResponse, ICommonSuccessResponse } from '@shared/models/shared.model';
import { AUTH_STATUS, EMAIL_PATTERN, OTP_RELATED_API_RESPONSE_CODES, PASSWORD_PATTERN } from '../../constants/auth.constant';
import { CardModule } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { MessageService } from 'primeng/api';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { InputOtp } from 'primeng/inputotp';
import { Toast } from 'primeng/toast';
import { finalize, interval, Subscription, takeWhile } from 'rxjs';
import { CoreAuthService } from '@core/services/core-auth.service';

@Component({
  selector: 'app-sign-up',
  imports: [Button, Toast, CardModule, ReactiveFormsModule, CommonModule, InputText, Message, IconField, InputIcon, Password, FormsModule, InputOtp],
  templateUrl: './sign-up.component.html',
  styleUrl: './sign-up.component.scss',
  providers: [GraphqlClientService, MessageService]
})
export class SignUpComponent implements OnInit {

  readonly AUTH_STATUS = AUTH_STATUS;

  state: ISignUpState = {
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
      isDisabled: false
    }
  }

  isEmailChangeEnabled: boolean = false;

  signupForm!: FormGroup<ISignUpForm>;

  isOTPResending: boolean = false;

  timer = 15;

  constructor(private authService: AuthService, private formBuilder: FormBuilder, private activeRoute: ActivatedRoute, private toastMessageService: MessageService, private router: Router) { }

  readonly showOTPInput = () => this.state.otp.status === AUTH_STATUS.OTP.SENT && !this.state.email.isVerified;

  readonly showPasswordFields = () => this.state.email.isVerified;

  readonly canResendOTP = () => this.state.otp.remainingAttempts === 0;

  readonly showOTPError = () => this.state.otp.error !== null;

  private timerSubscription: Subscription = new Subscription();

  private observableSubscription: Subscription = new Subscription();

  private readonly coreAuthService = inject(CoreAuthService);

  ngOnInit(): void {
    this.initializeForm();
    this.observableSubscription.add(this.activeRoute.queryParams.subscribe((queryParams: Params) => {
      if (queryParams && queryParams['email']) {
        this.signupForm.get('email')?.setValue(queryParams['email']);
      }
    }));
  }

  private initializeForm(): void {
    this.signupForm = this.formBuilder.group({
      name: new FormControl('', { validators: [Validators.required, Validators.pattern(/^[a-zA-Z]+$/)], nonNullable: true }),
      email: new FormControl('', {
        validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)], nonNullable: true,
        asyncValidators: CustomValidators.checkEmailExist(this.authService,
          { setCheckingState: (checkState: string) => this.state.email.status = checkState },
          { setEmailExistState: (emailExistState: boolean) => this.state.email.isEmailAvailable = emailExistState },
          true
        )
      }),
      otp: new FormControl(),
      password: new FormControl('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true }),
      repeatPassword: new FormControl('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true })
    });
    this.signupForm.get('otp')?.addValidators(Validators.pattern(/^\d{6}$/));
    this.signupForm.addValidators(CustomValidators.matchPasswordValidator())
  }

  onSendOTP(): void {
    if (this.state.otp.status === AUTH_STATUS.OTP.SENDING) return;
    const emailFormControl = this.signupForm.get('email');
    const nameFormControl = this.signupForm.get('name');
    if (emailFormControl && emailFormControl.value && nameFormControl && nameFormControl.value && (emailFormControl.disabled ? true : emailFormControl?.valid)) {
      this.state.otp.status = AUTH_STATUS.OTP.SENDING;
      this.observableSubscription.add(this.authService.sendEmailOTP({ email: emailFormControl.value.toLowerCase(), name: nameFormControl.value }).subscribe({
        next: () => this.handleOTPSendSuccess(),
        error: () => {
          this.state.otp.status = AUTH_STATUS.OTP.ERROR;
          this.signupForm.get('email')?.setErrors({ isOTPSendError: true });
        }
      }));
    }
    else {
      if (emailFormControl && !emailFormControl.value)
        emailFormControl.markAsDirty();
      if (nameFormControl && !nameFormControl.value)
        nameFormControl.markAsDirty();
    }
  }

  private handleOTPSendSuccess() {
    this.state.otp.isDisabled = false;
    this.signupForm.get('email')?.disable();
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

  onVerifyOTP(): void {
    const otpFormControl = this.signupForm.get('otp');
    const email = this.signupForm.get('email')?.value;
    if (otpFormControl && otpFormControl.value && otpFormControl.value.toString().length == 6 && email) {
      this.state.otp.isSubmitting = true;
      this.observableSubscription.add(this.authService.verifyOTP({ email, otp: otpFormControl.value.toString() }).subscribe({
        next: (res: ICommonAPIResponse) => {
          this.handleOTPVerificationResponse(res);
        },
        error: () => {
          this.state.otp.isSubmitting = false;
          this.state.otp.status = AUTH_STATUS.OTP.ERROR;
        }
      }));
    }
    else {
      this.state.otp.error = `Please enter the OTP to proceed.`;
    }
  }

  private handleOTPVerificationResponse(res: ICommonAPIResponse): void {
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

  private handleOTPError(verifyOTP: ICommonSuccessResponse): void {
    switch (verifyOTP.code) {
      case OTP_RELATED_API_RESPONSE_CODES.OTP_EXPIRED:
      case OTP_RELATED_API_RESPONSE_CODES.OTP_NOT_FOUND:
        this.state.otp.error = null;
        this.state.otp.isDisabled = true;
        this.state.otp.status = AUTH_STATUS.OTP.EXPIRED;
        break;
      case OTP_RELATED_API_RESPONSE_CODES.INVALID_OTP:
        this.state.otp.error = `Invalid verification code. ${verifyOTP.attempt} attempt remaining`;
        this.state.otp.remainingAttempts = Number(verifyOTP.attempt);
        break;
      case OTP_RELATED_API_RESPONSE_CODES.OTP_EXCEED:
        this.state.otp.remainingAttempts = 0;
        this.state.otp.error = null;
        this.state.otp.isDisabled = true;
        break;
    }
    this.signupForm.get('otp')?.reset();
  }

  setPasswordControlAndValidator() {
    this.signupForm.addControl('password', new FormControl('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true }));
    this.signupForm.addControl('repeatPassword', new FormControl('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true }));
    this.signupForm.addValidators(CustomValidators.matchPasswordValidator());
  }

  onUserRegister() {
    if (this.signupForm.value && this.signupForm.valid) {
      const name = this.signupForm.value.name;
      const emailFormControl = this.signupForm.get('email');
      const password = this.signupForm.value.password;
      if (name && emailFormControl && emailFormControl.value && password) {
        const data = { userDetails: { name, email: emailFormControl.value, password } };
        this.observableSubscription.add(this.authService.createUser(data).subscribe({
          next: (res: ICreateUserDetails) => {
            if (res && res.createUser && res.createUser.user) {
              this.coreAuthService.setAccessToken(res.createUser.tokens.accessToken);
              this.coreAuthService.user.next(res.createUser.user);
              this.showRegistrationSuccessToast();
            }
          },
          error: (error) => {
            console.log('error ', error);
          }
        }));
      }
    }
  }

  showRegistrationSuccessToast() {
    this.toastMessageService.add({ key: 'registrationSuccess', sticky: true, severity: 'custom' });
    this.timerSubscription = interval(1000).pipe(takeWhile(() => this.timer > 0), finalize(() => this.onRedirect('dashboard'))).subscribe(() => { this.timer--; });
  }

  onRedirect(text: string) {
    console.log('text ', text);
    text = '/' + text;
    setTimeout(() => {
      this.toastMessageService.clear('registrationSuccess');
      this.router.navigate([text]);
    }, 500);
  }

  onClose(event: any) {
    console.log('event ', event);
  }

  ngOnDestroy(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
    if (this.observableSubscription) {
      this.observableSubscription.unsubscribe();
    }
  }
}
