import { isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  private readonly SECRET_KEY = 'mindMosaic';

  private readonly platformId = inject(PLATFORM_ID);

  constructor() { }

  // Encryption
  encryptToken(token: string): string {
    const AESEncrypt = CryptoJS.AES.encrypt(token, this.SECRET_KEY).toString();
    return this.btoa(AESEncrypt);
  }

  // Decryption
  decryptToken(encryptedToken: string): string {
    const windowDecrypt = this.atob(encryptedToken);
    return CryptoJS.AES.decrypt(windowDecrypt, this.SECRET_KEY).toString(CryptoJS.enc.Utf8);
  }

  btoa(token: string): string {
    if (isPlatformBrowser(this.platformId))
      return window.btoa(token);
    else
      return token;
  }

  atob(token: string): string {
    if (isPlatformBrowser(this.platformId))
      return window.atob(token);
    else
      return token;
  }
}
