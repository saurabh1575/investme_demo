# InvestMe Backend

The backend is implemented in `backend/` with Node.js, Express, Socket.IO, Prisma schema, and env-based configuration.

## Env Keys

Use `backend/.env` for local development and `backend/.env.example` as the template.

Important variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `OPENAI_API_KEY`
- `REDIS_URL`

## API Groups

- `GET /api/health`
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/mentors`
- `GET /api/mentors/:id`
- `GET /api/investors`
- `POST /api/investors/:id/connect`
- `POST /api/bookings`
- `GET /api/bookings/mine`
- `POST /api/payments/checkout`
- `GET /api/payments/history`
- `POST /api/ai/mentor-recommendations`
- `POST /api/ai/investor-matches`
- `POST /api/ai/startup-health-score`
- `POST /api/messages`
- `GET /api/messages`
- `GET /api/communities`
- `POST /api/communities/:id/join`
- `GET /api/admin/overview`

## Notes

Payment and AI services run in demo mode if API keys are blank. Add real keys to `.env` to enable live integrations.
