# InvestMe Backend

Node.js + Express API for InvestMe.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

PowerShell alternative:

```powershell
Copy-Item .env.example .env
npm run dev
```

API runs on:

```text
http://localhost:5000/api
```

Health check:

```text
GET http://localhost:5000/api/health
```

## Demo Login Accounts

```text
founder@investme.demo / Founder@123
mentor@investme.demo / Mentor@123
admin@investme.demo / Admin@123
```

## API Keys

Put real keys in `.env`:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `OPENAI_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `REDIS_URL`

If payment or AI keys are blank, the backend returns demo-mode responses instead of failing.

## Main Endpoints

```text
POST /api/auth/signup
POST /api/auth/login
GET  /api/auth/me
GET  /api/mentors
GET  /api/investors
POST /api/bookings
POST /api/payments/checkout
POST /api/ai/mentor-recommendations
POST /api/ai/investor-matches
POST /api/ai/startup-health-score
GET  /api/communities
GET  /api/admin/overview
```
