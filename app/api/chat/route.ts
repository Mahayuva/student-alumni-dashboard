import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGoogleAiKey } from "@/lib/ai-config";
import { getLinkedInProfile } from "@/lib/linkedin";

export const maxDuration = 30;

function createMockStream(text: string) {
    return new ReadableStream({
        start(controller) {
            controller.enqueue(new TextEncoder().encode(`0:${JSON.stringify(text)}\n`));
            controller.close();
        }
    });
}

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // 1. Authenticate Request
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return new Response(createMockStream("Please log in to use the AI Career Advisor."), {
                headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" }
            });
        }

        // 2. Fetch API key from DB or ENV
        const apiKey = await getGoogleAiKey();
        if (!apiKey) {
            const warningText = "⚠️ **Missing API Key**\n\nPlease add `GOOGLE_GENERATIVE_AI_API_KEY` to your `.env` file.";
            return new Response(createMockStream(warningText), {
                headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" }
            });
        }

        // Use Groq via OpenAI-compatible endpoint (works with ai@3.x)
        const groq = createOpenAI({
            baseURL: 'https://api.groq.com/openai/v1',
            apiKey,
        });


        // 3. Fetch Platform Data
        const currentUserProfile = await prisma.profile.findFirst({
            where: { user: { email: session.user.email } },
            include: { user: true }
        });

        const activeJobs = await prisma.job.findMany({
            where: { isActive: true },
            select: { title: true, company: true, requirements: true, location: true }
        });

        const allAlumni = await prisma.profile.findMany({
            where: { user: { role: 'ALUMNI' } },
            select: {
                user: { select: { name: true, email: true } },
                company: true, currentRole: true, industry: true, skills: true, linkedin: true
            }
        });

        // 4. ⭐ Proactive LinkedIn Detection & Fetching
        const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_%-]+)\/?/i;
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
        
        let linkedinData = null;
        let linkedinProfileUrl = null;

        if (lastUserMessage?.content) {
            const match = (lastUserMessage.content as string).match(linkedinRegex);
            if (match) {
                linkedinProfileUrl = match[0];
                // Automatically fetch from our scraper service
                linkedinData = await getLinkedInProfile(linkedinProfileUrl);
            }
        }

        // 5. Build System Prompt
        const systemPrompt = `
You are the **Alumsphere AI Expert Career Advisor** — a professional AI assistant for students on the Alumsphere platform.

--- STUDENT CONTEXT ---
- Name: ${currentUserProfile?.user?.name || 'Student'}
- Skills: ${currentUserProfile?.skills?.join(', ') || 'Not specified'}
- Department: ${(currentUserProfile as any)?.department || 'Not specified'}

${linkedinData ? `
--- ⭐ LINKEDIN PROFILE DATA (Fetched via Scraper) ---
- Full Name: ${linkedinData.name}
- Headline: ${linkedinData.headline}
- About: ${linkedinData.about}
- Education: ${linkedinData.education.join(', ')}
- Skills: ${linkedinData.qualifications.join(', ')}
- Profile: ${linkedinData.profileUrl}

IMPORTANT: Analyze this data and provide a summary. If the data looks like a "fallback" (generic), still provide a professional analysis based on the Name and Headline.
` : ''}

--- ACTIVE JOB OPPORTUNITIES ---
${JSON.stringify(activeJobs, null, 2)}

--- ALUMNI NETWORK ---
${JSON.stringify(allAlumni, null, 2)}

--- RESPONSE RULES ---
${linkedinData ? `
The student shared a LinkedIn profile. Respond with this structure:

### 🔍 Professional Profile Analysis: ${linkedinData.name}

**📋 Professional Summary**
[2-3 sentences based on their headline and background]

**🎯 Domain Expertise**
[Bullet list of technical/professional domains]

**🎓 Educational Background**
[Summary of their education]

**✅ Career Fit & Roadmap**
[How this profile serves as a model for the student]

[Connect on LinkedIn](${linkedinData.profileUrl})
` : `
- Provide career advice, job matches, and alumni connection suggestions.
- Use clear Markdown formatting.
- Be professional and encouraging.
`}
`;


        // 6. Stream Response
        const result = await streamText({
            model: groq('llama-3.3-70b-versatile'),

            system: systemPrompt,
            messages,
        });

        return result.toDataStreamResponse();

    } catch (error: any) {
        console.error("AI Chat Error:", error);

        // Friendly quota/rate limit message
        if (error?.lastError?.statusCode === 429 || error?.statusCode === 429) {
            const quotaMsg = "⚠️ **AI Quota Limit Reached**\n\nThe AI advisor has temporarily hit its daily usage limit. Please try again in a few hours, or ask your administrator to update the API key in **Admin Settings** with a key from a new Google project.\n\n[Get a free key →](https://aistudio.google.com/app/apikey)";
            return new Response(createMockStream(quotaMsg), {
                headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" }
            });
        }

        // Friendly model not found message
        if (error?.lastError?.statusCode === 404 || error?.statusCode === 404) {
            const modelMsg = "⚠️ **AI Model Unavailable**\n\nThe selected AI model is not available for your current API key. Please contact your administrator to update the API key in **Admin Settings**.";
            return new Response(createMockStream(modelMsg), {
                headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" }
            });
        }

        return new Response(createMockStream("⚠️ AI service is temporarily unavailable. Please try again shortly."), {
            headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" }
        });
    }
}
