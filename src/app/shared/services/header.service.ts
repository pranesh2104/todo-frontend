import { Injectable } from '@angular/core';
import { setContext } from '@apollo/client/link/context';
/**
 * Class service which is used to set,get and clear the headers for specific url request.
 */
@Injectable({
  providedIn: 'root'
})

export class HeaderService {
  /**
    * Variable which is used to define the header for url.
    */
  headers: { headers: { [key: string]: string } } = {
    headers: {}
  };
  /**
   * Method used to set headers for GraphQL requests.
   * This method creates a context for setting the Authorization header using the JWT token
   * stored in the localStorage. If no token is found, it returns an empty headers object.
   * @returns {ApolloLink} A context-setting ApolloLink instance with the appropriate headers.
   */
  public getheaders() {
    const auth = setContext(() => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('jwt_token') : null;
      const headerData = Object.keys(this.headers.headers);
      if (headerData.length && headerData.includes('Authorization')) {
        return this.headers;
      }
      else if (token) {
        return this.setHeaders('Authorization', token);
      }
      else {
        return this.headers;
      }
    });
    return auth;
  }
  /**
   * Method used to set a header for a specific key in the headers object.
   * @param {string} key - The key for the header.
   * @param {string} value - The value for the header.
   * @returns {object} - The updated headers object.
   */
  public setHeaders(key: string, value: string) {
    this.headers['headers'] = Object.assign({}, this.headers['headers'], { [key]: value });
    return this.headers['headers'];
  }
  /**
  * Method used to remove a header for a specific key in the headers object.
  * @param {string} key - The key for the header.
  * @returns {object} - The updated headers object.
  */
  public removeHeader(key: string) {
    delete this.headers['headers'][key];
    return this.headers['headers'];
  }
}
