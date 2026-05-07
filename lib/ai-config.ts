import { prisma } from "./db";

export async function getGoogleAiKey(): Promise<string | undefined> {
  // 1. Try Database with high resilience
  try {
    const result = await (prisma as any).$queryRaw`SELECT value FROM "SystemConfig" WHERE key IN ('GROQ_API_KEY', 'GOOGLE_AI_KEY') ORDER BY key DESC LIMIT 1`;
    if (result?.[0]?.value) return result[0].value;
  } catch (dbError) {
    // If DB is missing or disconnected, just log it and move to ENV
    console.warn("Database config not available, falling back to ENV.");
  }

  // 2. Fallback to ENV (The most reliable for fresh installs)
  const envKey = process.env.GROQ_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (envKey) return envKey;

  return undefined;
}

