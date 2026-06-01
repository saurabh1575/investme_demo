import { Router } from "express";
import { z } from "zod";
import { insert, readDb } from "../db/fileDb.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res) => {
  const input = z.object({
    receiverId: z.string(),
    body: z.string().min(1),
    bookingId: z.string().optional()
  }).parse(req.body);

  const message = await insert("messages", {
    senderId: req.user.id,
    receiverId: input.receiverId,
    body: input.body,
    bookingId: input.bookingId || "",
    readAt: ""
  });
  res.status(201).json({ message });
});

router.get("/", requireAuth, async (req, res) => {
  const db = await readDb();
  res.json({ messages: db.messages.filter((msg) => msg.senderId === req.user.id || msg.receiverId === req.user.id) });
});

export default router;
