import { Router } from "express";
import { z } from "zod";
import { insert, readDb, updateById } from "../db/fileDb.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const db = await readDb();
  const { industry, maxFee } = req.query;
  const mentors = db.mentors.filter((mentor) => {
    return (!industry || mentor.industry === industry) && (!maxFee || mentor.fee <= Number(maxFee));
  });
  res.json({ mentors });
});

router.get("/:id", async (req, res) => {
  const db = await readDb();
  const mentor = db.mentors.find((item) => item.id === req.params.id);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });
  res.json({ mentor });
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res) => {
  const input = z.object({
    name: z.string().min(2),
    designation: z.string().min(2),
    experienceYears: z.coerce.number().min(0),
    industry: z.string().min(2),
    expertise: z.array(z.string()).default([]),
    fee: z.coerce.number().min(0),
    availability: z.string().default("Available soon")
  }).parse(req.body);
  res.status(201).json({ mentor: await insert("mentors", { ...input, rating: 0, status: "VERIFIED" }) });
});

router.patch("/:id", requireAuth, requireRole("ADMIN", "MENTOR"), async (req, res) => {
  const mentor = await updateById("mentors", req.params.id, req.body);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });
  res.json({ mentor });
});

export default router;
