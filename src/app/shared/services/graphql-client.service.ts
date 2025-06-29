import { Injectable } from '@angular/core';
import { ApolloCache, ApolloQueryResult, FetchResult } from '@apollo/client/core';
import { removeUndefined } from '@shared/utils/common.util';
import { Apollo, gql, MutationResult } from 'apollo-angular';
import { map, Observable } from 'rxjs';

// interface CacheUpdateOptions<T> {
//   query: string;
//   listField: string;
//   updateStrategy?: 'update' | 'delete' | 'add';
//   responseKey?: string;
//   customUpdate?: (existingData: T, newData: any) => T;
//   id?: string;
//   idFieldName?: string;
// }

interface CacheUpdateOptions<T> {
  query: string;
  listField: string;
  updateStrategy?: 'merge' | 'delete';
  responseKey?: string;
  customUpdate?: (existingData: T, newData: any) => T;
  id?: string;
  useModify?: boolean;
  middleVariable?: string;
}

interface ExistingRefs {
  __ref: string;
}

type UpdatedData = {
  [key: string]: () => any;
};

@Injectable({
  providedIn: 'root'
})
export class GraphqlClientService {

  constructor(private apollo: Apollo) { }
  /**
   * Executes a one-time GraphQL query and returns an Observable of the typed data.
   * 
   * @template T - The expected shape of the query result data.
   * @param query - The GraphQL query string.
   * @param variables - An object containing the query variables.
   * @returns Observable<T> emitting the query result data.
   * 
   * Uses:
   * - `fetchPolicy: 'network-only'` to bypass cache and always fetch fresh data.
   * - `errorPolicy: 'all'` to allow handling partial errors if needed.
   * - Uses a custom response handler to extract the `data` field or throw an error if missing.
   */
  executeQuery<T>(query: string, variables: { [key: string]: any }): Observable<T> {
    return this.apollo.query<T>({
      query: gql`${query}`,
      variables: variables,
      errorPolicy: 'all',
      fetchPolicy: 'network-only',
    }).pipe(map(this.handleResponse));
  }
  /**
   * Executes a watched GraphQL query returning an Observable that emits on data changes.
   * 
   * @template T - The expected shape of the query result data.
   * @param query - The GraphQL query string.
   * @param variables - An object containing the query variables.
   * @returns Observable<T> emitting the latest query result data on changes.
   * 
   * This method uses Apollo's `watchQuery` for reactive updates.
   */
  executeWatchQuery<T>(query: string, variables: { [key: string]: any }): Observable<T> {
    return this.apollo.watchQuery<T>({
      query: gql`${query}`,
      variables: variables,
    }).valueChanges.pipe(map(response => this.handleResponse<T>(response)));
  }
  /**
   * Helper to extract the `data` property from Apollo query/mutation results,
   * throwing an error if no data is present.
   * 
   * @template T - The expected data shape.
   * @param response - ApolloQueryResult<T> or MutationResult<T>
   * @returns The `data` property of the response.
   * @throws Error if `data` is missing or falsy.
   */
  private handleResponse<T>(response: ApolloQueryResult<T> | MutationResult<T>): T {
    if (response && response.data) {
      return response.data;
    }
    throw new Error('No data received');
  }
  /**
   * Executes a GraphQL mutation and returns an Observable of the mutation result data.
   * 
   * @template T - The expected mutation result shape.
   * @template V - The variables object shape.
   * @param mutation - The GraphQL mutation string.
   * @param variables - The variables to pass to the mutation.
   * @param options - Optional object for cache update config.
   * @returns Observable<T> emitting the mutation result data.
   * 
   * Optionally accepts a cache update configuration to update Apollo cache after mutation.
   */
  executeMutation<T, V extends Record<string, any>>(mutation: string, variables: V, options?: { cacheConfig?: CacheUpdateOptions<T>; }): Observable<T> {
    return this.apollo.mutate<T>({
      mutation: gql`${mutation}`,
      variables,
      fetchPolicy: 'network-only',
      ...(options?.cacheConfig && { update: this.createCacheUpdater<T>(options.cacheConfig, variables) })
    }).pipe(
      map(response => this.handleResponse<T>(response))
    );
  }
  /**
   * Executes a GraphQL mutation specifically for deletion and handles cache eviction.
   * 
   * @template T - The expected mutation result shape.
   * @template V - The variables object shape.
   * @param mutation - The GraphQL mutation string for deletion.
   * @param variables - The variables to pass to the mutation. Must include `taskId` to evict from cache.
   * @returns Observable<T> emitting the mutation result data.
   * 
   * This method evicts the deleted entity from Apollo cache using `cache.evict` and runs garbage collection.
   */
  executeDeleteMutation<T, V extends Record<string, any>>(mutation: string, variables: V): Observable<T> {
    return this.apollo.mutate<T>({
      mutation: gql`${mutation}`,
      variables,
      update: (cache, { data }) => {
        cache.evict({ id: cache.identify({ __typename: 'TaskResponse', id: variables['taskId'] }) });
        cache.gc();
      }
    }).pipe(
      map(response => this.handleResponse<T>(response))
    );
  }

