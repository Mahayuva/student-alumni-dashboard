import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcrypt";
import { z } from "zod";

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["student", "alumni", "admin"]),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, password, role } = registerSchema.parse(body);

        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                { message: "User with this email already exists" },
                { status: 409 }
            );
        }

        // In a real app, hash the password here (e.g., using bcrypt)
        // const hashedPassword = await bcrypt.hash(password, 10);

        // For this demo, we'll store it directly as per "make it workable" speed, 
        // but ideally we should prompt to add hashing. 
        // I will add a TODO comment.

        const hashedPassword = await hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role.toUpperCase() as any, // Cast to any to avoid type issues with enum matching if strict
                profile: {
                    create: {
                        // Create empty profile
                    }
                }
            },
        });

        // Notify Admins about new user
        const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
        await prisma.notification.createMany({
            data: admins.map(admin => ({
                userId: admin.id,
                title: "New User Registered",
                message: `${name} has joined the platform as a ${role}.`,
                link: "/admin/users"
            }))
        });

        return NextResponse.json(
            { message: "User created successfully", user },
            { status: 201 }
        );
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 }
        );
    }
}
