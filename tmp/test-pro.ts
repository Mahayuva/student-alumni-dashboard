import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

async function main() {
  const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  try {
    const { object } = await generateObject({
      model: google("gemini-1.5-pro"),
      schema: z.object({ test: z.string() }),
      messages: [{ role: "user", content: "Say working" }]
    });
    console.log("Success with gemini-1.5-pro:", object);
  } catch (e: any) {
    console.log("Error with gemini-1.5-pro:", e.message);
  }
}
main();
