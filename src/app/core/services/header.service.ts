import { inject, Injectable } from '@angular/core';
import { ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { HEADERS_ENUM } from '@core/enums/core.enum';
import { CryptoService } from './crypto.service';

@Injectable({
  providedIn: 'root'
})
export class HeaderService {
  /**
   * Holds the headers
   */
  private headers: { headers: { [key: string]: string } } = { headers: {} };
  /**
   * Inject the Crypto Service.
   */
  private cryptoService = inject(CryptoService);
  /**
   * Returns an ApolloLink that injects custom headers into each GraphQL request.
   * Typically used to attach authentication or context-specific headers.
   * 
   * @returns An ApolloLink with the configured headers.
   */
  public getHeadersAplloLink(): ApolloLink {
    const auth = setContext(() => { return this.headers; });
    return auth;
  }
  /**
   * Retrieves the current set of HTTP headers used for GraphQL requests.
   * 
   * @returns An object containing the configured request headers.
   */
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
