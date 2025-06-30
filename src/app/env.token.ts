import { InjectionToken } from "@angular/core";

interface IEnvironment {
  app: string;
  graphqlUri: string;
  CRYPTO_SECRET_KEY: string
}

export const EnvironmentToken = new InjectionToken<IEnvironment>('environment');