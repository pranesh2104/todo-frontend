import { inject, Injectable } from '@angular/core';
import { ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HEADERS_ENUM } from '@core/enums/core.enum';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {

  private headers: { headers: { [key: string]: string } } = { headers: {} };

  private cryptoService = inject(CryptoService);

  constructor() { }

  public getHeadersAplloLink(): ApolloLink {
    const auth = setContext(() => {
      // const headerData = Object.keys(this.headers.headers);
      // if (headerData.length && headerData.includes('Authorization')) {
      //   return this.headers;
      // }
      // else {
      //   const token = this.storageService.get('at');
      //   if (token) {
      //     this.setHeaders('Authorization', token);
      //     return this.headers;
      //   }
      // }
      return this.headers;
    });
    return auth;
  }

  public getHeaders() {
    return this.headers;
  }
  /**
   * Method used to set a header for a specific key in the headers object.
   * @param {string} key - The key for the header.
   * @param {string} value - The value for the header.
   * @returns {object} - The updated headers object.
   */
  public setHeaders(key: string, value: string): void {
    // if (key === HEADERS_ENUM.Authorization) {
    //   const encryptedCredentials = this.cryptoService.encryptToken(value);
    //   this.headers['headers'] = Object.assign({}, this.headers['headers'], { [key]: 'Bearer ' + encryptedCredentials });
    // }
    if (key === HEADERS_ENUM.Registration) {
      const encryptedCredentials = this.cryptoService.encryptToken(value);
      this.headers['headers'] = Object.assign({}, this.headers['headers'], { [key]: 'Basic ' + encryptedCredentials });
    }
    else {
      this.headers['headers'] = Object.assign({}, this.headers['headers'], { [key]: value });
    }
  }
  /**
  * Method used to remove a header for a specific key in the headers object.
  * @param {string} key - The key for the header.
  * @returns {object} - The updated headers object.
  */
  public removeHeader(key: string): void {
    delete this.headers['headers'][key];
  }
}
