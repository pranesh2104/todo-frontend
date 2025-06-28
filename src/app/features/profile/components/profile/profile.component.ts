import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, Inject, inject, OnInit, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CryptoService } from '@core/services/crypto.service';
import { UserService } from '@core/services/user.service';
import { ICommonAPIResponse } from '@shared/models/shared.model';
import { EMAIL_PATTERN, PASSWORD_PATTERN } from 'app/features/auth/constants/auth.constant';
import { PROFILE_STATUS } from 'app/features/auth/constants/profile.constant';
import { CustomValidators } from 'app/features/auth/custom-validators/email-password.validator';
import { AuthService } from 'app/features/auth/services/auth.service';
import { MessageService } from 'primeng/api';
import { Button, ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { Toast } from 'primeng/toast';
import { finalize, interval, Subscription, takeWhile } from 'rxjs';
import { DialogModule } from 'primeng/dialog';
import { ProfileStateManagerService } from 'app/features/dashboard/services/profile-state-manager.service';
import { StorageService } from '@core/services/storage.service';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, CardModule, Divider, FormsModule, Toast, ReactiveFormsModule, DialogModule, InputTextModule, IconField, InputIcon, Message, PasswordModule, ButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MessageService]
})
export class ProfileComponent implements OnInit {

  private userService = inject(UserService);

  currentUser = computed(() => this.userService.currentUser())

  readonly PROFILE_STATUS = PROFILE_STATUS;

  private readonly toastMessageService = inject(MessageService);

  userForm !: FormGroup;

  private authService = inject(AuthService);

  private subscriptions = new Subscription();

  private cryptoService = inject(CryptoService);

  private profileStateManager = inject(ProfileStateManagerService);

  isEmailRegistered = computed(() => this.profileStateManager.emailStatus().isRegistered);

  linkState = computed(() => this.profileStateManager.linkStatus());

  emailState = computed(() => this.profileStateManager.emailStatus());

  passwordState = computed(() => this.profileStateManager.passwordStatus());

  currentPasswordStateForEmail = computed(() => this.profileStateManager.confirmPasswordForEmailChangeState());

  currentPasswordStateForPassword = computed(() => this.profileStateManager.confirmPasswordForPasswordChangeState());

  currentPasswordState = computed(() => {
    return this.activeDialogType() === 'email'
      ? this.profileStateManager.confirmPasswordForEmailChangeState()
      : this.activeDialogType() === 'password' ? this.profileStateManager.confirmPasswordForPasswordChangeState()
        : this.profileStateManager.confirmPasswordForDeleteAccount()
  });

  showCurrentPasswordDialog = signal(false);

  currentPassword !: string;

  timer = 5;

  private timerSubscription: Subscription = new Subscription();

  private storageService = inject(StorageService)

  intervalId !: NodeJS.Timeout;

  emailTimeLeft = signal(0);

  activeDialogType = signal<'email' | 'password' | 'account'>('email');

  dialogHeader = computed(() => {
    if (this.activeDialogType() === 'email') return 'Change Email Address'
    else if (this.activeDialogType() === 'password') return 'Change Password';
    else return 'Delete Account';
  });

  dialogContent = computed(() => {
    if (this.activeDialogType() === 'email') return 'Please verify your current password to change your email address'
    else if (this.activeDialogType() === 'password') return 'Please verify your current password to change password';
    else return 'Please verify your current password to delete your account';
  });

  constructor(private formBuilder: FormBuilder, @Inject(PLATFORM_ID) private platformId: object, private router: Router) {
    effect(() => {
      const userValues = this.currentUser();
      if (userValues && this.userForm) {
        this.userForm.get('name')?.patchValue(userValues.name);
        this.userForm.get('email')?.patchValue(userValues.email);
        this.userForm.get('email')?.disable();
        if (isPlatformBrowser(this.platformId)) {
          const newEmail = this.storageService.getLocalStorage('newEmail');
          if (newEmail) {
            const { email, created_at } = JSON.parse(newEmail);
            if (email) {
              this.userForm.get('email')?.setValue(email);
              this.userForm.get('email')?.disable();
            }
            if (created_at) {
              const createdAt = new Date(created_at).getTime();
              this.startMinuteWatcher(createdAt);
            }
            else {
              this.userForm.get('email')?.patchValue(userValues.email);
            }
          }
        }
      }
    });
  }

  ngOnInit(): void {
    this.intializeUserForm();
  }

  startMinuteWatcher(createdAt: number): void {
    this.updateTimeLeft(createdAt);
    this.intervalId = setInterval(() => {
      this.updateTimeLeft(createdAt);
    }, 60_000);
  }

