"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
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
    const hashedPassword = await bcryptjs_1.default.hash("admin123", 12);
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
//# sourceMappingURL=seed.js.map