import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  APP_URL: z.string().url().default("http://localhost:5000"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000,null"),
  DATABASE_URL: z.string().default("postgresql://postgres:postgres@localhost:5432/investme"),
  JWT_SECRET: z.string().min(12).default("change_this_before_production"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_ANON_KEY: z.string().optional().default(""),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  REDIS_URL: z.string().optional().default("")
});

export const env = envSchema.parse(process.env);

export const allowedOrigins = env.FRONTEND_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export function hasSecret(name) {
  return Boolean(env[name] && env[name].trim().length > 0);
}
