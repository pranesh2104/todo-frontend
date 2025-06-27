import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CryptoService } from '@core/services/crypto.service';
import { HeaderService } from '@core/services/header.service';
import { UserService } from '@core/services/user.service';
import { ICommonAPIResponse, ICommonErrorResponse, ICommonResponse } from '@shared/models/shared.model';
import { EMAIL_PATTERN } from 'app/features/auth/constants/auth.constant';
import { PROFILE_STATUS } from 'app/features/auth/constants/profile.constant';
import { CustomValidators } from 'app/features/auth/custom-validators/email-password.validator';
import { AuthService } from 'app/features/auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, CardModule, Divider, Toast, ReactiveFormsModule, InputTextModule, IconField, InputIcon, Message, PasswordModule, Button],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ProfileComponent implements OnInit {

  currentUser = inject(UserService).currentUser;

  readonly PROFILE_STATUS = PROFILE_STATUS;

  private readonly toastMessageService = inject(MessageService);

  profileStatus = {
    link: {
      status: PROFILE_STATUS.LINK.INITIAL
    },
    email: {
      status: PROFILE_STATUS.EMAIL.INITIAL,
      isVerify: false,
      isRegistered: false,
      isChangeEnabled: false
    },
    password: {
      status: PROFILE_STATUS.PASSWORD.INITIAL
    }
  }

  userForm !: FormGroup;

  private authService = inject(AuthService);

  private headerService = inject(HeaderService);

  private cdr = inject(ChangeDetectorRef);

  private observableSubscription = new Subscription();

  private cryptoService = inject(CryptoService);

  constructor(private formBuilder: FormBuilder) {
    effect(() => {
      const userValues = this.currentUser();
      if (userValues && this.userForm) {
        this.userForm.get('name')?.patchValue(userValues.name);
        this.userForm.get('email')?.patchValue(userValues.email);
        this.userForm.get('email')?.disable();
      }
    });
  }

  ngOnInit(): void {
    this.intializeUserForm();
  }

  intializeUserForm() {
    this.userForm = this.formBuilder.group({
      name: new FormControl<string>(''),
      email: new FormControl<string>('', {
        validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)], nonNullable: true,
        asyncValidators: CustomValidators.checkEmailAvailability(this.authService,
          { setCheckingState: (checkState: string) => this.profileStatus.email.status = checkState },
          { setEmailRegisterState: (isEmailRegistered: boolean) => this.profileStatus.email.isRegistered = isEmailRegistered },
          true
        )
      }),
      currentPassword: new FormControl<string>('')
    });
  }

  onEmailChange() {
    if (this.profileStatus.email.isChangeEnabled) return;
    this.userForm.get('email')?.enable();
    this.profileStatus.email.isChangeEnabled = true;
  }

  onSendLink() {
    if (this.profileStatus.link.status === PROFILE_STATUS.LINK.SENDING) return;
    const emailFormControl = this.userForm.get('email');
    if (emailFormControl && emailFormControl.value) {
      this.profileStatus.link.status = PROFILE_STATUS.LINK.SENDING;
      this.observableSubscription.add(this.authService.sendChangeEmailLink(emailFormControl.value).subscribe({
        next: () => {
          this.profileStatus.link.status = PROFILE_STATUS.LINK.SENT;
          this.userForm.get('email')?.disable();
          this.profileStatus.email.isChangeEnabled = false;
          this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Task Deleted successfully', life: 3000 });
        },
        error: () => {
          // this.profileStatus.link.status = PROFILE_STATUS.LINK.ERROR;
          // this.userForm.get('email')?.setErrors({ isOTPSendError: true });
        }
      }));
    }
    else {
      if (emailFormControl && !emailFormControl.value)
        emailFormControl.markAsDirty();
    }
  }

  onChangePassword() {
    if (this.profileStatus.password.status === PROFILE_STATUS.PASSWORD.SENDING) return;
    const passwordControl = this.userForm.get('currentPassword');
    if (passwordControl && passwordControl.value) {
      this.profileStatus.password.status = PROFILE_STATUS.PASSWORD.SENDING;
      const encryptedPassword = this.cryptoService.encryptToken(passwordControl.value);
      this.observableSubscription.add(this.authService.changePassword<ICommonAPIResponse>(encryptedPassword).subscribe({
        next: (res) => {
          if (res && res['changePassword'] && res['changePassword'].code === 'RESET_LINK_SENDED') {
            this.profileStatus.password.status = PROFILE_STATUS.PASSWORD.SENT;
            passwordControl.reset();
            this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Email Send Successfully', life: 3000 });
          }
        },
        error: (error: ICommonErrorResponse) => {
          this.profileStatus.password.status = PROFILE_STATUS.PASSWORD.FAILED;
          const parsedError: ICommonResponse = JSON.parse(error.message);
          if (parsedError) {
            if (parsedError.code === 'PASSWORD_MISMATCH') {
              this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Passwor Mismatch', life: 3000 });
            }
          }
          // this.profileStatus.link.status = PROFILE_STATUS.LINK.ERROR;
          // this.userForm.get('email')?.setErrors({ isOTPSendError: true });
        }
      }));
    }
  }
}
