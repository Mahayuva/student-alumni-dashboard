const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAlumFinder() {
    console.log("Verifying AlumFinder Map...");

    const email = "map.test.user@example.com";
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: "Map Test User",
                email,
                role: "STUDENT",
                profile: {
                    create: {
                        headline: "Map Enthusiast",
                        city: "Paris",
                        country: "France"
                    }
                }
            }
        });
        console.log("Created map test user");
    }

    // 1. Simulate Profile Update with Geocoding (Logic is in API, so we simulate the effect or call the API?)
    // Since we can't easily call the API from this script without auth, we will manually check if geocoding logic works by simulating the API's geocoding call here
    // OR we can manually update the DB with lat/long to test the MAP API.

    // Let's test the MAP API endpoint logic primarily.

    // Update user with specific lat/long
    await prisma.profile.update({
        where: { userId: user.id },
        data: {
            city: "Berlin",
            country: "Germany",
            latitude: 52.5200,
            longitude: 13.4050
        }
    });
    console.log("Updated user with specific coordinates (Berlin)");

    // 2. Query the Map Data Logic (Simulate /api/student/map)
    const usersOnMap = await prisma.user.findMany({
        where: {
            profile: {
                latitude: { not: null },
                longitude: { not: null }
            }
        },
        select: {
            id: true,
            name: true,
            profile: {
                select: {
                    city: true,
                    latitude: true,
                    longitude: true
                }
            }
        }
    });

    console.log(`Users on map: ${usersOnMap.length}`);
    const found = usersOnMap.find(u => u.name === "Map Test User");

    if (found) {
        console.log("SUCCESS: Map Test User found in map data.");
        console.log(`User Location: ${found.profile.city} (${found.profile.latitude}, ${found.profile.longitude})`);
    } else {
        console.error("FAILURE: Map Test User NOT found in map data.");
    }
}

verifyAlumFinder()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
