const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyAlumniFiltering() {
    console.log("Verifying Alumni Filtering...");

    // 1. Create a mock alumni with a specific batch if not exists
    const email = "mock.alumni.2024@example.com";
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        user = await prisma.user.create({
            data: {
                name: "Mock Alumni 2024",
                email,
                role: "ALUMNI",
                profile: {
                    create: {
                        headline: "Software Engineer",
                        batch: "2024",
                        company: "TestCorp"
                    }
                }
            }
        });
        console.log("Created mock alumni: 2024");
    } else {
        console.log("Mock alumni already exists");
    }

    // 2. Simulate API Logic for Batch Filter
    const batch = "2024";
    const alumniInBatch = await prisma.user.findMany({
        where: {
            role: "ALUMNI",
            profile: {
                batch: batch
            }
        },
        include: {
            profile: true
        }
    });

    console.log(`Alumni found in batch ${batch}: ${alumniInBatch.length}`);
    const found = alumniInBatch.find(a => a.email === email);

    if (found) {
        console.log("SUCCESS: Mock alumni found in filtered results.");
    } else {
        console.error("FAILURE: Mock alumni NOT found in filtered results.");
    }

    // 3. Verify Distinct Batches
    const batches = await prisma.profile.findMany({
        where: {
            batch: { not: null },
            user: { role: "ALUMNI" }
        },
        select: { batch: true },
        distinct: ['batch']
    });

    const batchList = batches.map(b => b.batch);
    console.log("Available Batches:", batchList);

    if (batchList.includes("2024")) {
        console.log("SUCCESS: Batch 2024 is listed.");
    } else {
        console.error("FAILURE: Batch 2024 is missing from list.");
    }
}

verifyAlumniFiltering()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
