import { InjectionToken } from "@angular/core";

interface IEnvironment {
  app: string;
  graphqlUri: string;
}

export const EnvironmentToken = new InjectionToken<IEnvironment>('environment');