import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

declare global {
  var prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL!;
  // Direct PostgreSQL connection (starts with postgresql:// or postgres://)
  if (url.startsWith("postgresql://") || url.startsWith("postgres://")) {
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter });
  }
  // Prisma Accelerate (starts with prisma:// or prisma+postgres://)
  return new PrismaClient({ accelerateUrl: url });
}

const prismadb = globalThis.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = prismadb;

export default prismadb;
