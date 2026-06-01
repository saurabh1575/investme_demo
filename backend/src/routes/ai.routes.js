import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { matchInvestors, recommendMentors, startupHealthScore } from "../services/ai.service.js";

const router = Router();

router.post("/mentor-recommendations", requireAuth, async (req, res) => {
  res.json(await recommendMentors(req.body));
});

router.post("/investor-matches", requireAuth, async (req, res) => {
  res.json(await matchInvestors(req.body));
});

router.post("/startup-health-score", requireAuth, async (req, res) => {
  res.json(await startupHealthScore(req.body));
});

export default router;
