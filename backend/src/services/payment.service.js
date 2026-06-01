import Razorpay from "razorpay";
import Stripe from "stripe";
import { env, hasSecret } from "../config/env.js";
import { insert } from "../db/fileDb.js";

const stripe = hasSecret("STRIPE_SECRET_KEY") ? new Stripe(env.STRIPE_SECRET_KEY) : null;
const razorpay = hasSecret("RAZORPAY_KEY_ID") && hasSecret("RAZORPAY_KEY_SECRET")
  ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
  : null;

export async function createPayment({ userId, gateway, amount, description, metadata = {} }) {
  if (gateway === "STRIPE" && stripe) {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: Math.round(Number(amount) * 100),
          product_data: { name: description }
        }
      }],
      success_url: `${env.APP_URL}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.APP_URL}/api/payments/cancel`,
      metadata
    });
    return insert("payments", { userId, gateway, amount, currency: "USD", description, status: "CREATED", providerRef: session.id, checkoutUrl: session.url, metadata });
  }

  if (gateway === "RAZORPAY" && razorpay) {
    const order = await razorpay.orders.create({
      amount: Math.round(Number(amount) * 100),
      currency: "INR",
      receipt: `investme_${Date.now()}`,
      notes: metadata
    });
    return insert("payments", { userId, gateway, amount, currency: "INR", description, status: "CREATED", providerRef: order.id, metadata });
  }

  return insert("payments", {
    userId,
    gateway: `${gateway}_DEMO`,
    amount,
    currency: gateway === "RAZORPAY" ? "INR" : "USD",
    description,
    status: "DEMO_CREATED",
    providerRef: `demo_${gateway.toLowerCase()}_${Date.now()}`,
    checkoutUrl: "",
    metadata
  });
}
