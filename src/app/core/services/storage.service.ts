import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly platformId = inject(PLATFORM_ID);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }


  get(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return this.getCookie(key);
      // return localStorage.getItem(key);
    } catch (error) {
      console.error('LocalStorage access error:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.isBrowser ? this.getCookie(key) !== null : false;
  }

  setLocalStorage(key: string, value: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  }

  getLocalStorage(key: string): string | null {
    if (!this.isBrowser) return null;;
    return localStorage.getItem(key);
  }

  remove(key: string): void {
    if (this.isBrowser) localStorage.removeItem(key);
  }

  clearLocalStorage(): void {
    if (this.isBrowser) localStorage.clear();
  }

  getCookie(name: string) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(name + '='));
    return cookie ? cookie.split('=')[1] : null;
  }
}