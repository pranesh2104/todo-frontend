import { Injectable } from '@angular/core';
import { ApolloCache, ApolloQueryResult, FetchResult } from '@apollo/client/core';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map, Observable } from 'rxjs';

interface CacheUpdateOptions<T> {
  query: string;
  listField: string;
  updateStrategy?: 'merge' | 'delete';
  responseKey: string;
  customUpdate?: (existingData: T, newData: any) => T;
  id?: string
}

@Injectable({
  providedIn: 'root'
})
export class GraphqlClientService {

  constructor(private apollo: Apollo) { }

  executeQuery<T>(query: string, variables: { [key: string]: any }): Observable<T> {
    return this.apollo.query<T>({
      query: gql`${query}`,
      variables: variables,
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
    }).pipe(map(this.handleResponse));
  }

  executeWatchQuery<T>(query: string, variables: { [key: string]: any }): Observable<T> {
    return this.apollo.watchQuery<T>({
      query: gql`${query}`,
      variables: variables,
    }).valueChanges.pipe(map(response => this.handleResponse<T>(response)));
  }

  // executeMutation<T>(mutation: string, variables: { [key: string]: any }, updateCache?: (cache: any, result: FetchResult<any>) => void): Observable<T> {
  //   return this.apollo.mutate<T>({
  //     mutation: gql`${mutation}`,
  //     variables: variables,
  //     fetchPolicy: 'network-only',

  //     ... (updateCache && { update: (cache, result) => updateCache(cache, result) })
  //   }).pipe(map(response => this.handleResponse<T>(response)));
  // }

  private handleResponse<T>(response: ApolloQueryResult<T> | MutationResult<T>): T {
    if (response && response.data) {
      return response.data;
    }
    throw new Error('No data received');
  }

  // executeMutation<T, V extends Record<string, any>>(mutation: string, variables: V, options?: { cacheConfig?: { query: string; listField: keyof T; } }): Observable<T> {
  //   return this.apollo.mutate<T>({
  //     mutation: gql`${mutation}`,
  //     variables,
  //     ...(options?.cacheConfig && {
  //       update: this.genericCacheUpdater<T>(options.cacheConfig.query, options.cacheConfig.listField)
  //     }),
  //     fetchPolicy: 'network-only'
  //   }).pipe(map(response => this.handleResponse<T>(response)));
  // }

  // private genericCacheUpdater<T>(query: string, listField: keyof T) {
  //   return (cache: ApolloCache<any>, { data }: FetchResult<any>) => {
  //     if (!data) return;

  //     const newItem = Object.values(data)[0]; // Assumes first key holds mutation result

  //     cache.updateQuery<{ [K in keyof T]?: any }>(
  //       { query: gql`${query}` },
  //       (existingData) => {
  //         if (!existingData || !existingData[listField]) return existingData;

  //         return {
  //           ...existingData,
  //           [listField]: [...(existingData[listField] as any[]), newItem]
  //         };
  //       }
  //     );
  //   };
  // }


  executeMutation<T, V extends Record<string, any>>(mutation: string, variables: V, options?: { cacheConfig?: CacheUpdateOptions<T>; }): Observable<T> {
    return this.apollo.mutate<T>({
      mutation: gql`${mutation}`,
      variables,
      fetchPolicy: 'network-only',
      ...(options?.cacheConfig && { update: this.createCacheUpdater<T>(options.cacheConfig) })
    }).pipe(
      map(response => this.handleResponse<T>(response))
    );
  }

  /**
   * Create a type-safe cache updater
   * @param cacheConfig - Cache update configuration
   */
  private createCacheUpdater<T>(cacheConfig: CacheUpdateOptions<T>) {
    return (cache: ApolloCache<any>, { data }: FetchResult<any>) => {
      if (!data) return;

      const mutationResult: any = Object.values(data)[0];
      if (!mutationResult) return;

      try {
        cache.updateQuery<T>(
          { query: gql`${cacheConfig.query}` },
          (existingData: any) => {
            if (!existingData) return existingData;

            // console.log({ existingData, mutationResult, data });

            const existingList = existingData[cacheConfig.listField]

            if (!existingList) return existingData;

            if (cacheConfig.customUpdate) {
              return {
                ...existingData,
                [cacheConfig.listField]: cacheConfig.customUpdate(existingList, mutationResult[cacheConfig.responseKey])
              };
            }

            // Default update strategies
            let updatedList: any[];
            switch (cacheConfig.updateStrategy) {
              case 'merge':
                updatedList = this.mergeListItems(existingList, mutationResult[cacheConfig.responseKey]);
                break;
              case 'delete':
                updatedList = this.deleteListItem(existingList, cacheConfig.id);
                break;
              default:
                updatedList = [...existingList, mutationResult[cacheConfig.responseKey]];
            }

            return {
              ...existingData,
              [cacheConfig.listField]: updatedList
            };
          }
        );
      } catch (error) {
        console.error('Cache update failed:', error);
      }
    };
  }

  /**
   * Merge or update items in an array of objects
   * @param existingList - Current list of items
   * @param newItem - New or updated item
   */
  private mergeListItems(existingList: any[], newItem: any): any[] {
    const itemIndex = existingList.findIndex(item => item.id === newItem.id);

    if (itemIndex !== -1) {
      return existingList.map((item, index) =>
        index === itemIndex ? { ...item, ...newItem } : item
      );
    }


    return [...existingList, newItem];
  }

  /**
   * Remove an item from the list
   * @param existingList - Current list of items
   * @param itemToDelete - Item to be deleted
   */
  private deleteListItem(existingList: any[], itemId: string | undefined): any[] {
    console.log('inside itemId', itemId);

    return existingList.filter(item => item.id !== itemId);
  }
}
