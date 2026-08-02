import { defineConfig, env } from "prisma/config";

if (typeof process !== 'undefined' && process?.versions?.node) {
  await import("dotenv/config");
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // directUrl is gone in v7 — put your direct/migration URL here instead
    url: env("DIRECT_URL") ?? env("DATABASE_URL"),
  },
});