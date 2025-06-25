import { Component, inject, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EMAIL_PATTERN, PASSWORD_PATTERN, SIGNIN_API_RESPONSE_CODE } from '../../constants/auth.constant';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';
import { Button } from 'primeng/button';
import { CoreAuthService } from '@core/services/core-auth.service';
import { AuthService } from '../../services/auth.service';
import { ICommonErrorResponse, ICommonResponse } from '@shared/models/shared.model';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ILoginSuccessResponse } from '../../models/auth.model';
import { Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { HeaderService } from '@core/services/header.service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, Toast, IconField, InputIcon, InputText, Message, Password, Button, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss',
  providers: [MessageService]
})
export class SignInComponent implements OnDestroy {

  signInForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.pattern(EMAIL_PATTERN)]),
    password: new FormControl('', [Validators.required, Validators.pattern(PASSWORD_PATTERN)])
  });

  isPasswordVisible: boolean = false;

  private readonly coreAuthService = inject(CoreAuthService);

  private readonly headerService = inject(HeaderService);

  private readonly authService = inject(AuthService);

  private readonly toastService: MessageService = inject(MessageService);

  private readonly router = inject(Router);

  private obervableSubscription: Subscription = new Subscription();

  onLogin() {
    const emailFormControl = this.signInForm.get('email');
    const passwordFormControl = this.signInForm.get('password');
    if (emailFormControl && passwordFormControl && emailFormControl.valid && passwordFormControl.valid) {
      this.headerService.setHeaders('Registration', `${emailFormControl.value}:${passwordFormControl.value}`);
      this.obervableSubscription.add(this.authService.login().subscribe({
        next: (loginResponse: ILoginSuccessResponse) => {
          if (loginResponse && loginResponse.login) {
            this.headerService.removeHeader('Registration');
            this.coreAuthService.user.next(loginResponse.login.user);
            this.toastService.add({ severity: 'info', detail: 'Email not found. Please check your email or create a new account.', life: 4000, summary: 'Sign In Failed' });
            // this.router.navigate(['/app/dashboard']);
          }
        },
        error: (error: ICommonErrorResponse) => {
          const parsedError: ICommonResponse = JSON.parse(error.message);
          if (parsedError) {
            if (parsedError.code === SIGNIN_API_RESPONSE_CODE.USER_NOT_FOUND) {
              this.signInForm.get('email')?.setErrors({ userNotFound: true });
              this.toastService.add({ severity: 'info', detail: 'Email not found. Please check your email or create a new account.', life: 4000, summary: 'Sign In Failed' });
            }
            else if (parsedError.code === SIGNIN_API_RESPONSE_CODE.PASSWORD_MISMATCH) {
              this.signInForm.get('password')?.setErrors({ passwordMismatch: true });
            }
            else {
              this.toastService.add({ severity: 'error', summary: 'Login Failed', detail: 'Something went wrong! Please try again later', life: 3000 })
            }
          }
        }
      }));
    }
    else {
      emailFormControl?.markAsDirty();
      passwordFormControl?.markAsDirty();
    }
  }

  ngOnDestroy(): void {
    if (this.obervableSubscription) {
      this.obervableSubscription.unsubscribe();
    }
  }
}
