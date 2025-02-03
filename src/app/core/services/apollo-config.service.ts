import { inject, Injectable } from '@angular/core';
import { ApolloCache, ApolloLink, NormalizedCacheObject } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { HttpLink } from 'apollo-angular/http';
import { ICustomGraphQLError } from '@core/models/core.model';
import { HeaderService } from './header.service';

@Injectable({
  providedIn: 'root'
})
export class ApolloConfigService {

  static setApolloConfig() {
    const graphqlUri = 'http://localhost:5300/graphql'

    const headers: ApolloLink = inject(HeaderService).getHeadersAplloLink();

    const httpLink = inject(HttpLink);

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

    const errorHandlingLinkResponse = errorHandlingLink();

    const apolloLinks = ApolloLink.from([errorHandlingLinkResponse, erroLink, headers, http]);

    return {
      link: apolloLinks,
      cache: new VoidCache(),
      ssrMode: true,
    };
  }
}

function errorHandlingLink() {
  return new ApolloLink((operation, forward) => {
    return forward(operation).map((response) => {
      const customError = operation.getContext()['formatError'];
      if (customError) {
        throw new Error(JSON.stringify(customError));
      }
      return response;
    });
  });
}


class VoidCache extends ApolloCache<NormalizedCacheObject> {
  read(options: any) { return null; }
  write(options: any) { return undefined; }
  diff(options: any) { return {}; }
  watch(watch: any) { return () => { }; }
  async reset() { } // eslint-disable-line
  evict(options: any) { return false; }
  restore(data: any) { return this; }
  extract(optimistic: any) { return {}; }
  removeOptimistic(id: any) { }
  override batch(options: any) { return undefined as any; }
  performTransaction(update: any, optimisticId: any) { }
  override recordOptimisticTransaction(transaction: any, optimisticId: any) { }
  override transformDocument(document: any) { return document; }
  override transformForLink(document: any) { return document; }
  override identify(object: any) { return undefined; }
  override gc() { return [] as string[]; }
  override modify(options: any) { return false; }
  override readQuery(options: any, optimistic?: any) { return null; }
  override readFragment(options: any, optimistic?: any) { return null; }
  override writeQuery(opts: any) { return undefined; }
  override writeFragment(opts: any) { return undefined; }
  override updateQuery(options: any, update: any) { return null; }
  override updateFragment(options: any, update: any) { return null; }
}