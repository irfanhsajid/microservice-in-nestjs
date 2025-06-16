export interface BlacklistTokenStorageProvider {
  storeToken(token: string, userId: number, expiresAt: Date): Promise<void>;
  isTokenBlacklisted(token: string): Promise<boolean>;
  cleanExpiredTokens(): Promise<void>;
}
