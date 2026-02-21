import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const batch = searchParams.get("batch");
    const search = searchParams.get("search");

    try {
        const whereClause: Prisma.UserWhereInput = {
            role: "ALUMNI",
            // isVerified: true, // Uncomment if verification workflow is enforced
        };

        if (batch && batch !== "all") {
            whereClause.profile = {
                batch: batch
            };
        }

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: "insensitive" } },
                {
                    profile: {
                        OR: [
                            { company: { contains: search, mode: "insensitive" } },
                            { currentRole: { contains: search, mode: "insensitive" } },
                            { department: { contains: search, mode: "insensitive" } }
                        ]
                    }
                }
            ];
        }

        const alumni = await prisma.user.findMany({
            where: whereClause,
            select: {
                id: true,
                name: true,
                image: true,
                email: true,
                profile: {
                    select: {
                        headline: true,
                        currentRole: true,
                        company: true,
                        city: true,
                        country: true,
                        batch: true,
                        department: true,
                        skills: true,
                        linkedin: true,
                        github: true,
                        website: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Get all distinct batches for the filter dropdown
        const batches = await prisma.profile.findMany({
            where: {
                batch: { not: null },
                user: { role: "ALUMNI" }
            },
            select: { batch: true },
            distinct: ['batch'],
            orderBy: { batch: 'desc' }
        });

        const uniqueBatches = batches.map(b => b.batch).filter(Boolean);

        return NextResponse.json({ alumni, batches: uniqueBatches });

    } catch (error) {
        console.error("Alumni Fetch Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
