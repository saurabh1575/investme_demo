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
      razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID),
      groqConfigured: Boolean(env.GROQ_API_KEY)
    },
    razorpayKeyId: env.RAZORPAY_KEY_ID || null
  });
});

export default router;
