const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// DO NOT PUT YOUR KEY HERE IF YOU PLAN TO PUSH TO GITHUB
const NEW_KEY = "PASTE_YOUR_KEY_HERE_LOCALLY_ONLY"; 

async function main() {
  if (NEW_KEY === "PASTE_YOUR_KEY_HERE_LOCALLY_ONLY") {
    console.error("❌ Error: Please paste your key in the script first.");
    return;
  }

  console.log("Attempting to update API Key in database...");
  
  try {
    await prisma.$executeRaw`
      INSERT INTO "SystemConfig" (id, key, value, "updatedAt") 
      VALUES ('force-fix', 'GOOGLE_AI_KEY', ${NEW_KEY}, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET value = ${NEW_KEY}, "updatedAt" = NOW()
    `;
    console.log("✅ Success! API Key has been updated in the database.");
  } catch (error) {
    console.error("❌ Error updating key:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