  updateTimeLeft(createdAt: number): void {
    const now = Date.now();
    const diffMs = now - createdAt;
    const totalMinutes = 30;
    const passedMinutes = Math.floor(diffMs / (1000 * 60));
    const remainingMinutes = totalMinutes - passedMinutes;

    if (remainingMinutes <= 0) {
      clearInterval(this.intervalId);
      this.storageService.remove('newEmail');
      this.emailTimeLeft.set(0);
    } else {
      this.emailTimeLeft.set(remainingMinutes);
    }
  }

  intializeUserForm() {
    this.userForm = this.formBuilder.group({
      name: new FormControl<string>(''),
      email: new FormControl<string>('', {
        validators: [Validators.required, Validators.pattern(EMAIL_PATTERN)], nonNullable: true,
        asyncValidators: CustomValidators.checkEmailAvailability(this.authService,
          { setCheckingState: (checkState: string) => this.profileStateManager.updateEmailStatus({ status: checkState }) },
          { setEmailRegisterState: (isEmailRegistered: boolean) => this.profileStateManager.updateEmailStatus({ isRegistered: isEmailRegistered }) },
          true
        )
      }),
      currentPassword: new FormControl<string>(''),
      password: new FormControl<string>('', { validators: [Validators.pattern(PASSWORD_PATTERN)] }),
      repeatPassword: new FormControl<string>('', { validators: [Validators.pattern(PASSWORD_PATTERN)] }),
    }, { validators: CustomValidators.matchPasswordValidator() });
  }

  onEmailPassword() {
    if (this.currentPasswordStateForEmail().status !== PROFILE_STATUS.PASSWORD.VERIFIED) {
      this.showCurrentPasswordDialog.set(true);
      this.activeDialogType.set('email');
    }
  }

  onRequestEmailVerification() {
    const emailFormControl = this.userForm.get('email');
    if (this.profileStateManager.linkStatus() === PROFILE_STATUS.LINK.SENDING || this.currentPasswordStateForEmail().status !== PROFILE_STATUS.PASSWORD.VERIFIED || !emailFormControl?.valid) return;
    if (emailFormControl && emailFormControl.value) {
      this.profileStateManager.updateLinkStatus(PROFILE_STATUS.LINK.SENDING);
      this.subscriptions.add(this.authService.requestEmailVerification(emailFormControl.value).subscribe({
        next: () => {
          this.profileStateManager.updateLinkStatus(PROFILE_STATUS.LINK.SENT);
          this.userForm.get('email')?.disable();
          this.storageService.setLocalStorage('newEmail', JSON.stringify({ email: emailFormControl.value, created_at: new Date() }));
          this.startMinuteWatcher(new Date().getTime());
          this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Task Deleted successfully', life: 3000 });
        },
        error: () => {
          this.toastMessageService.add({ severity: 'error', summary: 'Oops! Something Went Wrong', detail: 'We couldn’t complete your request. Please try again in a moment.', life: 3000 });
        }
      }));
    }
    else {
      if (emailFormControl && !emailFormControl.value)
        emailFormControl.markAsDirty();
    }
  }

  onVerifyPassword() {
    if (!this.currentPassword) return;
    this.profileStateManager.updateCurrentPasswordState({ status: PROFILE_STATUS.PASSWORD.SENDING }, this.activeDialogType());
    const encryptedCurrentPassword = this.cryptoService.encryptToken(this.currentPassword);
    this.subscriptions.add(this.authService.verifyPassword(encryptedCurrentPassword).subscribe({
      next: (res) => {
        if (res && res['verifyPassword']) {
          if (res['verifyPassword'].code === 'PASSWORD_MATCHED') {
            this.profileStateManager.updateCurrentPasswordState({ status: PROFILE_STATUS.PASSWORD.VERIFIED }, this.activeDialogType());
            setTimeout(() => { this.showCurrentPasswordDialog.set(false); if (this.activeDialogType() === 'email') this.userForm.get('email')?.enable(); }, 400);
          } else {
            this.profileStateManager.updateCurrentPasswordState({ status: PROFILE_STATUS.PASSWORD.MISMATCHED }, this.activeDialogType());
            this.profileStateManager.updateCurrentPasswordState({ isValid: false }, this.activeDialogType());
          }
        }
      },
      error: () => {
        this.profileStateManager.updateCurrentPasswordState({ status: PROFILE_STATUS.PASSWORD.FAILED }, this.activeDialogType());
        this.toastMessageService.add({ severity: 'error', summary: 'Oops! Something Went Wrong', detail: 'We couldn\'t complete your request. Please try again in a moment.', life: 3000 });
        this.currentPassword = '';
        this.showCurrentPasswordDialog.set(false);
      }
    }));
  }

