import OpenAI from "openai";
import { env, hasSecret } from "../config/env.js";
import { mentors, investors } from "../data/mockDb.js";

const openai = hasSecret("OPENAI_API_KEY") ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;

export async function recommendMentors(profile) {
  if (!openai) {
    return {
      mode: "demo",
      recommendations: mentors.slice(0, 3).map((mentor) => ({
        mentorId: mentor.id,
        name: mentor.name,
        reason: `Good fit for ${profile.industry || "startup"} founders at ${profile.stage || "early"} stage.`
      }))
    };
  }

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return JSON with a recommendations array. Be concise and practical." },
      {
        role: "user",
        content: JSON.stringify({
          task: "Recommend InvestMe mentors for this founder profile",
          profile,
          mentors
        })
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function matchInvestors(profile) {
  if (!openai) {
    return {
      mode: "demo",
      matches: investors.map((investor) => ({
        investorId: investor.id,
        name: investor.name,
        score: 82,
        reason: `Sector and ticket-size fit for ${profile.fundingGoal || "the next round"}.`
      }))
    };
  }

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return JSON with a matches array. Include score and reason." },
      {
        role: "user",
        content: JSON.stringify({
          task: "Match investors for this startup profile",
          profile,
          investors
        })
      }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}

export async function startupHealthScore(profile) {
  if (!openai) {
    return {
      mode: "demo",
      score: 78,
      signals: ["Clear sector focus", "Needs stronger traction proof", "Funding story can be sharper"],
      nextActions: ["Book a fundraising mentor", "Update pitch metrics", "Build investor target list"]
    };
  }

  const response = await openai.chat.completions.create({
    model: env.OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: "Return JSON with score, signals, and nextActions." },
      { role: "user", content: JSON.stringify({ task: "Score startup health", profile }) }
    ]
  });

  return JSON.parse(response.choices[0].message.content);
}
