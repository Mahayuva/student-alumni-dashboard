import { prisma } from "./db";

export async function getGoogleAiKey(): Promise<string | undefined> {
  try {
    // We use $queryRaw as a fallback/workaround because 'npx prisma generate' 
    // can be blocked by file locks on Windows if 'npm run dev' is active.
    // This allows us to access the new 'SystemConfig' table even if the client is out-of-sync.
    const result = await (prisma as any).$queryRaw`SELECT value FROM "SystemConfig" WHERE key = 'GOOGLE_AI_KEY' LIMIT 1`;

    if (result && Array.isArray(result) && result.length > 0) {
      return result[0].value;
    }

    return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  } catch (error) {
    console.error("Error fetching AI Key:", error);
    return process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  }
}
