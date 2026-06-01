import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, "..", "..");

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  APP_URL: z.string().default("http://localhost:5000"),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000,http://127.0.0.1:5500,null"),
  DB_FILE: z.string().default("./data/database.json"),
  JWT_SECRET: z.string().min(12).default("change_this_before_production_please"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  WHATSAPP_COMMUNITY_URL: z.string().default("https://chat.whatsapp.com/YOUR_INVITE_CODE"),
  TELEGRAM_COMMUNITY_URL: z.string().default("https://t.me/YOUR_TELEGRAM_GROUP"),
  FOUNDER_GROUP_URL: z.string().default("https://t.me/YOUR_FOUNDER_GROUP"),
  REQUIRE_COMMUNITY_LOGIN: z.coerce.boolean().default(false),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  RAZORPAY_KEY_ID: z.string().optional().default(""),
  RAZORPAY_KEY_SECRET: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  SUPABASE_URL: z.string().optional().default(""),
  SUPABASE_ANON_KEY: z.string().optional().default(""),
  FIREBASE_PROJECT_ID: z.string().optional().default("")
});

export const env = schema.parse(process.env);
export const allowedOrigins = env.FRONTEND_ORIGIN.split(",").map((item) => item.trim()).filter(Boolean);
export const dbFile = path.resolve(backendRoot, env.DB_FILE);

export function hasSecret(name) {
  return Boolean(env[name] && String(env[name]).trim().length > 0);
}
