import { Router } from "express";
import { env } from "../config/env.js";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth, requireRole("ADMIN"));

function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}

router.get("/overview", async (req, res, next) => {
  try {
    const [users, mentors, investors, bookings, paymentsList] = await Promise.all([
      prisma.user.count(),
      prisma.mentor.count(),
      prisma.investor.count(),
      prisma.booking.count(),
      prisma.payment.findMany()
    ]);
    
    res.json({
      users,
      mentors,
      investors,
      bookings,
      payments: paymentsList.length,
      revenue: paymentsList.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      integrations: {
        whatsapp: env.WHATSAPP_COMMUNITY_URL,
        telegram: env.TELEGRAM_COMMUNITY_URL,
        razorpayConfigured: Boolean(env.RAZORPAY_KEY_ID),
        groqConfigured: Boolean(env.GROQ_API_KEY)
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get("/users", async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.json({ users: users.map(publicUser) });
  } catch (error) {
    next(error);
  }
});

router.patch("/mentors/:id", async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.expertise) data.expertise = JSON.stringify(data.expertise);

    const mentor = await prisma.mentor.update({
      where: { id: req.params.id },
      data
    });
    
    mentor.expertise = mentor.expertise ? JSON.parse(mentor.expertise) : [];
    res.json({ mentor });
  } catch (error) {
    if (error.code === 'P2025') return res.status(404).json({ error: "Mentor not found" });
    next(error);
  }
});

// Since settings were dynamically added to the JSON, we don't have a settings table.
// Usually settings belong in a Config table or Environment variable.
// For now we'll just mock this response since the schema doesn't have a Settings model.
router.patch("/settings", async (req, res) => {
  // Stub for backwards compatibility
  res.json({ settings: req.body });
});

export default router;
