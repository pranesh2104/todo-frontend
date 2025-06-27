import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { AuthService } from 'app/features/auth/services/auth.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Subscription } from 'rxjs';

const RESET_STATE = {
  EMAIL: {
    INITIAL: 'INITIAL',
    SENDING: 'SENDING',
    SENT: 'SENT'
  }
}

enum UPDATE_EMAIL_CODES {
  EMAIL_UPDATED = 'EMAIL_UPDATED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  MISMATCH_TOKEN = 'MISMATCH_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  UPDATE_ERROR = 'UPDATE_ERROR'
}

interface EMAIL_DYNAMIC_DATA {
  icon: string,
  title: string,
  message: string,
  color: string,
  bgColor: string,
  borderColor: string,
  iconColor: string
}


@Component({
  selector: 'app-common-reset',
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './common-reset.component.html',
  styleUrl: './common-reset.component.scss'
})
export class CommonResetComponent implements OnInit {

  resetState = {
    email: {
      status: RESET_STATE.EMAIL.INITIAL,
      code: '' as UPDATE_EMAIL_CODES
    }
  }

  timer = 5;

  resetPageName: 'Email' | 'Password' | '' = '';

  private activeRoute = inject(ActivatedRoute);

  private subscription = new Subscription();

  commonForm!: FormGroup;

  private formBuilder = inject(FormBuilder);

  private authServie = inject(AuthService);

  selectedCodeData = signal<EMAIL_DYNAMIC_DATA>({
    icon: 'fa-regular fa-circle-exclamation',
    title: 'Password Changed!',
    message: 'This link is invalid as your password was changed. Please sign in to update your email',
    color: 'text-yellow-600',
    bgColor: 'bg-white',
    borderColor: 'border-yellow-200',
    iconColor: 'text-green-500'
  });


  ngOnInit(): void {
    this.subscription.add(this.activeRoute.queryParams.subscribe({
      next: (params: Params) => {
        if (params['email_token']) {
          this.resetPageName = 'Email';
          this.updateEmail(params['email_token']);
        }
        else if (params['pass_token']) {
          this.resetPageName = 'Password';
          this.initializeForm();
        }
      }
    }));

  }

  initializeForm() {

  }

  updateEmail(token: string) {
    this.resetState.email.status = RESET_STATE.EMAIL.SENDING;
    this.subscription.add(this.authServie.updateEmail<ICommonAPIResponse>(token).subscribe({
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


  getMessage(code: string) {
    switch (code) {
      case UPDATE_EMAIL_CODES.EMAIL_UPDATED:
        return {
          icon: 'fa-regular fa-circle-check',
          title: 'Email Updated Successfully!',
          message: 'Your email address has been successfully updated. You can now use your new email to sign in.',
          color: 'text-green-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          iconColor: 'text-green-500'
        };
      case UPDATE_EMAIL_CODES.PASSWORD_CHANGED:
        return {
          icon: 'fa-regular fa-circle-exclamation',
          title: 'Password Changed!',
          message: 'This link is invalid as your password was changed. Please sign in to update your email',
          color: 'text-yellow-600',
          bgColor: 'bg-white',
          borderColor: 'border-yellow-200',
          iconColor: 'text-green-500'
        };
      case UPDATE_EMAIL_CODES.INVALID_TOKEN:
        return {
          icon: 'fa-regular fa-circle-xmark',
          title: 'Invalid Verification Link',
          message: 'The verification link is invalid or malformed. Please request a new verification email.',
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          iconColor: 'text-red-500'
        };
      case UPDATE_EMAIL_CODES.MISMATCH_TOKEN:
        return {
          icon: 'fa-regular fa-circle-exclamation',
          title: 'Token Mismatch',
          message: 'The verification token doesn\'t match our records. Please ensure you\'re using the correct link from your email.',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500'
        };
      case UPDATE_EMAIL_CODES.TOKEN_EXPIRED:
        return {
          icon: 'fa-regular fa-circle-exclamation',
          title: 'Verification Link Expired',
          message: 'This verification link has expired. Please request a new verification email to continue.',
          color: 'text-amber-600',
          bgColor: 'bg-amber-50',
          borderColor: 'border-amber-200',
          iconColor: 'text-amber-500'
        };
      default:
        return {
          icon: 'fa-regular fa-circle-xmark',
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
