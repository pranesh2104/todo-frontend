import { Component, Inject, inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { AUTH_STATUS, EMAIL_PATTERN, PASSWORD_PATTERN } from '../../constants/auth.constant';
import { AuthService } from '../../services/auth.service';
import { CustomValidators } from '../../custom-validators/email-password.validator';
import { IEmailCommonState } from '../../models/auth.model';
import { ICommonAPIResponse } from '@shared/models';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { finalize, interval, Subscription, takeWhile } from 'rxjs';
import { CardModule } from 'primeng/card';
import { Button } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

interface IResetPasswordState {
  email: IEmailCommonState;
}
@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink, Toast, CommonModule, CardModule, IconField, InputIcon, InputText, Message, Password, Button],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  providers: [MessageService]
})
export class ResetPasswordComponent implements OnInit, OnDestroy {


  state: IResetPasswordState = {
    email: {
      status: AUTH_STATUS.EMAIL.INITIAL,
      isEmailAvailable: false
    }
  }

  token!: string;

  isPasswordLinkSended: boolean = false;

  resetForm = new FormGroup({
    userEmail: new FormControl<string>('', {
      validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)], nonNullable: true,
      asyncValidators: CustomValidators.checkEmailExist(this.authService,
        { setCheckingState: (checkState: string) => this.state.email.status = checkState },
        { setEmailExistState: (emailExistState: boolean) => { this.state.email.isEmailAvailable = emailExistState } },
        false)
    }),
    password: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_PATTERN)]),
    repeatPassword: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_PATTERN)])
  }, { validators: [CustomValidators.matchPasswordValidator()] })

  selectedEmail!: string;

  private readonly route = inject(ActivatedRoute);

  isVerifyingPage: boolean = false;

  timer = 10;

  AUTH_STATUS = AUTH_STATUS;

  isPasswordUpdated: boolean = false;

  private timerSubscription!: Subscription;

  constructor(private authService: AuthService, @Inject(PLATFORM_ID) private platformId: object, private router: Router, private toastMessageService: MessageService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams: Params) => {
      if (queryParams && queryParams['email'] && !queryParams['token']) {
        this.isVerifyingPage = false;
        this.selectedEmail = queryParams['email'];
        this.resetForm.get('userEmail')?.setValue(this.selectedEmail);
      }
      else if (queryParams && queryParams['token'] && queryParams['email']) {
        this.isVerifyingPage = true;
        this.token = queryParams['token'];
        this.resetForm.get('userEmail')?.setValue(queryParams['email']);
        this.resetForm.get('userEmail')?.disable();
      }
    });
  }

  onReset() {
    const userEmailFormControl = this.resetForm.get('userEmail');
    console.log('userEmailFormControl ', userEmailFormControl?.valid);
    if (userEmailFormControl && userEmailFormControl.valid && userEmailFormControl.value) {
      this.authService.sendResetPasswordLink(userEmailFormControl.value).subscribe({
        next: (res: ICommonAPIResponse) => {
          console.log('res ', res);
          if (res && res['sendEmailResetPasswordLink'] && res['sendEmailResetPasswordLink'].success) {
            this.isPasswordLinkSended = true;
            if (isPlatformBrowser(this.platformId)) {
              this.startRedirectTimer();
            }
          }
        },
        error: (error) => {
          this.isPasswordLinkSended = false;
          console.log('error ', error);
          this.resetForm.get('userEmail')?.setErrors({ sendMailFailed: true });
        }
      })
    }
  }

  private startRedirectTimer() {
    this.timerSubscription = interval(1000).pipe(takeWhile(() => this.timer > 0), finalize(() => this.onRedirect())).subscribe(() => { this.timer--; });
  }

  onRedirect() {
    this.router.navigate(['../login']);
  }

  onUpdatePassword() {
    const passwordFormControl = this.resetForm.get('password');
    const repeatPasswordFormControl = this.resetForm.get('repeatPassword');
    const userEmailFormControl = this.resetForm.get('userEmail');
    if (userEmailFormControl && passwordFormControl && repeatPasswordFormControl && passwordFormControl.valid && repeatPasswordFormControl.valid && userEmailFormControl.value && passwordFormControl.value) {
      this.authService.updatePassword({ email: userEmailFormControl.value, password: passwordFormControl.value, token: this.token }).subscribe({
        next: (res: ICommonAPIResponse) => {
          if (res && res['updatePassword'] && res['updatePassword'].success) {
            this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Your Password has been updated successfully!', life: 3000 });
            this.isPasswordUpdated = true;
            this.startRedirectTimer();
          }
        },
        error: () => {
          this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Something went wrong! Please try again later', life: 3000 });
          this.isPasswordUpdated = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    if (this.timerSubscription)
      this.timerSubscription.unsubscribe();
  }
}
