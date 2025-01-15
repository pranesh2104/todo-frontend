import { Inject, inject, Injectable } from '@angular/core';
import { ApolloCache, ApolloClientOptions, HttpLink, NormalizedCacheObject, from } from '@apollo/client/core';
import { HeaderService } from './header.service';
// import { EnvService } from '@zb/shared';
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

@Injectable({
  providedIn: 'root'
})
export class GraphqlConfigService {

  graphqlUri = 'http://localhost:5300/'

  headerService: HeaderService = inject(HeaderService);

  constructor() { }

  createApollo(graphqlUri?: string): ApolloClientOptions<any> {
    // console.log('this.env: ', this.environment);
    const header = this.headerService.getheaders();
    const http = from([header, new HttpLink({ uri: this.graphqlUri })]);
    const link = header ? header.concat(http) : http;
    return {
      link,
      cache: new VoidCache()
    };
  }
}

