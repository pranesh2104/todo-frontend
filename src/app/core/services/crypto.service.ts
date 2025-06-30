import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { EnvironmentToken } from 'app/env.token';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  /**
   * Injects the current platform identifier (browser or server) for platform-specific logic
   */
  private readonly platformId = inject(PLATFORM_ID);
  /**
   * Injects the Environment Instance to access the crypto secret key.
   */
  private readonly envrionment = inject(EnvironmentToken);
  /**
   * Encrypts a token using AES encryption and encodes the result in base64.
   * 
   * @param token - The plain text token to encrypt.
   * @returns A base64-encoded, AES-encrypted token string.
   */
  encryptToken(token: string): string {
    const AESEncrypt = CryptoJS.AES.encrypt(token, this.envrionment.CRYPTO_SECRET_KEY).toString();
    return this.btoa(AESEncrypt);
  }
  /**
   * Decrypts a base64-encoded, AES-encrypted token string.
   * 
   * @param encryptedToken - The encrypted token string (base64-encoded).
   * @returns The original plain text token.
   */
  decryptToken(encryptedToken: string): string {
    const windowDecrypt = this.atob(encryptedToken);
    return CryptoJS.AES.decrypt(windowDecrypt, this.envrionment.CRYPTO_SECRET_KEY).toString(CryptoJS.enc.Utf8);
  }
  /**
   * Encodes a string to base64 using `window.btoa`, only if running in the browser.
   * Returns the original string on the server to avoid runtime errors during SSR.
   * 
   * @param token - The plain text string to encode.
   * @returns A base64-encoded string if in browser, otherwise the original string.
   */
  btoa(token: string): string {
    if (isPlatformBrowser(this.platformId))
      return window.btoa(token);
    else
      return token;
  }
  /**
   * Decodes a base64 string using `window.atob`, only if running in the browser.
   * Returns the original string on the server to avoid runtime errors during SSR.
   * 
   * @param token - The base64-encoded string to decode.
   * @returns The decoded string if in browser, otherwise the original string.
  */
  atob(token: string): string {
    if (isPlatformBrowser(this.platformId))
      return window.atob(token);
    else
      return token;
  }
}
