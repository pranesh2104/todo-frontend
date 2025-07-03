import { InjectionToken, makeStateKey } from "@angular/core";
import { InMemoryCache, NormalizedCacheObject } from "@apollo/client/core";

interface IEnvironment {
  app: string;
  graphqlUri: string;
  CRYPTO_SECRET_KEY: string
}

export const EnvironmentToken = new InjectionToken<IEnvironment>('environment');


export const MY_APOLLO_CACHE = new InjectionToken<InMemoryCache>('apollo-cache');
export const STATE_KEY = makeStateKey<NormalizedCacheObject>('apollo.state');
