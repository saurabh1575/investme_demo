import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { users, createRecord } from "../data/mockDb.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["FOUNDER", "MENTOR", "INVESTOR"]).default("FOUNDER"),
  startup: z.string().optional()
});

router.post("/signup", async (req, res) => {
  const input = signupSchema.parse(req.body);
  const exists = users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (exists) return res.status(409).json({ error: "Email already registered" });

  const user = createRecord(users, {
    role: input.role,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 10),
    plan: "FREE",
    startup: input.startup || null
  });

  const { passwordHash, ...safeUser } = user;
  res.status(201).json({ user: safeUser, token: signToken(user) });
});

router.post("/login", async (req, res) => {
  const input = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = users.find((item) => item.email.toLowerCase() === input.email.toLowerCase());
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const { passwordHash, ...safeUser } = user;
  res.json({ user: safeUser, token: signToken(user) });
});

router.get("/me", requireAuth, (req, res) => {
  const { passwordHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

router.post("/google", (req, res) => {
  res.json({
    mode: "placeholder",
    message: "Use Supabase/Firebase Google auth on frontend, then exchange verified identity for an InvestMe JWT."
  });
});

router.post("/otp/request", (req, res) => {
  res.json({ mode: "placeholder", message: "OTP provider hook ready. Store OTP hash in Redis with short TTL." });
});

router.post("/otp/verify", (req, res) => {
  res.json({ mode: "placeholder", message: "Verify OTP from Redis, then issue JWT." });
});

export default router;
