import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { createRazorpayOrder, createStripeCheckout } from "../services/payment.service.js";
import { payments } from "../data/mockDb.js";

const router = Router();

const checkoutSchema = z.object({
  gateway: z.enum(["STRIPE", "RAZORPAY"]),
  amount: z.coerce.number().positive(),
  description: z.string().min(2),
  bookingId: z.string().optional(),
  plan: z.string().optional()
});

router.post("/checkout", requireAuth, async (req, res) => {
  const input = checkoutSchema.parse(req.body);
  const metadata = {
    userId: req.user.id,
    bookingId: input.bookingId || "",
    plan: input.plan || ""
  };

  const payment =
    input.gateway === "STRIPE"
      ? await createStripeCheckout({ userId: req.user.id, amount: input.amount, description: input.description, metadata })
      : await createRazorpayOrder({ userId: req.user.id, amount: input.amount, description: input.description, metadata });

  res.status(201).json({ payment });
});

router.get("/history", requireAuth, (req, res) => {
  res.json({ payments: payments.filter((payment) => payment.userId === req.user.id) });
});

router.post("/stripe/webhook", (req, res) => {
  res.json({ received: true, note: "Connect Stripe raw body + STRIPE_WEBHOOK_SECRET in production." });
});

router.get("/success", (req, res) => {
  res.json({ status: "success", sessionId: req.query.session_id || null });
});

router.get("/cancel", (req, res) => {
  res.json({ status: "cancelled" });
});

export default router;
