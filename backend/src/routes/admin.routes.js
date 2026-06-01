import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { mentors, payments, users } from "../data/mockDb.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/overview", (req, res) => {
  res.json({
    users: users.length,
    mentors: mentors.length,
    payments: payments.length,
    revenue: payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    pendingVerification: mentors.filter((mentor) => mentor.status !== "VERIFIED").length
  });
});

router.get("/users", (req, res) => {
  res.json({ users: users.map(({ passwordHash, ...safeUser }) => safeUser) });
});

router.patch("/mentors/:id/verify", (req, res) => {
  const mentor = mentors.find((item) => item.id === req.params.id);
  if (!mentor) return res.status(404).json({ error: "Mentor not found" });
  mentor.status = "VERIFIED";
  res.json({ mentor });
});

export default router;
