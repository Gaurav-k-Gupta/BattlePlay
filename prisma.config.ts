import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // A real pooled Neon URL is required for migrations and runtime. The fallback
    // lets `prisma generate` run before a developer has created their local `.env`.
    url: process.env.DATABASE_URL ?? "postgresql://placeholder:placeholder@localhost:5432/battleplay",
  },
});
