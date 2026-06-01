import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { insert, publicUser, readDb } from "../db/fileDb.js";
import { requireAuth, signToken } from "../middleware/auth.js";

const router = Router();

router.post("/signup", async (req, res) => {
  const input = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    role: z.enum(["FOUNDER", "MENTOR", "INVESTOR"]).default("FOUNDER"),
    startup: z.string().optional()
  }).parse(req.body);

  const db = await readDb();
  const exists = db.users.some((user) => user.email.toLowerCase() === input.email.toLowerCase());
  if (exists) return res.status(409).json({ error: "Email already registered" });

  const user = await insert("users", {
    role: input.role,
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 10),
    plan: "FREE",
    startup: input.startup || ""
  });

  res.status(201).json({ user: publicUser(user), token: signToken(user) });
});

router.post("/login", async (req, res) => {
  const input = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const db = await readDb();
  const user = db.users.find((item) => item.email.toLowerCase() === input.email.toLowerCase());

  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({ user: publicUser(user), token: signToken(user) });
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

export default router;
