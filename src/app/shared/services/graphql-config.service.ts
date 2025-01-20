import { inject, Injectable } from '@angular/core';
import { ApolloClientOptions, HttpLink, InMemoryCache, from } from '@apollo/client/core';
import { HeaderService } from './header.service';
@Injectable({
  providedIn: 'root'
})
export class GraphqlConfigService {

  graphqlUri = 'http://localhost:5300/'

  headerService: HeaderService = inject(HeaderService);

  constructor() { }

  createApollo(): ApolloClientOptions<any> {
    // console.log('this.env: ', this.environment);
    const header = this.headerService.getheaders();
    const http = from([header, new HttpLink({ uri: this.graphqlUri })]);
    const link = header ? header.concat(http) : http;
    return {
      link,
      cache: new InMemoryCache()
    };
  }
}

