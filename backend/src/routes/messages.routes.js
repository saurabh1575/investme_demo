import { Router } from "express";
import { z } from "zod";
import { createRecord, messages } from "../data/mockDb.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, (req, res) => {
  const input = z.object({
    receiverId: z.string(),
    body: z.string().min(1),
    sessionId: z.string().optional(),
    paidUnlockId: z.string().optional()
  }).parse(req.body);

  const message = createRecord(messages, {
    senderId: req.user.id,
    receiverId: input.receiverId,
    body: input.body,
    sessionId: input.sessionId || null,
    paidUnlockId: input.paidUnlockId || null,
    readAt: null
  });

  res.status(201).json({ message });
});

router.get("/", requireAuth, (req, res) => {
  const inbox = messages.filter((message) => message.senderId === req.user.id || message.receiverId === req.user.id);
  res.json({ messages: inbox });
});

export default router;
