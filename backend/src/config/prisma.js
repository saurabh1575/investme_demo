import { PrismaClient } from "@prisma/client";

export const prisma = globalThis.__investmePrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__investmePrisma = prisma;
}
