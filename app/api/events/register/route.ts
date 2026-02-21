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
        const { eventId } = await req.json();

        if (!eventId) {
            return new NextResponse("Event ID is required", { status: 400 });
        }

        const existingRegistration = await prisma.eventRegistration.findUnique({
            where: {
                eventId_userId: {
                    eventId: eventId,
                    userId: session.user.id
                }
            }
        });

        if (existingRegistration) {
            return new NextResponse("You are already registered for this event", { status: 400 });
        }

        const registration = await prisma.eventRegistration.create({
            data: {
                userId: session.user.id,
                eventId: eventId
            },
        });

        return NextResponse.json({ message: "Registered successfully", registration });
    } catch (error) {
        console.error("Event Registration Error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
