import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { AUTH_STATUS, EMAIL_PATTERN, PASSWORD_PATTERN } from '../../constants/auth.constant';
import { AuthService } from '../../services/auth.service';
import { CustomValidators } from '../../custom-validators/email-password.validator';
import { IEmailCheckResponse, IEmailCommonState, IResetForm } from '../../models/auth.model';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize, interval, Subscription, takeWhile } from 'rxjs';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { DividerModule } from 'primeng/divider';

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, Toast, DividerModule, FormsModule, CommonModule, IconField, InputIcon, InputText, Message, Password, Button],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [MessageService]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  /**
   * Store the email states.
   * @type {IEmailCommonState}
   */
  emailState: IEmailCommonState = {
    status: AUTH_STATUS.EMAIL.INITIAL,
    isEmailRegistered: false
  }
  /**
   * Store the token.
   * @type {string}
   */
  private token!: string;
  /**
   * Indicate whether Password link is sended or not.
   * @type {boolean} 
   */
  isPasswordLinkSended: boolean = false;

  isVerifyingPage: boolean = false;

  timer = 10;

  AUTH_STATUS = AUTH_STATUS;

  isPasswordUpdated: boolean = false;

  private timerSubscription: Subscription = new Subscription();

  private subscriptions = new Subscription();
  /**
   * Stores the Reset Form control.
   * @type {FormGroup<IResetForm>}
   */
  resetForm: FormGroup<IResetForm> = new FormGroup({
    userEmail: new FormControl<string>('', {
      validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)], nonNullable: true,
      asyncValidators: CustomValidators.checkEmailAvailability(this.authService,
        { setCheckingState: (checkState: string) => this.emailState.status = checkState },
        { setEmailRegisterState: (isEmailRegistered: boolean) => { this.emailState.isEmailRegistered = isEmailRegistered; } },
        false)
    }),
    password: new FormControl<string>('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true }),
    repeatPassword: new FormControl<string>('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true })
  }, { validators: [CustomValidators.matchPasswordValidator()] });

  constructor(private activeRoute: ActivatedRoute, private authService: AuthService, @Inject(PLATFORM_ID) private platformId: object, private router: Router, private toastMessageService: MessageService) { }

  ngOnInit(): void {
    this.subscriptions.add(this.activeRoute.queryParams.subscribe((queryParams: Params) => {
      if (queryParams && queryParams['email'] && !queryParams['token']) {
        this.handleParamEmail(queryParams['email'])
      }
      else if (queryParams && queryParams['token'] && queryParams['email']) {
        this.isVerifyingPage = true;
        this.token = queryParams['token'];
        this.resetForm.get('userEmail')?.setValue(queryParams['email']);
        this.resetForm.get('userEmail')?.disable();
      }
    }));
  }

  private handleParamEmail(email: string) {
    this.isVerifyingPage = false;
    this.resetForm.get('userEmail')?.setValue(email);
    this.resetForm.get('userEmail')?.updateValueAndValidity();
    this.subscriptions.add(this.authService.checkEmailAvailable(email).subscribe({
      next: (checkEmailResponse: IEmailCheckResponse) => {
        if (checkEmailResponse && checkEmailResponse.checkEmail && checkEmailResponse.checkEmail.code === 'EMAIL_REGISTERED') {
          this.emailState.isEmailRegistered = true;
        }
      }
    }));
  }

  onReset() {
    this.emailState.status = AUTH_STATUS.EMAIL.SENDING;
    const userEmailFormControl = this.resetForm.get('userEmail');
    if (userEmailFormControl && userEmailFormControl.valid && userEmailFormControl.value) {
      this.subscriptions.add(this.authService.sendResetPasswordLink<ICommonAPIResponse>(userEmailFormControl.value).subscribe({
        next: (res: ICommonAPIResponse) => {
          if (res && res['sendEmailResetPasswordLink'] && res['sendEmailResetPasswordLink'].success) {
            this.isPasswordLinkSended = true;
            this.startRedirectTimer();
            this.emailState.status = AUTH_STATUS.EMAIL.SENT;
          }
        },
        error: () => {
          this.isPasswordLinkSended = false;
          this.resetForm.get('userEmail')?.setErrors({ sendMailFailed: true });
        }
      }));
    }
  }

  private startRedirectTimer() {
    if (isPlatformBrowser(this.platformId)) {
      this.timerSubscription = interval(1000).pipe(takeWhile(() => this.timer > 0), finalize(() => this.onRedirect())).subscribe(() => { this.timer--; });
    }
  }

  onRedirect() {
    this.router.navigate(['../signin']);
  }

  onUpdatePassword() {
    const passwordFormControl = this.resetForm.get('password');
    const repeatPasswordFormControl = this.resetForm.get('repeatPassword');
    const userEmailFormControl = this.resetForm.get('userEmail');
    if (userEmailFormControl && passwordFormControl && repeatPasswordFormControl && passwordFormControl.valid && repeatPasswordFormControl.valid && userEmailFormControl.value && passwordFormControl.value) {
      this.subscriptions.add(this.authService.updatePassword<ICommonAPIResponse>({ passwordDetails: { email: userEmailFormControl.value, password: passwordFormControl.value, token: this.token } }).subscribe({
        next: (res: ICommonAPIResponse) => {
          if (res && res['updatePassword'] && res['updatePassword'].success) {
            this.toastMessageService.add({ severity: 'success', summary: 'Password Updated', detail: 'Your Password has been updated successfully!', life: 3000 });
            this.isPasswordUpdated = true;
            this.startRedirectTimer();
          }
        },
        error: () => {
          this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong! Please try again later', life: 3000 });
          this.isPasswordUpdated = false;
        }
      }));
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription)
      this.timerSubscription.unsubscribe();
    if (this.subscriptions)
      this.subscriptions.unsubscribe();
  }
}
