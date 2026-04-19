import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(users);
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, action, role } = await req.json();

        let data: any = {};

        if (action === "verify") {
            data.isVerified = true;
        } else if (action === "updateRole" && role) {
            data.role = role;
        } else if (action === "resetPassword") {
            // Reset to a default password: Welcome@123
            const hashedPassword = await hash("Welcome@123", 10);
            data.password = hashedPassword;
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data
        });

        return NextResponse.json(user);
    } catch (e) {
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "ID is required" }, { status: 400 });
        }

        // Prevent self-deletion
        if (id === session.user.id) {
            return NextResponse.json({ error: "Cannot delete yourself" }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id }
        });

        return NextResponse.json({ message: "User deleted" });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
