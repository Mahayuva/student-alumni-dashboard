import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { fullName, bio, batch, department, city, company, jobTitle, education, skills, interests, social } = body;

        // Try to geocode the city to get lat/lng
        let latitude = null;
        let longitude = null;
        if (city) {
            try {
                // Using nominatim to geocode the city
                const res = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(city)}&format=json&limit=1`, {
                    headers: { "User-Agent": "AlumniConnect-App" }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data && data.length > 0) {
                        latitude = parseFloat(data[0].lat);
                        longitude = parseFloat(data[0].lon);
                    }
                }
            } catch (geocodeError) {
                console.error("Geocoding failed for city:", city);
            }
        }

        // Parse arrays
        const skillsArray = skills ? skills.split(",").map((s: string) => s.trim()) : [];
        const interestsArray = interests ? interests.split(",").map((s: string) => s.trim()) : [];

        // Update the user's name
        const user = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                name: fullName
            }
        });

        // Upsert the profile
        const profile = await prisma.profile.upsert({
            where: { userId: user.id },
            update: {
                bio,
                batch,
                department,
                city,
                company,
                currentRole: jobTitle,
                education,
                skills: skillsArray,
                interests: interestsArray,
                linkedin: social?.linkedin,
                github: social?.github,
                twitter: social?.twitter,
                ...(latitude && longitude ? { latitude, longitude } : {})
            },
            create: {
                userId: user.id,
                bio,
                batch,
                department,
                city,
                company,
                currentRole: jobTitle,
                education,
                skills: skillsArray,
                interests: interestsArray,
                linkedin: social?.linkedin,
                github: social?.github,
                twitter: social?.twitter,
                latitude,
                longitude
            }
        });

        return NextResponse.json({ success: true, profile });
    } catch (e) {
        console.error("Profile update failed:", e);
        return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { profile: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            fullName: user.name || "",
            email: user.email || "",
            bio: user.profile?.bio || "",
            batch: user.profile?.batch || "",
            department: user.profile?.department || "",
            city: user.profile?.city || "",
            company: user.profile?.company || "",
            jobTitle: user.profile?.currentRole || "",
            education: user.profile?.education || "",
            skills: user.profile?.skills?.join(", ") || "",
            interests: user.profile?.interests?.join(", ") || "",
            social: {
                linkedin: user.profile?.linkedin || "",
                github: user.profile?.github || "",
                twitter: user.profile?.twitter || ""
            }
        });
    } catch (e) {
        console.error("Profile fetch failed:", e);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
