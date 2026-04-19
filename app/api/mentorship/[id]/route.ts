import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await req.json();
        const { status } = json;

        if (!["ACCEPTED", "REJECTED"].includes(status)) {
            return new NextResponse("Invalid status", { status: 400 });
        }

        // Verify that the user is the mentor of this request
        const request = await prisma.mentorshipRequest.findUnique({
            where: { id },
        });

        if (!request || request.mentorId !== session.user.id) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        const updatedRequest = await prisma.mentorshipRequest.update({
            where: { id },
            data: { status },
        });

        return NextResponse.json(updatedRequest);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
