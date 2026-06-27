import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { createPayment } from "../services/payment.service.js";

const router = Router();

router.post("/checkout", requireAuth, async (req, res, next) => {
  try {
    const input = z.object({
      gateway: z.enum(["RAZORPAY"]).default("RAZORPAY"),
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
  } catch (error) {
    next(error);
  }
});

router.get("/history", requireAuth, async (req, res, next) => {
  try {
    const payments = await prisma.payment.findMany({
      where: { userId: req.user.id }
    });
    res.json({ payments });
  } catch (error) {
    next(error);
  }
});

router.get("/success", (req, res) => res.json({ status: "success", sessionId: req.query.session_id || "" }));
router.get("/cancel", (req, res) => res.json({ status: "cancelled" }));


export default router;
