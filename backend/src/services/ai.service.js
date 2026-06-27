import Groq from "groq-sdk";
import { env, hasSecret } from "../config/env.js";
import { prisma } from "../db/prisma.js";

const groq = hasSecret("GROQ_API_KEY") ? new Groq({ apiKey: env.GROQ_API_KEY }) : null;

async function jsonCompletion(task, payload, fallback) {
  if (!groq) return { mode: "demo", ...fallback };

  try {
    const response = await groq.chat.completions.create({
      model: env.GROQ_MODEL || "llama3-8b-8192",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return valid JSON only. Keep advice concise and practical for startup founders." },
        { role: "user", content: JSON.stringify({ task, ...payload }) }
      ]
    });
    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Groq AI Error:", error);
    return { mode: "error_fallback", ...fallback };
  }
}

export async function recommendMentors(profile) {
  const mentors = await prisma.mentor.findMany({ include: { user: true } });
  return jsonCompletion("Recommend InvestMe mentors", { profile, mentors }, {
    recommendations: mentors.slice(0, 3).map((mentor) => ({ mentorId: mentor.id, name: mentor.user ? mentor.user.name : mentor.designation, reason: `Useful for ${profile.industry || "startup"} founders.` }))
  });
}

export async function matchInvestors(profile) {
  const investors = await prisma.investor.findMany({ include: { user: true } });
  return jsonCompletion("Match investors", { profile, investors }, {
    matches: investors.map((investor) => ({ investorId: investor.id, name: investor.user ? investor.user.name : "Investor", score: 82, reason: "Sector and ticket-size fit." }))
  });
}

export async function startupHealthScore(profile) {
  return jsonCompletion("Score startup health", { profile }, {
    score: 78,
    signals: ["Clear sector focus", "Improve traction proof", "Sharpen funding story"],
    nextActions: ["Book a fundraising mentor", "Update pitch metrics", "Build investor target list"]
  });
}
