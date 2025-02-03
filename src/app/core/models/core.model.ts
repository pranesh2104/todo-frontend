import { GraphQLFormattedError } from "graphql";

export interface ICustomGraphQLError extends GraphQLFormattedError {
  code?: string;
  success?: boolean;
  stacktrace?: string[] | null;
}


export interface IAuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface DecodedToken {
  sub: string;
  exp: number;
  jti: string;
  type: string;
  iat: number;
}

export interface IRefreshTokenResponse {
  refreshAccessToken: IAuthTokens;
}