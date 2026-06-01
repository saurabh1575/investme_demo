import { Router } from "express";
import { z } from "zod";
import { insert, readDb } from "../db/fileDb.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const input = z.object({
    mentorId: z.string(),
    type: z.enum(["MESSAGE", "VOICE", "VIDEO"]),
    scheduledAt: z.string().optional(),
    notes: z.string().optional()
  }).parse(req.body);

  const db = await readDb();
  const mentor = db.mentors.find((item) => item.id === input.mentorId);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });

  const price = input.type === "MESSAGE" ? 29 : input.type === "VOICE" ? Math.max(49, mentor.fee - 30) : mentor.fee;
  const booking = await insert("bookings", {
    founderId: req.user.id,
    mentorId: mentor.id,
    type: input.type,
    scheduledAt: input.scheduledAt || "",
    notes: input.notes || "",
    price,
    status: "PAYMENT_REQUIRED"
  });

  res.status(201).json({ booking });
});

router.get("/mine", requireAuth, async (req, res) => {
  const db = await readDb();
  res.json({ bookings: db.bookings.filter((booking) => booking.founderId === req.user.id) });
});

export default router;
