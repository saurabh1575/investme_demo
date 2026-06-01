# InvestMe Full-Stack Prototype

This folder contains the InvestMe frontend and a Node.js/Express backend scaffold.

## Frontend

Open `index.html` directly in a browser for the static prototype.

Pages:

- `index.html`
- `about.html`
- `mentors.html`
- `investors.html`
- `community.html`
- `pricing.html`
- `dashboard.html`

The frontend tries to call `http://localhost:5000/api`. If the backend is not running, it uses demo fallback data.

## Backend

Backend code is in `backend/`.

Quick start:

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

Demo API accounts:

```text
founder@investme.demo / Founder@123
mentor@investme.demo / Mentor@123
admin@investme.demo / Admin@123
```

Then test:

```bash
curl http://localhost:5000/api/health
```

Secrets and API keys go in `backend/.env`, not in source files.
