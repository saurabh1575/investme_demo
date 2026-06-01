import { Router } from "express";
import { z } from "zod";
import { mentors, createRecord } from "../data/mockDb.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const localBookings = [];

const bookingSchema = z.object({
  mentorId: z.string(),
  type: z.enum(["MESSAGE", "VOICE", "VIDEO"]),
  scheduledAt: z.string().optional(),
  notes: z.string().optional()
});

router.post("/", requireAuth, (req, res) => {
  const input = bookingSchema.parse(req.body);
  const mentor = mentors.find((item) => item.id === input.mentorId);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });

  const price = input.type === "MESSAGE" ? 29 : input.type === "VOICE" ? Math.max(49, mentor.fee - 30) : mentor.fee;
  const booking = createRecord(localBookings, {
    founderId: req.user.id,
    mentorId: mentor.id,
    type: input.type,
    scheduledAt: input.scheduledAt || null,
    notes: input.notes || "",
    price,
    status: "PAYMENT_REQUIRED"
  });

  res.status(201).json({
    booking,
    nextStep: {
      endpoint: "/api/payments/checkout",
      payload: { bookingId: booking.id, gateway: "STRIPE", amount: price, description: `${input.type} consultation with ${mentor.name}` }
    }
  });
});

router.get("/mine", requireAuth, (req, res) => {
  res.json({ bookings: localBookings.filter((booking) => booking.founderId === req.user.id) });
});

export default router;
