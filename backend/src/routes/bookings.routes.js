import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/", requireAuth, async (req, res, next) => {
  try {
    const input = z.object({
      mentorId: z.string(),
      type: z.enum(["MESSAGE", "VOICE", "VIDEO"]),
      scheduledAt: z.string().optional(),
      notes: z.string().optional()
    }).parse(req.body);

    const mentor = await prisma.mentor.findUnique({
      where: { id: input.mentorId }
    });
    if (!mentor) return res.status(404).json({ error: "Mentor not found" });

    const price = input.type === "MESSAGE" ? 29 : input.type === "VOICE" ? Math.max(49, mentor.fee - 30) : mentor.fee;
    
    const session = await prisma.session.create({
      data: {
        founderId: req.user.id,
        mentorId: mentor.id,
        type: input.type,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        price,
        status: "PAYMENT_REQUIRED",
        booking: {
          create: {
            notes: input.notes || "",
            confirmationStatus: "PENDING",
            requestedSlot: input.scheduledAt ? new Date(input.scheduledAt) : null
          }
        }
      },
      include: {
        booking: true
      }
    });

    // Flatten to match the old format
    const bookingResult = {
      id: session.booking.id,
      sessionId: session.id,
      founderId: session.founderId,
      mentorId: session.mentorId,
      type: session.type,
      scheduledAt: session.scheduledAt,
      notes: session.booking.notes,
      price: session.price,
      status: session.status
    };

    res.status(201).json({ booking: bookingResult });
  } catch (error) {
    next(error);
  }
});

router.get("/mine", requireAuth, async (req, res, next) => {
  try {
    const sessions = await prisma.session.findMany({
      where: { founderId: req.user.id },
      include: { booking: true }
    });
    
    const bookings = sessions.map(session => ({
      id: session.booking ? session.booking.id : session.id,
      sessionId: session.id,
      founderId: session.founderId,
      mentorId: session.mentorId,
      type: session.type,
      scheduledAt: session.scheduledAt,
      notes: session.booking ? session.booking.notes : "",
      price: session.price,
      status: session.status
    }));

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
});

export default router;
