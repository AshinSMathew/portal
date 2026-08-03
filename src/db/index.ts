import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

let connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/postgres";

if (connectionString.includes("[YOUR-PASSWORD]") || connectionString.includes("[YOUR-PROJECT-REF]")) {
  connectionString = "postgresql://postgres:postgres@localhost:5432/postgres";
}

const client = postgres(connectionString, {
  prepare: false,
  onnotice: () => { }, // Suppress benign postgres notices like column exists
});

client`ALTER TABLE "student_profiles" ADD COLUMN IF NOT EXISTS "behance_url" text;`.catch(() => { });

export const db = drizzle(client, { schema });