import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    // TEMPORARY: NO AUTH CHECK

    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let fileDataPart;
        if (file.type === "application/pdf") {
            fileDataPart = {
                type: "file",
                data: buffer,
                mimeType: "application/pdf",
            };
        } else {
            // Assume text file
            fileDataPart = {
                type: "text",
                text: await file.text()
            };
        }

        const { object: rawObject } = await generateObject({
            model: google("gemini-2.5-flash"),
            schema: z.object({
                extracted_skills: z.array(z.string()).optional().default([]).describe("List of technical and soft skills extracted from the resume."),
                summary: z.string().optional().default("").describe("A professional summary of the candidate's profile based on the resume."),
                actionable_feedback: z.array(z.string()).optional().default([]).describe("Actionable feedback points on how to improve the resume."),
                suggested_missing_skills: z.array(z.string()).optional().default([]).describe("Highly demanded skills in their field that are missing from the resume."),
                ats_compatibility_score: z.number().nullable().optional().describe("ATS resume score out of 100 based on formatting, keywords, and impact."),
                ats_pass_status: z.enum(["Pass", "Needs Improvement", "Fail"]).optional().default("Needs Improvement").describe("Overall ATS status."),
                good_points: z.array(z.string()).optional().default([]).describe("Strong points or strengths of the resume."),
                bad_points: z.array(z.string()).optional().default([]).describe("Weak points or areas where the resume lacks.")
            }),
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: "Analyze this resume. Calculate an ATS compatibility score (0-100), define if it passes ATS ('Pass', 'Needs Improvement', 'Fail'), give good and bad points, extract skills, give a summary, suggest missing skills and provide actionable feedback." },
                        fileDataPart as any
                    ]
                }
            ]
        });

        const object = rawObject as {
            extracted_skills?: string[];
            summary?: string;
            actionable_feedback?: string[];
            suggested_missing_skills?: string[];
            ats_compatibility_score?: number | null;
            ats_pass_status?: string;
            good_points?: string[];
            bad_points?: string[];
        };

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

        const extractedSkillsLower = (object.extracted_skills || []).map((s: string) => s.toLowerCase());

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
            .filter(job => job.matchScore > 20)
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
        return NextResponse.json({ error: error.message || String(error), stack: error.stack }, { status: 500 });
    }
}
