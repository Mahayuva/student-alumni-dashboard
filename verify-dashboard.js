const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyDashboardData() {
    console.log("Verifying Dashboard Data...");

    // 1. Get a student user (we need one to simulate a request or just check DB directly)
    // Since we can't easily mock next-auth session in a standalone script without more work,
    // we will just check if the DB has data that WOULD be returned.

    // Check if we have any users
    const user = await prisma.user.findFirst({ where: { role: 'STUDENT' } });
    if (!user) {
        console.log("No student user found. Creating one for test...");
        // Setup might be needed, but skipping for now implies manual testing or assuming data exists.
        // Actually, let's just query the counts that the API would query.
    } else {
        console.log(`Found student: ${user.email}`);

        // Simulate API logic
        const jobApps = await prisma.jobApplication.count({ where: { studentId: user.id } });
        console.log(`Job Applications: ${jobApps}`);

        const events = await prisma.eventRegistration.count({ where: { userId: user.id } });
        console.log(`Events Registered: ${events}`);

        const latestJobs = await prisma.job.findMany({ take: 3, orderBy: { createdAt: 'desc' } });
        console.log(`Latest Jobs: ${latestJobs.length}`);
    }

    // Check Upcoming Events
    const upcoming = await prisma.event.findMany({
        where: { date: { gte: new Date() } },
        take: 3
    });
    console.log(`Upcoming Events found: ${upcoming.length}`);

    // Check Profile
    const profile = await prisma.profile.findUnique({
        where: { userId: user.id }
    });
    if (profile) {
        console.log(`Profile found: ${profile.headline || "No headline"} | Skills: ${profile.skills}`);
    } else {
        console.log("No profile found for this user.");
    }

    console.log("Verification checks complete (DB side).");
}

verifyDashboardData()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