  onCPasswordChange(value: string) {
    this.profileStateManager.updateCurrentPasswordState({ status: PROFILE_STATUS.PASSWORD.INITIAL }, this.activeDialogType());
    this.profileStateManager.updateCurrentPasswordState({ isValid: PASSWORD_PATTERN.test(value) }, this.activeDialogType());
  }

  onPasswordDialog() {
    this.activeDialogType.set('password');
    this.showCurrentPasswordDialog.set(true);
  }

  onChangePassword() {
    console.log('inside onChangePassword');
    if (this.profileStateManager.passwordStatus() === PROFILE_STATUS.PASSWORD.SENDING) return;
    const repeatPasswordControl = this.userForm.get('repeatPassword');
    if (repeatPasswordControl && repeatPasswordControl.value) {
      this.profileStateManager.updatePasswordStatus(PROFILE_STATUS.PASSWORD.SENDING);
      // const encryptedNewPassword = this.cryptoService.encryptToken(repeatPasswordControl.value);
      this.subscriptions.add(this.authService.changePassword<ICommonAPIResponse>(repeatPasswordControl.value).subscribe({
        next: (res) => {
          if (res && res['changePassword']) {
            if (res['changePassword'].code === 'PASSWORD_CHANGED') {
              this.profileStateManager.updatePasswordStatus(PROFILE_STATUS.PASSWORD.CHANGED);
              repeatPasswordControl.reset();
              this.userForm.get('newPassword')?.reset();
              this.toastMessageService.add({ severity: 'success', summary: 'Success', detail: 'Password Changed successfully!, Sign in with new credentials', life: 3000 });
              if (isPlatformBrowser(this.platformId)) {
                this.timerSubscription = interval(4000).pipe(takeWhile(() => this.timer > 0), finalize(() => this.onRedirect())).subscribe(() => { this.timer--; });
              }
            }
            else if (res && res['changePassword'].code === 'PASSWORD_MISMATCH') {
              this.toastMessageService.add({ severity: 'error', summary: 'Error', detail: 'Password Mismatch', life: 3000 });
            }
          }
        },
        error: () => {
          this.profileStateManager.updatePasswordStatus(PROFILE_STATUS.PASSWORD.FAILED);
          this.toastMessageService.add({ severity: 'error', summary: 'Oops! Something Went Wrong', detail: 'We couldn’t complete your request. Please try again in a moment.', life: 3000 });
        }
      }));
    }
  }

  onSaveChanges() {
    const nameChanges = this.userForm.get('name')?.value;
    if (nameChanges !== this.currentUser().name) {
      this.subscriptions.add(this.authService.updateName(nameChanges).subscribe({
        next: (res) => {
          if (res && res['updateName'] && res['updateName'].code === 'UPDATE_NAME_SUCCESS') {
            this.userService.setCurrentUser({ name: nameChanges });
            this.toastMessageService.add({ severity: 'success', summary: 'Name Updated', detail: 'Your name has been updated successfully.', life: 3000 });
          }
        },
        error: () => {
          this.toastMessageService.add({ severity: 'error', summary: 'Oops! Something Went Wrong', detail: 'We couldn’t complete your request. Please try again in a moment.', life: 3000 });
        }
      }));
    }
  }

  onRedirect() {
    this.router.navigate(['/signin']);
  }

  onSignOut() {
    this.subscriptions.add(this.authService.signOut().subscribe({
      next: (res) => {
        if (res && res['signOut'] && res['signOut'].success)
          this.onRedirect();
      },
      error: () => {
        this.toastMessageService.add({ severity: 'error', summary: 'Oops! Something Went Wrong', detail: 'We couldn’t complete your request. Please try again in a moment.', life: 3000 });
      }
    }));
  }

  OnAccountDialog() {
    this.activeDialogType.set('account');
    this.showCurrentPasswordDialog.set(true);
  }

  OnDeleteAccount() {
    this.activeDialogType.set('account');
    if (this.currentPasswordState().status === PROFILE_STATUS.PASSWORD.VERIFIED) {
      this.subscriptions.add(this.authService.deleteAccount().subscribe({
        next: (res) => {
          if (res && res['deleteUser'] && res['deleteUser'].success)
            this.onRedirect();
        },
        error: () => {
          this.toastMessageService.add({ severity: 'error', summary: 'Oops! Something Went Wrong', detail: 'We couldn’t complete your request. Please try again in a moment.', life: 3000 });
        }
      }));
    }
  }

  ngOnDestroy() {
    clearInterval(this.intervalId)
    this.timerSubscription.unsubscribe();
    this.subscriptions.unsubscribe();
    this.profileStateManager.resetAll();
  }
}
