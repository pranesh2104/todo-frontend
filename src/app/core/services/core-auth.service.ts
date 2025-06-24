import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';
// import { IUserReponse } from 'app/features/auth/models/auth.model';
import { UserService } from './user.service';
import { IUserReponse } from 'app/features/auth/models/auth.model';


@Injectable({
  providedIn: 'root'
})
export class CoreAuthService {

  private userService = inject(UserService);

  private readonly platformId = inject(PLATFORM_ID);

  private storageService = inject(StorageService);

  user: BehaviorSubject<IUserReponse | null> = new BehaviorSubject<IUserReponse | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', (event) => {
        if (event.key === 'logout') this.logout();
      });
    }
  }

  getAccessToken(): string | null {
    return this.storageService.get('session');
  }

  setAccessToken(token: string): void {
    this.storageService.set('at', token);
  }

  async getRefreshToken(): Promise<boolean> {
    try {
      const { success } = await lastValueFrom(this.userService.getAccessToken());
      // this.setAccessToken(newToken.refreshAccessToken.accessToken);
      if (success) return true;
      else return false;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  logout(): void {
    this.storageService.remove('at');
  }

  async checkAuthenticateState(): Promise<boolean> {
    if (this.storageService.get('session')) {
      return true;
    }
    else {
      return await this.getRefreshToken();;
    }
  }
}