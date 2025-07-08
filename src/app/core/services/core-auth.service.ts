import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class CoreAuthService {
  /**
   * Inject the UserService instance. 
   */
  private readonly userService = inject(UserService);
  /**
   * Injects the current platform identifier (browser or server) for platform-specific logic
   */
  private readonly platformId = inject(PLATFORM_ID);
  /**
   * Inject the StorageService instance to change and check the cookie.
   */
  private readonly storageService = inject(StorageService);

  constructor() { }
  /**
   * Get the session cookie from storage service.
   * @returns session value or null
   */
  getAccessToken(): string | null {
    return this.storageService.get('sessionId');
  }
  /**
   * Attempts to retrieve a new session token (refresh token) from the server.
   * If successful, returns true; otherwise logs the user out and returns false.
   * 
   * @returns A promise that resolves to true if the token refresh succeeded, false otherwise.
   */
  async getRefreshToken(): Promise<boolean> {
    try {
      const { success } = await lastValueFrom(this.userService.getSessionToken());
      if (success) return true;
      else return false;
    } catch (error) {
      console.log('error from core auth  ', error);
      this.logout();
      return false;
    }
  }
  /**
   * Removes the all cookie value.
   */
  logout(): void {
    this.storageService.remove('session');
  }
  /**
   * Checks if the user is currently authenticated.
   * If a session ID exists in storage, returns true.
   * Otherwise, attempts to refresh the session token.
   * 
   * @returns A promise that resolves to true if the user is authenticated, false otherwise.
   */
  async checkAuthenticateState(): Promise<boolean> {
    if (this.storageService.get('sessionId')) {
      return true;
    }
    else {
      return await this.getRefreshToken();;
    }
  }
}