/**
 * Seed script: creates the initial admin user.
 * Run: npx ts-node --project tsconfig.json prisma/seed-admin.ts
 * Or: npx dotenv -e .env.local -- npx tsx prisma/seed-admin.ts
 */
import prismadb from "../lib/prismadb";
import bcrypt from "bcryptjs";

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "Admin@1234";
  const name = process.env.ADMIN_NAME || "Store Admin";

  const existing = await prismadb.adminUser.findUnique({ where: { email } });
  if (existing) {
    console.log(`✓ Admin user already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prismadb.adminUser.create({ data: { email, passwordHash, name } });
  console.log(`✓ Admin user created: ${admin.email} (id: ${admin.id})`);
  console.log(`  Password: ${password}`);
  console.log(`  → Visit http://localhost:3000/sign-in to log in`);
}

main()
  .catch(console.error)
  .finally(() => prismadb.$disconnect());
