import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
const pdf = require("pdf-parse");

// Predefined list of skills to look for
const TECH_SKILLS = [
    "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Python", "Java", "C++", "C#",
    "SQL", "PostgreSQL", "MongoDB", "AWS", "Docker", "Kubernetes", "Git", "HTML", "CSS",
    "Tailwind", "Prisma", "GraphQL", "Redux", "Data Analysis", "Machine Learning", "AI"
];

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get("resume") as File | null;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        // 1. Extract Text
        let text = "";
        if (file.type === "application/pdf") {
            const buffer = Buffer.from(await file.arrayBuffer());
            const data = await pdf(buffer);
            text = data.text;
        } else {
            // Assume text file
            text = await file.text();
        }

        // Normalize text
        const lowerText = text.toLowerCase();

        // 2. Extract Skills
        const extractedSkills = TECH_SKILLS.filter(skill =>
            lowerText.includes(skill.toLowerCase())
        );

        // 3. Find Matching Jobs
        // Fetch all active jobs (in a real app, uses vector search or full text search)
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

        // Simple matching algorithm
        const matchedJobs = allJobs.map(job => {
            const jobText = (job.title + " " + job.description + " " + job.requirements).toLowerCase();
            const jobSkills = TECH_SKILLS.filter(s => jobText.includes(s.toLowerCase()));

            // Overlap
            const intersection = jobSkills.filter(s => extractedSkills.includes(s));
            const matchScore = jobSkills.length > 0
                ? Math.round((intersection.length / jobSkills.length) * 100)
                : 0;

            return {
                ...job,
                matchScore,
                matchedSkills: intersection,
                requiredSkills: jobSkills
            };
        })
            .filter(job => job.matchScore > 20) // Only relevant jobs
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, 5); // Start with top 5

        // 4. Identify Skill Gaps (Skills frequent in matched jobs but missing in resume)
        const allJobSkills = matchedJobs.flatMap(j => j.requiredSkills);
        const missingSkills = [...new Set(allJobSkills.filter(s => !extractedSkills.includes(s)))].slice(0, 5);

        return NextResponse.json({
            extractedSkills,
            matchedJobs,
            missingSkills
        });

    } catch (error) {
        console.error("Resume Analysis Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
