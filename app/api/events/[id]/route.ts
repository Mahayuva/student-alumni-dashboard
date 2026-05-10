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

        const event = await prisma.event.findUnique({
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
                registrations: session?.user?.id ? {
                    where: {
                        userId: session.user.id
                    },
                    select: {
                        id: true,
                        createdAt: true,
                        remarks: true,
                        dietary: true
                    }
                } : false
            },
        });

        if (!event) {
            return new NextResponse("Event not found", { status: 404 });
        }

        return NextResponse.json(event);
    } catch (error) {
        console.error("Fetch Event Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
