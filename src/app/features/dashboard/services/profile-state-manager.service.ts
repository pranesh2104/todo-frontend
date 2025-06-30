import { Injectable, signal } from '@angular/core';
import { PROFILE_STATUS } from 'app/features/auth/constants/profile.constant';
import { CurrentPasswordStatus, EmailStatus } from '../models/profile.model';

@Injectable({
  providedIn: 'root'
})
export class ProfileStateManagerService {

  readonly linkStatus = signal(PROFILE_STATUS.LINK.INITIAL);

  readonly emailStatus = signal<EmailStatus>({
    status: PROFILE_STATUS.EMAIL.INITIAL,
    isVerify: false,
    isRegistered: false
  });

  readonly passwordStatus = signal(PROFILE_STATUS.PASSWORD.INITIAL);

  readonly confirmPasswordForEmailChangeState = signal<CurrentPasswordStatus>({
    status: PROFILE_STATUS.PASSWORD.INITIAL,
    isValid: false
  });

  readonly confirmPasswordForPasswordChangeState = signal<CurrentPasswordStatus>({
    status: PROFILE_STATUS.PASSWORD.INITIAL,
    isValid: false
  });

  readonly confirmPasswordForDeleteAccount = signal<CurrentPasswordStatus>({
    status: PROFILE_STATUS.PASSWORD.INITIAL,
    isValid: false
  });

  constructor() { }

  public updateLinkStatus(status: string): void {
    this.linkStatus.set(status);
  }

  public updateEmailStatus(update: Partial<EmailStatus>): void {
    this.emailStatus.update(prev => ({ ...prev, ...update }));
  }

  public updatePasswordStatus(status: string): void {
    this.passwordStatus.set(status);
  }

  public updateCurrentPasswordStatusForEmailChange(update: Partial<CurrentPasswordStatus>): void {
    this.confirmPasswordForEmailChangeState.update(prev => ({ ...prev, ...update }));
  }

  public updateCurrentPasswordStatusForPasswordChange(update: Partial<CurrentPasswordStatus>): void {
    this.confirmPasswordForPasswordChangeState.update(prev => ({ ...prev, ...update }));
  }

  public updateCurrentPasswordState(update: Partial<CurrentPasswordStatus>, property: 'email' | 'password' | 'account' = 'email') {
    if (property === 'email')
      this.confirmPasswordForEmailChangeState.update(prev => ({ ...prev, ...update }));
    else if (property === 'password')
      this.confirmPasswordForPasswordChangeState.update(prev => ({ ...prev, ...update }));
    else
      this.confirmPasswordForDeleteAccount.update(prev => ({ ...prev, ...update }));
  }

  resetAll(): void {
    this.linkStatus.set(PROFILE_STATUS.LINK.INITIAL);
    this.emailStatus.set({
      status: PROFILE_STATUS.EMAIL.INITIAL,
      isVerify: false,
      isRegistered: false
    });
    this.passwordStatus.set(PROFILE_STATUS.PASSWORD.INITIAL);
    this.confirmPasswordForEmailChangeState.set({
      status: PROFILE_STATUS.PASSWORD.INITIAL,
      isValid: false
    });
    this.confirmPasswordForPasswordChangeState.set({
      status: PROFILE_STATUS.PASSWORD.INITIAL,
      isValid: false
    });
  }
}
