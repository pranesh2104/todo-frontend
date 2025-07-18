import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { RESET_STATE } from '@shared/constants/reset.constant';
import { UPDATE_EMAIL_CODES } from '@shared/enums/reset.enum';
import { EMAIL_DYNAMIC_DATA } from '@shared/models/reset.model';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { PASSWORD_PATTERN } from 'app/features/auth/constants/auth.constant';
import { CustomValidators } from 'app/features/auth/custom-validators/email-password.validator';
import { AuthService } from 'app/features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-common-reset',
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './common-reset.component.html',
  styleUrl: './common-reset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommonResetComponent implements OnInit {

  resetState = {
    email: {
      status: RESET_STATE.EMAIL.INITIAL,
      code: '' as UPDATE_EMAIL_CODES
    }
  }

  timer = 5;

  resetPageName = signal<'Email' | 'Password'>('Email');

  private activeRoute = inject(ActivatedRoute);

  private subscriptions = new Subscription();

  passwordForm!: FormGroup;

  private formBuilder = inject(FormBuilder);

  private authServie = inject(AuthService);

  selectedCodeData = signal<EMAIL_DYNAMIC_DATA>({} as EMAIL_DYNAMIC_DATA);


  ngOnInit(): void {
    this.subscriptions.add(this.activeRoute.queryParams.subscribe({
      next: (params: Params) => {
        if (params['email_token']) {
          this.resetPageName.set('Email');
          this.updateEmail(params['email_token']);
        }
        else if (params['pass_token']) {
          this.resetPageName.set('Password');
        }
      }
    }));

  }
  /**
   * Initializes the password form with validation rules.
   * 
   * The form contains two controls:
   * - `password`: required, must match the PASSWORD_PATTERN regex, and non-nullable.
   * - `repeatPassword`: same validation as `password`.
   * 
   * The entire form group also applies a custom validator `matchPasswordValidator` 
   * to ensure both passwords match.
   */
  initializeForm() {
    this.passwordForm = this.formBuilder.group({
      password: new FormControl<string>('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true }),
      repeatPassword: new FormControl<string>('', { validators: [Validators.required, Validators.pattern(PASSWORD_PATTERN)], nonNullable: true })
    }, { validators: CustomValidators.matchPasswordValidator() });
  }
  /**
   * Calls the auth service to update the email using the provided token.
   * 
   * - Updates `resetState.email.status` to indicate the email update process is sending.
   * - Subscribes to the `updateEmail` observable from the service.
   * - On success:
   *   - Checks if response contains `updateEmail` property.
   *   - Updates `resetState.email.code` with the received status code.
   *   - Updates some UI message/state by calling `getMessage` with the code.
   *   - Starts a countdown timer that decrements `this.timer` every second until it reaches zero.
   * 
   * - On error:
   *   - Sets `resetState.email.code` to a constant `UPDATE_ERROR`.
   * 
   * The subscription is tracked by `this.subscriptions` to allow cleanup (e.g., unsubscribe on destroy).
   * 
   * @param token - The email update token (e.g., from a verification link).
   */
  updateEmail(token: string) {
    this.resetState.email.status = RESET_STATE.EMAIL.SENDING;
    this.subscriptions.add(this.authServie.updateEmail<ICommonAPIResponse>(token).subscribe({
      next: (res) => {
        if (res && res['updateEmail']) {
          this.resetState.email.code = res['updateEmail'].code as UPDATE_EMAIL_CODES;
          this.selectedCodeData.set(this.getMessage(this.resetState.email.code as string));

          const interval = setInterval(() => {
            this.timer--;
            if (this.timer <= 0) {
              clearInterval(interval);
            }
          }, 1000);
        }
      },
      error: () => {
        this.resetState.email.code = 'UPDATE_ERROR' as UPDATE_EMAIL_CODES;
      }
    }));
  }
  /**
   * Returns the UI message data corresponding to the given email update status code.
   * 
   * @param code - The update email status code as a string.
   * @returns EMAIL_DYNAMIC_DATA - The UI data object with text and styling info.
   */
  getMessage(code: string): EMAIL_DYNAMIC_DATA {
    switch (code) {
      case UPDATE_EMAIL_CODES.EMAIL_UPDATED:
        return {
          icon: 'check_circle',
          title: 'Email Updated Successfully!',
          message: 'Your email address has been successfully updated. You can now use your new email to sign in.',
          color: 'text-green-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-green-200',
          iconColor: 'text-green-500'
        };
      case UPDATE_EMAIL_CODES.PASSWORD_CHANGED:
        return {
          icon: 'error',
          title: 'Password Changed!',
          message: 'This link is invalid as your password was changed. Please sign in to update your email',
          color: 'text-yellow-600',
          bgColor: 'bg-white',
          borderColor: 'border-yellow-200',
          iconColor: 'text-green-500'
        };
      case UPDATE_EMAIL_CODES.INVALID_TOKEN:
        return {
          icon: 'cancel',
          title: 'Invalid Verification Link',
          message: 'The verification link is invalid or malformed. Please request a new verification email.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500'
        };
      case UPDATE_EMAIL_CODES.MISMATCH_TOKEN:
        return {
          icon: 'error',
          title: 'Token Mismatch',
          message: 'The verification token doesn\'t match our records. Please ensure you\'re using the correct link from your email.',
          color: 'text-yellow-500',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500'
        };
      case UPDATE_EMAIL_CODES.TOKEN_EXPIRED:
        return {
          icon: 'error',
          title: 'Verification Link Expired',
          message: 'This verification link has expired. Please request a new verification email to continue.',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500'
        };
      default:
        return {
          icon: 'cancel',
          title: 'Verification Failed',
          message: 'Something went wrong during verification. Please try again or contact support.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500'
        };
    }
  }
}
