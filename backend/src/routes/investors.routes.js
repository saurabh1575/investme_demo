import { Router } from "express";
import { investors } from "../data/mockDb.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", (req, res) => {
  const { sector, maxTicket } = req.query;
  const result = investors.filter((investor) => {
    return (
      (!sector || investor.preferredSectors.includes(sector)) &&
      (!maxTicket || investor.ticketMin <= Number(maxTicket))
    );
  });
  res.json({ investors: result });
});

router.post("/:id/connect", requireAuth, (req, res) => {
  const investor = investors.find((item) => item.id === req.params.id);
  if (!investor) return res.status(404).json({ error: "Investor not found" });
  res.status(201).json({
    request: {
      investorId: investor.id,
      founderId: req.user.id,
      status: "PAYMENT_REQUIRED",
      nextStep: "Create payment through /api/payments/checkout"
    }
  });
});

export default router;
