import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";

export const users = [
  {
    id: "usr_founder_demo",
    role: "FOUNDER",
    name: "Avery Founder",
    email: "founder@investme.demo",
    passwordHash: bcrypt.hashSync("Founder@123", 10),
    plan: "PRO_FOUNDER",
    startup: "Fintech infrastructure"
  },
  {
    id: "usr_mentor_demo",
    role: "MENTOR",
    name: "Maya Rao",
    email: "mentor@investme.demo",
    passwordHash: bcrypt.hashSync("Mentor@123", 10),
    plan: "EXPERT",
    startup: null
  },
  {
    id: "usr_admin_demo",
    role: "ADMIN",
    name: "InvestMe Admin",
    email: "admin@investme.demo",
    passwordHash: bcrypt.hashSync("Admin@123", 10),
    plan: "ADMIN",
    startup: null
  }
];

export const mentors = [
  {
    id: "maya-rao",
    name: "Maya Rao",
    designation: "Former Fintech CEO",
    experienceYears: 18,
    industry: "Fintech",
    expertise: ["Fundraising", "Go-to-market", "Board strategy"],
    rating: 4.96,
    fee: 149,
    availability: "Available today",
    fundingStage: "Pre-Series A",
    startupStage: "Seed",
    status: "VERIFIED"
  },
  {
    id: "jun-park",
    name: "Jun Park",
    designation: "Angel Investor",
    experienceYears: 12,
    industry: "AI",
    expertise: ["AI products", "Pitch review", "MVP scope"],
    rating: 4.89,
    fee: 99,
    availability: "Available tomorrow",
    fundingStage: "Pre-seed",
    startupStage: "Idea",
    status: "VERIFIED"
  },
  {
    id: "richard-hayes",
    name: "Richard Hayes",
    designation: "Retired Fortune 500 CFO",
    experienceYears: 31,
    industry: "B2B",
    expertise: ["Financial models", "Governance", "Debt strategy"],
    rating: 4.92,
    fee: 199,
    availability: "3 slots left",
    fundingStage: "Debt",
    startupStage: "Growth",
    status: "VERIFIED"
  }
];

export const investors = [
  {
    id: "northline-angels",
    name: "Northline Angels",
    type: "Angel Syndicate",
    investmentInterests: "Fintech, SaaS, AI infrastructure",
    preferredSectors: ["B2B SaaS", "Payments", "RegTech"],
    ticketMin: 50000,
    ticketMax: 250000,
    portfolioStartups: ["Vaultly", "KiteCredit", "LedgerPilot"]
  },
  {
    id: "catalyst-seed-fund",
    name: "Catalyst Seed Fund",
    type: "Venture Capital",
    investmentInterests: "Climate, mobility, industrial software",
    preferredSectors: ["Climate", "Logistics", "Energy"],
    ticketMin: 500000,
    ticketMax: 2000000,
    portfolioStartups: ["ThermaLoop", "CarbonDock", "WattWise"]
  }
];

export const sessions = [];
export const payments = [];
export const messages = [];
export const notifications = [];
export const communities = [
  { id: "whatsapp-founders", name: "WhatsApp Founder Circle", channelType: "WHATSAPP", registeredOnly: true },
  { id: "telegram-funding", name: "Telegram Funding Updates", channelType: "TELEGRAM", registeredOnly: true }
];

export function createRecord(collection, payload) {
  const record = {
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    ...payload
  };
  collection.push(record);
  return record;
}
