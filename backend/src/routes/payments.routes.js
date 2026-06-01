import { Router } from "express";
import { z } from "zod";
import { readDb } from "../db/fileDb.js";
import { requireAuth } from "../middleware/auth.js";
import { createPayment } from "../services/payment.service.js";

const router = Router();

router.post("/checkout", requireAuth, async (req, res) => {
  const input = z.object({
    gateway: z.enum(["STRIPE", "RAZORPAY"]).default("STRIPE"),
    amount: z.coerce.number().positive(),
    description: z.string().min(2),
    bookingId: z.string().optional(),
    plan: z.string().optional()
  }).parse(req.body);

  const payment = await createPayment({
    userId: req.user.id,
    gateway: input.gateway,
    amount: input.amount,
    description: input.description,
    metadata: { bookingId: input.bookingId || "", plan: input.plan || "" }
  });
  res.status(201).json({ payment });
});

router.get("/history", requireAuth, async (req, res) => {
  const db = await readDb();
  res.json({ payments: db.payments.filter((payment) => payment.userId === req.user.id) });
});

router.get("/success", (req, res) => res.json({ status: "success", sessionId: req.query.session_id || "" }));
router.get("/cancel", (req, res) => res.json({ status: "cancelled" }));
router.post("/stripe/webhook", (req, res) => res.json({ received: true, note: "Add raw-body webhook verification before production." }));

export default router;
