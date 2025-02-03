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
      return localStorage.getItem(key);
    } catch (error) {
      console.error('LocalStorage access error:', error);
      return null;
    }
  }

  has(key: string): boolean {
    return this.isBrowser ? localStorage.getItem(key) !== null : false;
  }

  set(key: string, value: string): void {
    if (!this.isBrowser) return;

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  }

  remove(key: string): void {
    if (this.isBrowser) localStorage.removeItem(key);
  }

  clear(): void {
    if (this.isBrowser) localStorage.clear();
  }
}