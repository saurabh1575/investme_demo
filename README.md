# InvestMe Dynamic Website

This is the dynamic InvestMe website with frontend + backend.

## Frontend

Open `index.html` in browser.

The frontend connects to:

```text
http://localhost:5000/api
```

Frontend pages:

- `index.html`
- `about.html`
- `mentors.html`
- `investors.html`
- `community.html`
- `pricing.html`
- `dashboard.html`
- `login.html`

## Backend

Backend code is in `backend/`.

Run:

```powershell
cd backend
npm install
Copy-Item .env.example .env
npm run dev
```

## Where To Paste Links And API Keys

Paste everything in:

```text
backend/.env
```

Important values:

```text
WHATSAPP_COMMUNITY_URL=
TELEGRAM_COMMUNITY_URL=
FOUNDER_GROUP_URL=
STRIPE_SECRET_KEY=
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
OPENAI_API_KEY=
JWT_SECRET=
```

## Database

Local database file:

```text
backend/data/database.json
```

It is created automatically when backend runs.

## Demo Login

```text
founder@investme.demo / Founder@123
admin@investme.demo / Admin@123
```
