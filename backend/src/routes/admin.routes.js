import { Router } from "express";
import { env } from "../config/env.js";
import { publicUser, readDb, updateById, writeDb } from "../db/fileDb.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

router.get("/overview", async (req, res) => {
  const db = await readDb();
  res.json({
    users: db.users.length,
    mentors: db.mentors.length,
    investors: db.investors.length,
    bookings: db.bookings.length,
    payments: db.payments.length,
    revenue: db.payments.reduce((sum, item) => sum + Number(item.amount || 0), 0),
    integrations: {
      whatsapp: env.WHATSAPP_COMMUNITY_URL,
      telegram: env.TELEGRAM_COMMUNITY_URL,
      stripeConfigured: Boolean(env.STRIPE_SECRET_KEY),
      razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID),
      openaiConfigured: Boolean(env.OPENAI_API_KEY)
    }
  });
});

router.get("/users", async (req, res) => {
  const db = await readDb();
  res.json({ users: db.users.map(publicUser) });
});

router.patch("/mentors/:id", async (req, res) => {
  const mentor = await updateById("mentors", req.params.id, req.body);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });
  res.json({ mentor });
});

router.patch("/settings", async (req, res) => {
  const db = await readDb();
  db.settings = { ...db.settings, ...req.body };
  await writeDb(db);
  res.json({ settings: db.settings });
});

export default router;
