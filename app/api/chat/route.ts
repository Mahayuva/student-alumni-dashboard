import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getGoogleAiKey } from "@/lib/ai-config";

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

        // 4. ⭐ LinkedIn Detection — URL + Pasted Text Flow
        const linkedinRegex = /https?:\/\/(www\.)?linkedin\.com\/in\/([a-zA-Z0-9_%-]+)\/?/i;
        const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop();
        const lastAiMessage  = messages.filter((m: any) => m.role === 'assistant').pop();

        // Scan ALL user messages for a LinkedIn URL (handles multi-turn: URL first, then paste)
        let linkedinUrl: string | null = null;
        for (const msg of [...messages].reverse()) {
            if (msg.role !== 'user') continue;
            const m = (msg.content || '').match(linkedinRegex);
            if (m) { linkedinUrl = m[0]; break; }
        }

        // Extract pasted profile text from the CURRENT message (text beyond just the URL)
        let pastedProfileText: string | null = null;
        if (lastUserMessage?.content) {
            const stripped = (lastUserMessage.content as string).replace(linkedinRegex, '').trim();
            if (stripped.length > 80) pastedProfileText = stripped;
        }

        // Also detect follow-up paste: AI asked for text, user now sends a long message
        const aiAskedForPaste = lastAiMessage?.content &&
            (lastAiMessage.content as string).toLowerCase().includes('paste');
        if (!pastedProfileText && aiAskedForPaste && (lastUserMessage?.content || '').length > 80) {
            pastedProfileText = lastUserMessage.content as string;
        }

        const linkedinMode: 'analyze' | 'ask' | 'none' =
            linkedinUrl && pastedProfileText ? 'analyze' :
            linkedinUrl                      ? 'ask'     : 'none';

        // 5. Build System Prompt
        const systemPrompt = `
You are the **Alumsphere AI Expert Career Advisor** — a professional AI assistant for students seeking career guidance, job matching, and alumni networking on the Alumsphere platform.

--- STUDENT CONTEXT ---
- Name: ${currentUserProfile?.user?.name || 'Student'}
- Skills: ${currentUserProfile?.skills?.join(', ') || 'Not specified'}
- Department: ${(currentUserProfile as any)?.department || 'Not specified'}
- Headline: ${currentUserProfile?.headline || 'Not set'}

--- ACTIVE JOB OPPORTUNITIES ---
${JSON.stringify(activeJobs, null, 2)}

--- ALUMNI NETWORK ---
${JSON.stringify(allAlumni, null, 2)}

--- LINKEDIN PROFILE ANALYSIS MODE: ${linkedinMode.toUpperCase()} ---
${
    linkedinMode === 'ask' ? `
The student just shared a LinkedIn profile URL: ${linkedinUrl}

IMPORTANT: You cannot browse LinkedIn directly. Respond with EXACTLY this message:

---
🔗 **LinkedIn Profile Detected!**

I can see you've shared: ${linkedinUrl}

To give you a detailed professional analysis, please **paste the profile content** directly into this chat:

📋 **How to copy the LinkedIn profile text:**
1. Open the LinkedIn profile in your browser
2. Select all the text on the page (Ctrl+A / Cmd+A)
3. Copy it (Ctrl+C / Cmd+C)
4. Paste it here in the chat

Once you paste it, I'll provide a complete analysis including skills assessment, career path evaluation, and recommended alumni connections! 🚀
---
` : linkedinMode === 'analyze' ? `
The student shared a LinkedIn profile${linkedinUrl ? ` (${linkedinUrl})` : ''} and pasted this profile content:

--- PASTED LINKEDIN CONTENT ---
${pastedProfileText}
--- END OF PASTED CONTENT ---

Perform TEXT CLASSIFICATION and PROFESSIONAL ANALYSIS on this content. Respond with EXACTLY this structure:

### 🔍 Professional Profile Analysis

**📋 Professional Summary**
[2-3 sentences: who this person is, their career stage, core identity]

**🎯 Domain Expertise**
[Bullet list of their primary technical/professional domains extracted from the text]

**🎓 Educational Background**
[Their education details extracted from the text]

**🏆 Key Qualifications & Skills**
[Bullet list of top skills, certifications, tools extracted from the text]

**✅ Career Fit Assessment**
[How well does their career path align with a ${(currentUserProfile as any)?.department || 'Computer Science'} student's goals?]

**🤝 Recommended Alumni Connection**
[Pick 1 person from the Alumni Network above who works in a similar field. Explain why the student should connect.]
${linkedinUrl ? `
[Connect on LinkedIn](${linkedinUrl})` : ''}
` : `
- Answer career, job, and networking questions for the student
- Recommend jobs that match their skills from the Active Job Opportunities list
- Suggest relevant alumni from the Alumni Network to connect with
- Use clear Markdown formatting
- Be concise, professional, and encouraging
- If the student shares a LinkedIn URL without profile text, follow the LINKEDIN PROFILE ANALYSIS MODE instructions
`
}
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
