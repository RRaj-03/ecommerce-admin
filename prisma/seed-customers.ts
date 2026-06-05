import prismadb from "../lib/prismadb";
import bcrypt from "bcryptjs";

const users = [
  {
    firstName: "Rahul",
    lastName: "Shah",
    email: "rahul@test.com",
    phone: "+91 98765 43210",
    password: "Test@1234",
  },
  {
    firstName: "Priya",
    lastName: "Mehta",
    email: "priya@test.com",
    phone: "+91 91234 56789",
    password: "Test@1234",
  },
];

async function main() {
  for (const u of users) {
    // const existing = await prismadb.customer.findUnique({ where: { email: u.email,storeId:"66ac7ee0-dfb9-4b7c-b17f-48e43d2772bf" } });
    // if (existing) { console.log("Already exists:", u.email); continue; }
    const passwordHash = await bcrypt.hash(u.password, 12);
    const c = await prismadb.customer.create({
      data: {
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        phone: u.phone,
        passwordHash,
        storeId: "66ac7ee0-dfb9-4b7c-b17f-48e43d2772bf",
      },
    });
    console.log(`✓ Created: ${c.firstName} ${c.lastName} | ${c.email}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prismadb.$disconnect());