  /**
   * Create a type-safe cache updater
   * @param cacheConfig - Cache update configuration
   */
  // private createCacheUpdater<T>(cacheConfig: CacheUpdateOptions<T>, variables: Record<string, any>) {
  //   return (cache: ApolloCache<any>, { data }: FetchResult<any>) => {
  //     if (!data) return;
  //     console.log('data ', data);

  //     const { listField, updateStrategy, idFieldName = 'id' } = cacheConfig;

  //     const mutationResult: any = Object.values(data)[0];
  //     if (!mutationResult) return;

  //     try {
  //       let typename: string | null = null;
  //       const itemId = this.findId(variables, cacheConfig);

  //       if (updateStrategy !== 'add') {
  //         const existingList = cache.readQuery<any>({ query: gql`{ ${listField} { ${idFieldName} } }` });
  //         console.log({ existingList });

  //         const existingItem = existingList?.[listField]?.find((item: any) => item[idFieldName] === itemId);
  //         console.log({ existingItem });

  //         if (existingItem)
  //           typename = existingItem.__typename;

  //       }
  //       console.log({ typename, variables, itemId });
  //       if (updateStrategy !== 'add' && typename) {
  //         let updatedData = Object.values(variables)[0];
  //         console.log('updatedData ', updatedData);
  //         if (updatedData.id) delete updatedData.id;
  //         updatedData = removeUndefined(updatedData);
  //         if (updatedData.tags) {
  //           this.handleTagCache(cache, updatedData.tags)
  //         }
  //         const updatedFields = Object.entries(updatedData).reduce((acc, [key, value]) => {
  //           console.log({ value });

  //           acc[key] = () => value;
  //           return acc;
  //         }, {} as Record<string, (existing: any) => any>);
  //         console.log('updatedFields ', updatedFields);

  //         cache.modify({
  //           id: cache.identify({ [idFieldName]: itemId, __typename: typename }),
  //           fields: updatedFields
  //         });
  //       }
  //     } catch (error) {
  //       console.error('Cache update failed:', error);
  //     }
  //   };
  // }

  // private handleTagCache(cache: ApolloCache<any>, tags: { added: string[], removed: string[] }) {
  //   const rawData = cache.extract();
  //   if (tags.added.length) {

  //   }
  //   console.log(cache);
  // }

  // private findTypeName(existingRefs: ExistingRefs[], itemId: string | null): string | null {
  //   if (existingRefs && existingRefs.length > 0 && itemId) {
  //     const referenceName = existingRefs.find((existingRef) => existingRef.__ref.includes(itemId));
  //     if (referenceName)
  //       return referenceName.__ref.split(':')[0];
  //   }
  //   return null;
  // }

  // private findId<T>(variables: Record<string, any>, cacheConfig: CacheUpdateOptions<T>): string | null {
  //   const idName = cacheConfig.idFieldName || 'id';
  //   if (variables[idName]) {
  //     return variables[idName];
  //   }
  //   const foundItem = Object.values(variables).find((value) => value && typeof value === 'object' && idName in value);

  //   return foundItem ? foundItem[idName] : null;
  // }
  // /**
  //  * Merge or update items in an array of objects
  //  * @param existingList - Current list of items
  //  * @param newItem - New or updated item
  //  */
  // private mergeListItems(existingList: any[], newItem: any): any[] {
  //   const itemIndex = existingList.findIndex(item => item.id === newItem.id);

  //   if (itemIndex !== -1) {
  //     return existingList.map((item, index) =>
  //       index === itemIndex ? { ...item, ...newItem } : item
  //     );
  //   }

  //   return [...existingList, newItem];
  // }

  // /**
  //  * Remove an item from the list
  //  * @param existingList - Current list of items
  //  * @param itemToDelete - Item to be deleted
  //  */
  // private deleteListItem(existingList: any[], itemId: string | undefined): any[] {
  //   return existingList.filter(item => item.id !== itemId);
  // }

  private createCacheUpdater<T>(cacheConfig: CacheUpdateOptions<T>, variables: Record<string, any>) {
    return (cache: ApolloCache<any>, { data }: FetchResult<any>) => {
      if (!data) return;

      const mutationResult: any = Object.values(data)[0];
      if (!mutationResult) return;

      try {
        if (cacheConfig.useModify) {
          let itemId;
          if (cacheConfig.middleVariable) {
            itemId = variables[cacheConfig.middleVariable]['taskId'];
            delete variables[cacheConfig.middleVariable]['taskId'];
            variables = variables[cacheConfig.middleVariable]
          }
          const updatedFields = Object.entries(variables).reduce((acc, [key, value]) => {
            if (value !== 'undefined' && value !== null && value !== undefined)
              acc[key] = () => value;
            return acc;
          }, {} as Record<string, (existing: any) => any>);

          cache.modify({
            id: cache.identify({ id: itemId, __typename: 'TaskResponse' }),
            fields: updatedFields
          });
        }
        else {
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
                  [cacheConfig.listField]: cacheConfig.customUpdate(existingList, cacheConfig.responseKey ? mutationResult[cacheConfig.responseKey] : '')
                };
              }
              if (!cacheConfig.responseKey) return null;
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
        }
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
    return existingList.filter(item => item.id !== itemId);
  }
}
