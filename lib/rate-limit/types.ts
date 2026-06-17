export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfter?: number;
  resetAt?: string;
  upgradeAvailable?: boolean;
}
