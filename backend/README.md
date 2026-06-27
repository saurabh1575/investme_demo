# InvestMe Backend

Dynamic Node.js + Express backend for InvestMe.

## What Is Included

- Local file database: `data/database.json`
- JWT authentication: signup, login, me
- Roles: Founder/User, Mentor, Investor, Admin
- Mentor and investor APIs
- Booking API
- Stripe/Razorpay checkout API
- OpenAI AI recommendation APIs
- WhatsApp/Telegram community links from `.env`
- Admin overview/settings APIs
- Socket.IO realtime foundation

## Setup

```powershell
npm.cmd install
Copy-Item .env.example .env
npm.cmd run dev
```

API runs at:

```text
http://localhost:5000/api
```

Frontend runs from the same backend server:

```text
http://localhost:5000/index.html
```

Health check:

```text
http://localhost:5000/api/health
```

## Paste Your Keys And Links

Open `.env` and paste:

```text
WHATSAPP_COMMUNITY_URL=https://chat.whatsapp.com/YOUR_INVITE_CODE
TELEGRAM_COMMUNITY_URL=https://t.me/YOUR_TELEGRAM_GROUP
FOUNDER_GROUP_URL=https://t.me/YOUR_FOUNDER_GROUP

STRIPE_SECRET_KEY=sk_live_or_test_key
STRIPE_WEBHOOK_SECRET=whsec_xxx
RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
OPENAI_API_KEY=sk_xxx
JWT_SECRET=make_this_long_and_random
```

If payment or AI keys are blank, the backend returns demo responses.

## Demo Accounts

```text
founder@investme.demo / Founder@123
admin@investme.demo / Admin@123
```

## Main APIs

```text
GET  /api/health
GET  /api/settings/public
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
GET  /api/mentors
GET  /api/investors
POST /api/bookings
POST /api/payments/checkout
GET  /api/communities
POST /api/communities/:id/join
POST /api/ai/mentor-recommendations
POST /api/ai/investor-matches
POST /api/ai/startup-health-score
GET  /api/admin/overview
```
