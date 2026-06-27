import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { industry, maxFee } = req.query;
    const where = {};
    if (industry) where.industry = industry;
    if (maxFee) where.fee = { lte: Number(maxFee) };

    const mentors = await prisma.mentor.findMany({ 
      where,
      include: { user: true }
    });
    
    // Parse expertise since it is JSON string in SQLite, and flatten user name
    const parsedMentors = mentors.map(m => {
      const { user, ...mentorData } = m;
      return {
        ...mentorData,
        name: user ? user.name : "Mentor",
        expertise: mentorData.expertise ? JSON.parse(mentorData.expertise) : []
      };
    });

    res.json({ mentors: parsedMentors });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const mentor = await prisma.mentor.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    });
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });
    
    const { user, ...mentorData } = mentor;
    const finalMentor = {
      ...mentorData,
      name: user ? user.name : "Mentor",
      expertise: mentorData.expertise ? JSON.parse(mentorData.expertise) : []
    };
    res.json({ mentor: finalMentor });
  } catch (error) {
    next(error);
  }
});

router.post("/", requireAuth, requireRole("ADMIN"), async (req, res, next) => {
  try {
    const input = z.object({
      name: z.string().min(2),
      designation: z.string().min(2),
      experienceYears: z.coerce.number().min(0),
      industry: z.string().min(2),
      expertise: z.array(z.string()).default([]),
      fee: z.coerce.number().min(0),
      availability: z.string().default("Available soon")
    }).parse(req.body);

    // Create a dummy user for the new mentor if we don't pass a userId
    // Realistically you'd want to pass an existing userId here, but maintaining original logic flow
    const userId = `usr_mentor_${Date.now()}`;
    await prisma.user.create({
      data: {
        id: userId,
        name: input.name,
        email: `${userId}@investme.demo`,
        role: "MENTOR"
      }
    });

    const mentor = await prisma.mentor.create({
      data: {
        userId,
        designation: input.designation,
        experienceYears: input.experienceYears,
        industry: input.industry,
        expertise: JSON.stringify(input.expertise),
        fee: input.fee,
        availability: input.availability,
        rating: 0,
        status: "VERIFIED"
      }
    });
    
    mentor.expertise = JSON.parse(mentor.expertise);
    res.status(201).json({ mentor });
  } catch (error) {
    next(error);
  }
});

router.patch("/:id", requireAuth, requireRole("ADMIN", "MENTOR"), async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (data.expertise) {
      data.expertise = JSON.stringify(data.expertise);
    }
    const mentor = await prisma.mentor.update({
      where: { id: req.params.id },
      data
    });
    
    mentor.expertise = mentor.expertise ? JSON.parse(mentor.expertise) : [];
    res.json({ mentor });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: "Mentor not found" });
    }
    next(error);
  }
});

export default router;
