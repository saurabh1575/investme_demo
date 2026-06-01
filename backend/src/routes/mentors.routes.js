import { Router } from "express";
import { z } from "zod";
import { mentors } from "../data/mockDb.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", (req, res) => {
  const { industry, stage, funding, maxFee } = req.query;
  const result = mentors.filter((mentor) => {
    return (
      (!industry || mentor.industry === industry) &&
      (!stage || mentor.startupStage === stage) &&
      (!funding || mentor.fundingStage === funding) &&
      (!maxFee || mentor.fee <= Number(maxFee))
    );
  });
  res.json({ mentors: result });
});

router.get("/:id", (req, res) => {
  const mentor = mentors.find((item) => item.id === req.params.id);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });
  res.json({ mentor });
});

router.patch("/:id/availability", requireAuth, requireRole("MENTOR", "ADMIN"), (req, res) => {
  const input = z.object({ availability: z.string().min(2) }).parse(req.body);
  const mentor = mentors.find((item) => item.id === req.params.id);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });
  mentor.availability = input.availability;
  res.json({ mentor });
});

export default router;
