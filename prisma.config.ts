import { defineConfig } from "prisma/config";

if (typeof (process as any).loadEnvFile === "function") {
  (process as any).loadEnvFile();
}

export default defineConfig({
  datasource: {
    url:
      (process.env.DATABASE_URL as string) ||
      (process.env.DIRECT_URL as string),
  },
});
