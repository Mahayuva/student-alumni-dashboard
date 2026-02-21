import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            where: {
                profile: {
                    latitude: { not: null },
                    longitude: { not: null }
                }
            },
            select: {
                id: true,
                name: true,
                image: true,
                role: true,
                profile: {
                    select: {
                        currentRole: true,
                        company: true,
                        headline: true,
                        city: true,
                        latitude: true,
                        longitude: true
                    }
                }
            }
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error("Map Data Fetch Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
