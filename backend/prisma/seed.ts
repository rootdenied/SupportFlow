import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Cleaning database for a fresh system...");

  // Clean
  await prisma.activity.deleteMany();
  await prisma.note.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  console.log("🌱 Seeding default admin user...");
  // Default admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@supportflow.io",
      password: hashedPassword,
      name: "Support Admin",
      role: "admin",
    },
  });
  console.log(`✅ Created admin user: admin@supportflow.io / admin123`);
  console.log("🎉 Fresh system ready!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
