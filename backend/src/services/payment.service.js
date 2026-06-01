import Stripe from "stripe";
import Razorpay from "razorpay";
import { env, hasSecret } from "../config/env.js";
import { payments, createRecord } from "../data/mockDb.js";

const stripe = hasSecret("STRIPE_SECRET_KEY") ? new Stripe(env.STRIPE_SECRET_KEY) : null;
const razorpay =
  hasSecret("RAZORPAY_KEY_ID") && hasSecret("RAZORPAY_KEY_SECRET")
    ? new Razorpay({ key_id: env.RAZORPAY_KEY_ID, key_secret: env.RAZORPAY_KEY_SECRET })
    : null;

export async function createStripeCheckout({ userId, amount, description, metadata = {} }) {
  if (!stripe) {
    return createRecord(payments, {
      userId,
      gateway: "STRIPE_DEMO",
      amount,
      currency: "USD",
      description,
      status: "DEMO_CREATED",
      providerRef: `demo_stripe_${Date.now()}`,
      metadata
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: description },
          unit_amount: Math.round(amount * 100)
        },
        quantity: 1
      }
    ],
    success_url: `${env.APP_URL}/api/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.APP_URL}/api/payments/cancel`,
    metadata
  });

  return createRecord(payments, {
    userId,
    gateway: "STRIPE",
    amount,
    currency: "USD",
    description,
    status: "CREATED",
    providerRef: session.id,
    checkoutUrl: session.url,
    metadata
  });
}

export async function createRazorpayOrder({ userId, amount, description, metadata = {} }) {
  if (!razorpay) {
    return createRecord(payments, {
      userId,
      gateway: "RAZORPAY_DEMO",
      amount,
      currency: "INR",
      description,
      status: "DEMO_CREATED",
      providerRef: `demo_razorpay_${Date.now()}`,
      metadata
    });
  }

  const order = await razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    receipt: `investme_${Date.now()}`,
    notes: metadata
  });

  return createRecord(payments, {
    userId,
    gateway: "RAZORPAY",
    amount,
    currency: "INR",
    description,
    status: "CREATED",
    providerRef: order.id,
    metadata
  });
}
