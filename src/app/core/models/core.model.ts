import { GraphQLFormattedError } from "graphql";

export interface ICustomGraphQLError extends GraphQLFormattedError {
  code?: string;
  success?: boolean;
  stacktrace?: string[] | null;
}

export interface DecodedToken {
  sub: string;
  exp: number;
  jti: string;
  type: string;
  iat: number;
}

export interface IPRIORITY {
  name: string;
  value: string;
  color: string;
}