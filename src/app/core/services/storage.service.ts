import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  /**
   * Injects the current platform identifier (browser or server) for platform-specific logic
   */
  private readonly platformId = inject(PLATFORM_ID);
  /**
   * Checks if the current execution context is the browser.
   * Used to guard against DOM-related operations in server-side rendering (SSR).
   */
  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
  /**
   * Retrieves a cookie value by key, only if running in the browser.
   * 
   * @param key - The name of the cookie to retrieve.
   * @returns The cookie value, or null if not found or not in browser.
   */
  get(key: string): string | null {
    if (!this.isBrowser) return null;
    try {
      return this.getCookie(key);
    } catch (error) {
      console.error('LocalStorage access error:', error);
      return null;
    }
  }
  /**
   * Checks if a cookie with the given key exists.
   * 
   * @param key - The name of the cookie to check.
   * @returns True if the cookie exists and running in the browser, false otherwise.
   */
  has(key: string): boolean {
    return this.isBrowser ? this.getCookie(key) !== null : false;
  }
  /**
   * Stores a key-value pair in localStorage, only if running in the browser.
   * 
   * @param key - The key to store.
   * @param value - The value to associate with the key.
   */
  setLocalStorage(key: string, value: string): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('LocalStorage set error:', error);
    }
  }
  /**
   * Retrieves a value from localStorage by key.
   * 
   * @param key - The key to look up.
   * @returns The stored value, or null if not found or not in the browser.
   */
  getLocalStorage(key: string): string | null {
    if (!this.isBrowser) return null;;
    return localStorage.getItem(key);
  }
  /**
   * Removes specific cookies and localStorage item by key.
   * Only runs in the browser context.
   * 
   * @param key - The localStorage key to remove.
   */
  remove(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
      document.cookie = `sessionId=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
      document.cookie = `deviceId=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
    };
  }
  /**
   * Clears all localStorage data, only in the browser environment.
   */
  clearLocalStorage(): void {
    if (this.isBrowser) localStorage.clear();
  }
  /**
   * Gets the value of a cookie by name.
   * 
   * @param name - The name of the cookie.
   * @returns The cookie value if found, otherwise null.
   */
  getCookie(name: string) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(c => c.startsWith(name + '='));
    return cookie ? cookie.split('=')[1] : null;
  }
}