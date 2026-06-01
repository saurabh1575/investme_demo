import OpenAI from "openai";
import { env, hasSecret } from "../config/env.js";
import { readDb } from "../db/fileDb.js";

const openai = hasSecret("OPENAI_API_KEY") ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

async function jsonCompletion(task, payload, fallback) {
  if (!openai) return { mode: "demo", ...fallback };

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return valid JSON only. Keep advice concise and practical for startup founders." },
      { role: "user", content: JSON.stringify({ task, ...payload }) }
    ]
  });
  return JSON.parse(response.choices[0].message.content);
}

export async function recommendMentors(profile) {
  const db = await readDb();
  return jsonCompletion("Recommend InvestMe mentors", { profile, mentors: db.mentors }, {
    recommendations: db.mentors.slice(0, 3).map((mentor) => ({ mentorId: mentor.id, name: mentor.name, reason: `Useful for ${profile.industry || "startup"} founders.` }))
  });
}

export async function matchInvestors(profile) {
  const db = await readDb();
  return jsonCompletion("Match investors", { profile, investors: db.investors }, {
    matches: db.investors.map((investor) => ({ investorId: investor.id, name: investor.name, score: 82, reason: "Sector and ticket-size fit." }))
  });
}

export async function startupHealthScore(profile) {
  return jsonCompletion("Score startup health", { profile }, {
    score: 78,
    signals: ["Clear sector focus", "Improve traction proof", "Sharpen funding story"],
    nextActions: ["Book a fundraising mentor", "Update pitch metrics", "Build investor target list"]
  });
}
