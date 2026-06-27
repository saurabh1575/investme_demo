import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.updateMany({
    where: { email: "founder@investme.demo" },
    data: { role: "ADMIN" }
  });
  console.log("Updated founder@investme.demo to ADMIN");
}
main().catch(console.error).finally(() => prisma.$disconnect());
