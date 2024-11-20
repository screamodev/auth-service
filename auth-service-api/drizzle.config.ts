import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./src/user/entities/user.entity.ts",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.POSTGRES_HOST!,
    port: +process.env.POSTGRES_PORT,
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    ssl: false,
  },
});
