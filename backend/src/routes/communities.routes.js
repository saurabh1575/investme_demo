import { Router } from "express";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function withLinks(community) {
  // Try to find the exact env variable based on channelType if externalUrl isn't hardcoded
  let urlEnvName = "";
  if (community.name.includes("WhatsApp")) urlEnvName = "WHATSAPP_COMMUNITY_URL";
  if (community.name.includes("Telegram Community")) urlEnvName = "TELEGRAM_COMMUNITY_URL";
  if (community.name.includes("Founder Groups")) urlEnvName = "FOUNDER_GROUP_URL";

  return {
    ...community,
    url: community.externalUrl || env[urlEnvName] || "",
    registeredOnly: env.REQUIRE_COMMUNITY_LOGIN || community.joinPolicy === "REGISTERED_ONLY"
  };
}

router.get("/", async (req, res, next) => {
  try {
    const communities = await prisma.community.findMany();
    res.json({ communities: communities.map(withLinks) });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/join", requireAuth, async (req, res, next) => {
  try {
    const community = await prisma.community.findUnique({
      where: { id: req.params.id }
    });
    if (!community) return res.status(404).json({ error: "Community not found" });
    
    res.status(201).json({
      membership: {
        communityId: community.id,
        userId: req.user.id,
        status: "JOINED",
        joinUrl: withLinks(community).url
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
