import { Router } from "express";
import { readDb } from "../db/fileDb.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res) => {
  const db = await readDb();
  const { sector } = req.query;
  const investors = db.investors.filter((investor) => !sector || investor.preferredSectors.includes(sector));
  res.json({ investors });
});

router.post("/:id/connect", requireAuth, async (req, res) => {
  const db = await readDb();
  const investor = db.investors.find((item) => item.id === req.params.id);
  if (!investor) return res.status(404).json({ error: "Investor not found" });
  res.status(201).json({
    connectRequest: {
      investorId: investor.id,
      founderId: req.user.id,
      status: "PAYMENT_REQUIRED",
      paymentEndpoint: "/api/payments/checkout"
    }
  });
});

export default router;
