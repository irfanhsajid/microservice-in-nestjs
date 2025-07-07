import { Request } from 'express';

export const AUTHORIZATION_HEADER = 'authorization';
export enum AUTHORIZATION_TYPE {
  BEARER = 'Bearer',
  BASIC = 'Basic',
  API_KEY = 'ApiKey',
  TOKEN = 'Token',
}

export function extractAuthorizeToken(req: Request) {
  const [tokenType, token]: [AUTHORIZATION_TYPE, string] = (req.headers[
    AUTHORIZATION_HEADER
  ]?.split(' ') ?? []) as [AUTHORIZATION_TYPE, string];
  switch (tokenType) {
    case AUTHORIZATION_TYPE.BEARER:
      return token;
    case AUTHORIZATION_TYPE.BASIC:
      return token;
    case AUTHORIZATION_TYPE.API_KEY:
      return token;
    case AUTHORIZATION_TYPE.TOKEN:
      return token;
    default:
      return undefined;
  }
}
