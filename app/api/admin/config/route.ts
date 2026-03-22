import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Check if user is Admin
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ message: "Missing key or value" }, { status: 400 });
    }

    // 2. Upsert the config value using Raw SQL as a workaround for out-of-sync Prisma client on Windows
    const configId = Math.random().toString(36).substring(7); // Simple fallback ID
    await (prisma as any).$executeRaw`
      INSERT INTO "SystemConfig" (id, key, value, "updatedAt") 
      VALUES (${configId}, ${key}, ${value}, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET value = ${value}, "updatedAt" = NOW()
    `;

    return NextResponse.json({ message: "Config updated successfully" });
  } catch (error) {
    console.error("Admin Config Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
    }

    const configs = await (prisma as any).$queryRaw`SELECT id, key, value, "updatedAt" FROM "SystemConfig"`;
    return NextResponse.json(configs);
  } catch (error) {
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}
