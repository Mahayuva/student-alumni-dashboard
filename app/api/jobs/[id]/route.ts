import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const { id } = await params;

        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                postedBy: {
                    select: { 
                        name: true, 
                        image: true, 
                        email: true,
                        profile: {
                            select: {
                                headline: true,
                                company: true
                            }
                        }
                    },
                },
                applications: session?.user?.id ? {
                    where: {
                        studentId: session.user.id
                    },
                    select: {
                        id: true,
                        status: true,
                        createdAt: true,
                        degree: true,
                        skills: true,
                        coverNote: true
                    }
                } : false
            },
        });

        if (!job) {
            return new NextResponse("Job not found", { status: 404 });
        }

        return NextResponse.json(job);
    } catch (error) {
        console.error("Fetch Job Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
