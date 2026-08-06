import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (value) return value;
  throw new Error(`Missing required environment variable: ${name}`);
}

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: requiredEnv("NEXT_PUBLIC_CONVEX_URL"),
  convexSiteUrl: requiredEnv("NEXT_PUBLIC_CONVEX_SITE_URL"),
});
