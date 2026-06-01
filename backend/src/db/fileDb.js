import fs from "node:fs/promises";
import path from "node:path";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { dbFile, env } from "../config/env.js";

const now = () => new Date().toISOString();

const seed = {
  users: [
    {
      id: "usr_admin_demo",
      role: "ADMIN",
      name: "InvestMe Admin",
      email: "admin@investme.demo",
      passwordHash: bcrypt.hashSync("Admin@123", 10),
      plan: "ADMIN",
      createdAt: now()
    },
    {
      id: "usr_founder_demo",
      role: "FOUNDER",
      name: "Demo Founder",
      email: "founder@investme.demo",
      passwordHash: bcrypt.hashSync("Founder@123", 10),
      plan: "PRO_FOUNDER",
      startup: "Fintech infrastructure",
      createdAt: now()
    }
  ],
  mentors: [
    { id: "maya-rao", name: "Maya Rao", designation: "Former Fintech CEO", experienceYears: 18, industry: "Fintech", expertise: ["Fundraising", "GTM", "Board strategy"], rating: 4.96, fee: 149, availability: "Available today", status: "VERIFIED" },
    { id: "jun-park", name: "Jun Park", designation: "Angel Investor", experienceYears: 12, industry: "AI", expertise: ["AI products", "Pitch review", "MVP scope"], rating: 4.89, fee: 99, availability: "Available tomorrow", status: "VERIFIED" },
    { id: "richard-hayes", name: "Richard Hayes", designation: "Retired Fortune 500 CFO", experienceYears: 31, industry: "B2B", expertise: ["Financial models", "Governance", "Debt strategy"], rating: 4.92, fee: 199, availability: "3 slots left", status: "VERIFIED" }
  ],
  investors: [
    { id: "northline-angels", name: "Northline Angels", type: "Angel Syndicate", investmentInterests: "Fintech, SaaS, AI infrastructure", preferredSectors: ["B2B SaaS", "Payments", "RegTech"], ticketMin: 50000, ticketMax: 250000, portfolioStartups: ["Vaultly", "KiteCredit", "LedgerPilot"] },
    { id: "catalyst-seed-fund", name: "Catalyst Seed Fund", type: "Venture Capital", investmentInterests: "Climate, mobility, industrial software", preferredSectors: ["Climate", "Logistics", "Energy"], ticketMin: 500000, ticketMax: 2000000, portfolioStartups: ["ThermaLoop", "CarbonDock", "WattWise"] }
  ],
  communities: [
    { id: "whatsapp", name: "WhatsApp Community", channelType: "WHATSAPP", urlEnv: "WHATSAPP_COMMUNITY_URL", registeredOnly: false },
    { id: "telegram", name: "Telegram Community", channelType: "TELEGRAM", urlEnv: "TELEGRAM_COMMUNITY_URL", registeredOnly: false },
    { id: "founders", name: "Founder Groups", channelType: "TELEGRAM", urlEnv: "FOUNDER_GROUP_URL", registeredOnly: false }
  ],
  bookings: [],
  payments: [],
  messages: [],
  notifications: [],
  settings: {
    requireCommunityLogin: env.REQUIRE_COMMUNITY_LOGIN
  }
};

async function ensureDb() {
  try {
    await fs.access(dbFile);
  } catch {
    await fs.mkdir(path.dirname(dbFile), { recursive: true });
    await fs.writeFile(dbFile, JSON.stringify(seed, null, 2));
  }
}

export async function readDb() {
  await ensureDb();
  return JSON.parse(await fs.readFile(dbFile, "utf8"));
}

export async function writeDb(db) {
  await fs.mkdir(path.dirname(dbFile), { recursive: true });
  await fs.writeFile(dbFile, JSON.stringify(db, null, 2));
  return db;
}

export async function insert(collection, payload) {
  const db = await readDb();
  const record = { id: randomUUID(), createdAt: now(), ...payload };
  db[collection].push(record);
  await writeDb(db);
  return record;
}

export async function updateById(collection, id, patch) {
  const db = await readDb();
  const index = db[collection].findIndex((item) => item.id === id);
  if (index === -1) return null;
  db[collection][index] = { ...db[collection][index], ...patch, updatedAt: now() };
  await writeDb(db);
  return db[collection][index];
}

export function publicUser(user) {
  if (!user) return null;
  const { passwordHash, ...safeUser } = user;
  return safeUser;
}
