import Razorpay from "razorpay";
import { env, hasSecret } from "../config/env.js";
import { prisma } from "../db/prisma.js";

const razorpay = hasSecret("RAZORPAY_KEY_ID") && hasSecret("RAZORPAY_KEY_SECRET")
  ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
  : null;

export async function createPayment({ userId, gateway, amount, description, metadata = {} }) {
  let paymentData = {
    userId,
    gateway: gateway,
    amount,
    currency: "INR",
    status: "CREATED",
    providerRef: null,
    metadata: JSON.stringify(metadata)
  };
  
  let checkoutUrl = "";

  if (gateway === "RAZORPAY" && razorpay) {
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `investme_${Date.now()}`,
      notes: metadata
    });
    paymentData.providerRef = order.id;
  } else {
    paymentData.gateway = "RAZORPAY_DEMO";
    paymentData.status = "DEMO_CREATED";
    paymentData.providerRef = `demo_razorpay_${Date.now()}`;
  }

  const payment = await prisma.payment.create({
    data: paymentData
  });
  
  return { ...payment, checkoutUrl, description };
}
