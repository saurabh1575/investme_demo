import { Router } from "express";
import { prisma } from "../db/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { sector } = req.query;
    
    // SQLite doesn't have JSON array querying, so we use string contains
    const where = sector ? {
      preferredSectors: { contains: `"${sector}"` }
    } : {};

    const investors = await prisma.investor.findMany({ 
      where,
      include: { user: true }
    });
    
    const parsedInvestors = investors.map(inv => {
      const { user, ...invData } = inv;
      return {
        ...invData,
        name: user ? user.name : "Investor",
        preferredSectors: invData.preferredSectors ? JSON.parse(invData.preferredSectors) : [],
        portfolioStartups: invData.portfolioStartups ? JSON.parse(invData.portfolioStartups) : []
      };
    });

    res.json({ investors: parsedInvestors });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/connect", requireAuth, async (req, res, next) => {
  try {
    const investor = await prisma.investor.findUnique({
      where: { id: req.params.id }
    });
    if (!investor) return res.status(404).json({ error: "Investor not found" });
    
    res.status(201).json({
      connectRequest: {
        investorId: investor.id,
        founderId: req.user.id,
        status: "PAYMENT_REQUIRED",
        paymentEndpoint: "/api/payments/checkout"
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
