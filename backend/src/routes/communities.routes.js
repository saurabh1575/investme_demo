import { Router } from "express";
import { communities } from "../data/mockDb.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ communities });
});

router.post("/:id/join", requireAuth, (req, res) => {
  const community = communities.find((item) => item.id === req.params.id);
  if (!community) return res.status(404).json({ error: "Community not found" });
  res.status(201).json({
    membership: {
      communityId: community.id,
      userId: req.user.id,
      status: "JOINED",
      externalJoinUrl: "Set the real WhatsApp/Telegram invite URL in the database."
    }
  });
});

export default router;
