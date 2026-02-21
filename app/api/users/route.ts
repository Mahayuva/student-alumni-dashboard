import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const role = searchParams.get("role");

        const users = await prisma.user.findMany({
            where: {
                ...(role ? { role: role as any } : {}),
            },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                profile: {
                    select: {
                        headline: true,
                        company: true,
                        industry: true,
                        city: true,
                        country: true,
                        skills: true,
                        linkedin: true,
                    }
                }
            },
            take: 50, // Limit for now
        });

        return NextResponse.json(users);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
