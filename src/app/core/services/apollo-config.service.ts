import { inject, Injectable } from '@angular/core';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from 'apollo-angular/http';
import { ICustomGraphQLError } from '@core/models/core.model';
import { HeaderService } from './header.service';
import { EnvironmentToken } from 'app/env.token';

@Injectable({
  providedIn: 'root'
})
export class ApolloConfigService {

  static setApolloConfig() {

    const headers: ApolloLink = inject(HeaderService).getHeadersAplloLink();

    const httpLink = inject(HttpLink);

    const graphqlUri = inject(EnvironmentToken).graphqlUri;

    const http = httpLink.create({ uri: graphqlUri, withCredentials: true });

    const erroLink = onError(({ networkError, graphQLErrors, operation }) => {
      if (graphQLErrors) {
        const customError = graphQLErrors.map((error: ICustomGraphQLError) => {
          const { message, code } = error;
          return { message, code, success: false };
        })[0];
        operation.setContext({ formatError: customError });
      }

      if (networkError) {
        console.error('Network Error:', networkError);
        operation.setContext({
          formatError: { message: 'Network error occurred', code: 'NETWORK_ERROR', success: false }
        });
      }
    });

    const errorHandlingLinkResponse = new ApolloLink((operation, forward) => {
      return forward(operation).map((response) => {
        const customError = operation.getContext()['formatError'];
        if (customError) {
          throw new Error(JSON.stringify(customError));
        }
        return response;
      });
    });

    const apolloLinks = ApolloLink.from([errorHandlingLinkResponse, erroLink, headers, http]);

    return {
      link: apolloLinks,
      cache: new InMemoryCache(),
      ssrMode: true,
      credentials: 'include'
    };
  }
}