import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getGoogleAiKey } from "@/lib/ai-config";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    // 1. Get AI Key
    const apiKey = await getGoogleAiKey();
    if (!apiKey) {
        return NextResponse.json({ error: "Missing Google AI API Key. Please provide it in the .env or via Admin Settings." }, { status: 500 });
    }

    const google = createGoogleGenerativeAI({ apiKey });

    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const buffer = await file.arrayBuffer();
        const base64File = Buffer.from(buffer).toString("base64");

        // Use an Indestructible Parsing Strategy: Generate text and manually extract JSON
        const { text } = await generateText({
            model: google("gemini-2.5-flash"), 
            messages: [
                {
                    role: "system",
                    content: `You are an AI Recruitment Engine. You MUST analyze resumes and return a JSON object.
                    
                    Required JSON Structure:
                    {
                        "extracted_skills": ["Skill 1", "Skill 2"],
                        "summary": "Professional summary...",
                        "actionable_feedback": ["Feedback 1"],
                        "suggested_missing_skills": ["Missing Skill 1"],
                        "ats_compatibility_score": 85,
                        "ats_pass_status": "Pass",
                        "good_points": ["Point 1"],
                        "bad_points": ["Point 1"]
                    }
                    
                    Respond ONLY with the JSON object.`
                },
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this resume and provide the structured JSON analysis." },
                        { 
                            type: "file" as any, 
                            data: base64File, 
                            mimeType: file.type || "application/pdf"
                        }
                    ]
                }
            ]
        });

        // Robust JSON Extraction
        let jsonStr = text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        let object: any;
        try {
            object = JSON.parse(jsonStr);
        } catch (parseError) {
            console.error("JSON Parse Error. Raw Text:", text);
            throw new Error("The AI provided an invalid data format. Please try again.");
        }

        // Find Matching Jobs based on extracted skills
        const allJobs = await prisma.job.findMany({
            where: { isActive: true },
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                description: true,
                requirements: true
            }
        });

        const matchedJobs = allJobs.map(job => {
            const jobText = (job.title + " " + job.description + " " + job.requirements).toLowerCase();
            const matchedSkills = (object.extracted_skills || []).filter((skill: string) => jobText.includes(skill.toLowerCase()));

            const matchScore = matchedSkills.length > 0
                ? Math.min(Math.round((matchedSkills.length / Math.max(matchedSkills.length + 1, 3)) * 100), 100)
                : 0;

            return {
                ...job,
                matchScore,
                matchedSkills: matchedSkills
            };
        })
            .filter(job => job.matchScore > 15)
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5);

        return NextResponse.json({
            extractedSkills: object.extracted_skills || [],
            summary: object.summary || "",
            feedback: object.actionable_feedback || [],
            matchedJobs,
            missingSkills: (object.suggested_missing_skills || []).slice(0, 5),
            atsScore: object.ats_compatibility_score || 0,
            atsStatus: object.ats_pass_status || "Needs Improvement",
            goodPoints: object.good_points || [],
            badPoints: object.bad_points || []
        });

    } catch (error: any) {
        console.error("Resume Analysis Error:", error);
        return NextResponse.json({ error: error.message || String(error) }, { status: 500 });
    }
}
