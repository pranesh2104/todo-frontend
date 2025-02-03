import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map, Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class GraphqlClientService {

  constructor(private apollo: Apollo) { }

  executeQuery(query: string, variables: { [key: string]: any }): Observable<any> {
    return this.apollo.query({
      query: gql`${query}`,
      variables: variables,
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
    }).pipe(map(this.handleResponse));
  }

  executeWatchQuery(query: string, variables: { [key: string]: any }): Observable<any> {
    return this.apollo.watchQuery({
      query: gql`${query}`,
      variables: variables,
    }).valueChanges;
  }

  executeMutation(mutation: string, variables: { [key: string]: any }): Observable<any> {
    return this.apollo.mutate({
      mutation: gql`${mutation}`,
      variables: variables,
      fetchPolicy: 'network-only'
    }).pipe(map(this.handleResponse));
  }

  private handleResponse(response: ApolloQueryResult<any> | MutationResult<any>): any {
    // if (response && response.data && response.errors) {
    //   const data = response?.data ?? null;
    //   const errors = response.errors.reduce((acc: any, item: any) => {
    //     const key = item.path[0];
    //     acc[key] = item;
    //     return acc;
    //   }, {});
    //   throw { ...data, errors };
    // }
    console.log('response ', response);

    if (response && response.data) {
      return response.data;
    }
    // if (response && response.errors) {
    //   return response.errors;
    // }
  }
}
