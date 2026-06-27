import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const input = z.object({
      receiverId: z.string(),
      body: z.string().min(1),
      bookingId: z.string().optional()
    }).parse(req.body);

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: input.receiverId,
        body: input.body,
        sessionId: input.bookingId || null,
      }
    });
    res.status(201).json({ message });
  } catch (error) {
    next(error);
  }
});

router.get("/", requireAuth, async (req, res, next) => {
  try {
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      }
    });
    res.json({ messages });
  } catch (error) {
    next(error);
  }
});

export default router;
