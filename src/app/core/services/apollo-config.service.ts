import { inject, Injectable, TransferState } from '@angular/core';
import { ApolloLink, InMemoryCache } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from 'apollo-angular/http';
import { ICustomGraphQLError } from '@core/models/core.model';
import { HeaderService } from './header.service';
import { EnvironmentToken, MY_APOLLO_CACHE, STATE_KEY } from 'app/env.token';

@Injectable({
  providedIn: 'root'
})
export class ApolloConfigService {

  static setApolloConfig() {

    const headers: ApolloLink = inject(HeaderService).getHeadersAplloLink();

    const httpLink = inject(HttpLink);

    const graphqlUri = inject(EnvironmentToken).graphqlUri;

    const http = httpLink.create({ uri: graphqlUri, withCredentials: true });

    const cache = inject(MY_APOLLO_CACHE);

    const transferState = inject(TransferState);
    const isBrowser = transferState.hasKey(STATE_KEY);
    if (isBrowser) {
      const state = transferState.get(STATE_KEY, {});
      cache.restore(state);
    } else {
      transferState.onSerialize(STATE_KEY, () => {
        const result = cache.extract();
        cache.reset();
        return result;
      });
    }

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
      cache: cache,
      ssrMode: true,
      credentials: 'include'
    };
  }
}