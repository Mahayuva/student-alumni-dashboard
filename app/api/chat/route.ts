import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText } from 'ai';
import { prisma } from '@/lib/db';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

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
            const errorStream = createMockStream("Please log in to use the AI Career Advisor.");
            return new Response(errorStream, { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" } });
        }

        // 2. Safely Check for Machine Learning API Key
        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            const warningText = "⚠️ **Missing API Key**\\n\\nI am your new Pro-Level Machine Learning Chatbot! The UI and Database connections are perfectly wired up.\\n\\nTo unlock my intelligence so I can analyze your LinkedIn, suggest skills, and recommend Alumni profiles to DM, please add **\`GOOGLE_GENERATIVE_AI_API_KEY\`** to your \`.env\` file (You can get one for free at Google AI Studio).\\n\\nOnce added, I'll instantly read all active Jobs and Alumni from your database!";
            return new Response(createMockStream(warningText), { headers: { "Content-Type": "text/plain; charset=utf-8", "X-Vercel-AI-Data-Stream": "v1" } });
        }

        // 3. Fetch Personal & Platform Data Context for the ML Model
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
            select: { user: { select: { name: true } }, company: true, currentRole: true, industry: true, skills: true }
        });

        // 4. Build Intelligent System Prompt for Gemini
        const systemPrompt = `
You are the AlumniConnect Premium AI Bot, a pro-level machine learning career advisor.
You help students on the platform by:
1. Recommending open jobs posted on the dashboard.
2. Recommending specific Alumni to DM based on matching fields, skills, or industries.
3. Suggesting ways to improve their skills or analyzing their LinkedIn profile if they ask.

--- USER CONTEXT ---
Name: ${currentUserProfile?.user?.name || "Student"}
Email: ${currentUserProfile?.user?.email}
Their Skills: ${currentUserProfile?.skills?.join(', ') || 'None listed'}
Their LinkedIn: ${currentUserProfile?.linkedin || 'None provided'}
Their Bio/Headline: ${currentUserProfile?.headline || ''} - ${currentUserProfile?.bio || ''}

--- ACTIVE JOBS ON PLATFORM ---
${JSON.stringify(activeJobs)}

--- AVAILABLE ALUMNI TO NETWORK WITH ---
${JSON.stringify(allAlumni)}

--- INSTRUCTIONS ---
- Always respond professionally but warmly.
- When they ask for job recommendations, map their "User Context" skills to the "Active Jobs" requirements. Give concrete reasons.
- When they want to network, recommend a specific Alumni from the list whose 'industry' or 'currentRole' matches the user's focus. Encourage them to DM the Alumni.
- If they ask to analyze their profile/LinkedIn, provide a short summary and actionable tips based on their current skills.

KEEP RESPONSES CONCISE AND EASY TO READ using MARKDOWN format.
`;

        // 5. Stream Response from ML Model
        const result = await streamText({
            model: google('gemini-2.5-flash'),
            system: systemPrompt,
            messages,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        console.error("AI Chat Error:", error);
        return new Response("Error connecting to the AI Model.", { status: 500 });
    }
}
