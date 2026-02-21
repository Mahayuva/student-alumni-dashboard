import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { profileSchema } from "@/lib/validations";
import { z } from "zod";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const profile = await prisma.profile.findUnique({
            where: { userId: session.user.id },
        });

        return NextResponse.json(profile || {});
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const json = await req.json();
        const body = profileSchema.parse(json);

        const profile = await prisma.profile.upsert({
            where: { userId: session.user.id },
            update: body,
            create: {
                userId: session.user.id,
                ...body,
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse(JSON.stringify(error.issues), { status: 422 });
        }

        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
