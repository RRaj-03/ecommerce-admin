import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Load .env.local first (higher priority), then .env as fallback
// This mirrors Next.js env loading behavior
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("POSTGRES_PRISMA_URL") || env("DATABASE_URL"),
  },
});
