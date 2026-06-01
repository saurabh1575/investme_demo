import { Router } from "express";
import { env } from "../config/env.js";
import { readDb } from "../db/fileDb.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function withLinks(community) {
  return {
    ...community,
    url: env[community.urlEnv] || "",
    registeredOnly: env.REQUIRE_COMMUNITY_LOGIN || community.registeredOnly
  };
}

router.get("/", async (req, res) => {
  const db = await readDb();
  res.json({ communities: db.communities.map(withLinks) });
});

router.post("/:id/join", requireAuth, async (req, res) => {
  const db = await readDb();
  const community = db.communities.find((item) => item.id === req.params.id);
  if (!community) return res.status(404).json({ error: "Community not found" });
  res.status(201).json({
    membership: {
      communityId: community.id,
      userId: req.user.id,
      status: "JOINED",
      joinUrl: withLinks(community).url
    }
  });
});

export default router;
