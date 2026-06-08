import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export interface AIClassification {
  category: string;
  priority: string;
  summary: string;
}

export async function classifyTicket(
  subject: string,
  description: string
): Promise<AIClassification> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a customer support triage AI. Classify the following support ticket.

Subject: ${subject}
Description: ${description}

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "category": "<one of: Billing, Technical, Account, General, Bug, Feature Request>",
  "priority": "<one of: Low, Medium, High, Urgent>",
  "summary": "<one sentence summary of the issue, max 100 chars>"
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Strip markdown code fences if present
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean) as AIClassification;

    return {
      category: parsed.category ?? "General",
      priority: parsed.priority ?? "Medium",
      summary: parsed.summary ?? "Customer submitted a support request.",
    };
  } catch (err) {
    console.error("⚠️  AI classification failed, using defaults:", err);
    return {
      category: "General",
      priority: "Medium",
      summary: "Customer submitted a support request.",
    };
  }
}
