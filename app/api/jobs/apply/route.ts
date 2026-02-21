import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { jobId } = await req.json();

        if (!jobId) {
            return new NextResponse("Job ID is required", { status: 400 });
        }

        const existingApplication = await prisma.jobApplication.findUnique({
            where: {
                jobId_studentId: {
                    jobId: jobId,
                    studentId: session.user.id
                }
            }
        });

        if (existingApplication) {
            return new NextResponse("You have already applied for this job", { status: 400 });
        }

        const application = await prisma.jobApplication.create({
            data: {
                studentId: session.user.id,
                jobId: jobId,
                status: "PENDING"
            },
        });

        return NextResponse.json({ message: "Applied successfully", application });
    } catch (error) {
        console.error("Job Application Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
