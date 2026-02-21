import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
    headline: z.string().optional(),
    bio: z.string().optional(),
    linkedin: z.string().optional(),
    github: z.string().optional(),
    website: z.string().optional(),
    skills: z.array(z.string()).optional(),
    city: z.string().optional(),
    country: z.string().optional(),
});

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

        // Geocoding Logic
        let latitude: number | undefined;
        let longitude: number | undefined;

        // Simple Geocoding using Nominatim (OpenStreetMap)
        if (body.city || body.country) {
            try {
                const query = `${body.city || ""} ${body.country || ""}`.trim();
                const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
                const geoRes = await fetch(url, {
                    headers: { "User-Agent": "StudentAlumniDashboard/1.0" }
                });

                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    if (geoData && geoData.length > 0) {
                        latitude = parseFloat(geoData[0].lat);
                        longitude = parseFloat(geoData[0].lon);
                    }
                }
            } catch (error) {
                console.error("Geocoding failed:", error);
            }
        }

        const profile = await prisma.profile.upsert({
            where: { userId: session.user.id },
            update: {
                headline: body.headline,
                bio: body.bio,
                linkedin: body.linkedin,
                github: body.github,
                website: body.website,
                skills: body.skills,
                city: body.city,
                country: body.country,
                ...(latitude && longitude ? { latitude, longitude } : {})
            },
            create: {
                userId: session.user.id,
                headline: body.headline,
                bio: body.bio,
                linkedin: body.linkedin,
                github: body.github,
                website: body.website,
                skills: body.skills,
                city: body.city,
                country: body.country,
                latitude,
                longitude
            },
        });

        return NextResponse.json(profile);
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
