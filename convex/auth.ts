import { createClient, type GenericCtx } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import { components } from "./_generated/api";
import { DataModel } from "./_generated/dataModel";
import { query } from "./_generated/server";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";

function resolveSiteUrl(): string {
  const siteUrl = process.env.SITE_URL;
  if (siteUrl) return siteUrl;
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }
  throw new Error(
    "SITE_URL environment variable is required when NODE_ENV is not development.",
  );
}

function resolveSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("BETTER_AUTH_SECRET environment variable is required.");
  }
  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be at least 32 characters long in production.",
    );
  }
  return secret;
}

// Optional comma-separated CIDR ranges of the trusted reverse proxies that sit
// in front of this app (e.g. "10.0.0.0/8,172.16.0.0/12"). When set, Better Auth
// strips X-Forwarded-For hops belonging to these proxies and uses the first
// untrusted hop as the real client IP, so spoofed header values cannot bypass
// rate limits. Without it, only a single-value header is trusted and any
// multi-hop chain fails closed to a shared rate-limit bucket.
function resolveTrustedProxies(): string[] | undefined {
  const raw = process.env.TRUSTED_PROXIES;
  if (!raw) return undefined;
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export const authComponent = createClient<DataModel>(components.betterAuth);

const SESSION_TTL_SECONDS = 60 * 60 * 24; // 24 hours

export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth({
    baseURL: resolveSiteUrl(),
    secret: resolveSecret(),
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      minPasswordLength: 10,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: SESSION_TTL_SECONDS,
      updateAge: 60 * 60, // sliding refresh after 1 hour of activity
    },
    rateLimit: {
      enabled: true,
      window: 60,
      max: 300,
      customRules: {
        "**/sign-in/email": { window: 60, max: 5 },
        "**/sign-up/email": { window: 3600, max: 10 },
        "**/change-password": { window: 3600, max: 10 },
      },
    },
    advanced: {
      useSecureCookies: true,
      ipAddress: {
        ipAddressHeaders: ["x-forwarded-for", "x-real-ip"],
        trustedProxies: resolveTrustedProxies(),
        ipv6Subnet: 64,
      },
    },
    plugins: [
      convex({ authConfig, jwt: { expirationSeconds: SESSION_TTL_SECONDS } }),
    ],
  });
};

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    try {
      return await authComponent.getAuthUser(ctx);
    } catch (error) {
      // Unexpected errors (network, config) should surface; an expired or
      // missing token is expected and simply means "signed out".
      console.error("getCurrentUser failed:", error);
      return null;
    }
  },
});
