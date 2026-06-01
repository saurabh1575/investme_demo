import { Router } from "express";
import { env } from "../config/env.js";

const router = Router();

router.get("/public", (req, res) => {
  res.json({
    appName: "InvestMe",
    apiUrl: `${env.APP_URL}/api`,
    requireCommunityLogin: env.REQUIRE_COMMUNITY_LOGIN,
    communityLinks: {
      whatsapp: env.WHATSAPP_COMMUNITY_URL,
      telegram: env.TELEGRAM_COMMUNITY_URL,
      founders: env.FOUNDER_GROUP_URL
    },
    integrations: {
      stripeConfigured: Boolean(env.STRIPE_SECRET_KEY),
      razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET),
      openaiConfigured: Boolean(env.OPENAI_API_KEY)
    }
  });
});

export default router;
