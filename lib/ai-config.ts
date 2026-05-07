import { prisma } from "./db";

export async function getGoogleAiKey(): Promise<string | undefined> {
  try {
    // Check DB for either GROQ_API_KEY or legacy GOOGLE_AI_KEY
    const result = await (prisma as any).$queryRaw`SELECT value FROM "SystemConfig" WHERE key IN ('GROQ_API_KEY', 'GOOGLE_AI_KEY') ORDER BY key LIMIT 1`;

    if (result && Array.isArray(result) && result.length > 0) {
      return result[0].value;
    }

    // Fall back to env vars (Groq first, then Google)
    return process.env.GROQ_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  } catch (error) {
    console.error("Error fetching AI Key:", error);
    return process.env.GROQ_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }
}

