import { readDb } from '../src/db/fileDb.js';
import { prisma } from '../src/db/prisma.js';
import { randomUUID } from 'crypto';

async function seed() {
  console.log('Seeding database from fileDb.js...');
  const db = await readDb();

  // Clear existing data (optional, but safe for initial seed)
  await prisma.review.deleteMany();
  await prisma.message.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();
  await prisma.communityMembership.deleteMany();
  await prisma.community.deleteMany();
  await prisma.mentor.deleteMany();
  await prisma.investor.deleteMany();
  await prisma.user.deleteMany();

  // Seed Users
  for (const user of db.users) {
    await prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        plan: user.plan || "FREE",
        startup: user.startup || null,
        createdAt: new Date(user.createdAt),
      }
    });
  }

  // Seed Mentors (we have to link them to users, but in fileDb they just had id)
  // Let's create dummy users for mentors if they don't exist
  for (const mentor of db.mentors) {
    const userId = `usr_${mentor.id}`;
    await prisma.user.create({
      data: {
        id: userId,
        name: mentor.name,
        email: `${mentor.id}@investme.demo`,
        role: "MENTOR",
      }
    });

    await prisma.mentor.create({
      data: {
        id: mentor.id,
        userId: userId,
        designation: mentor.designation,
        experienceYears: mentor.experienceYears,
        industry: mentor.industry,
        // Since sqlite doesn't support arrays, we convert to JSON string
        expertise: JSON.stringify(mentor.expertise),
        rating: mentor.rating,
        fee: mentor.fee,
        availability: mentor.availability,
        status: mentor.status,
      }
    });
  }

  // Seed Investors
  for (const investor of db.investors) {
    const userId = `usr_${investor.id}`;
    await prisma.user.create({
      data: {
        id: userId,
        name: investor.name,
        email: `${investor.id}@investme.demo`,
        role: "INVESTOR",
      }
    });

    await prisma.investor.create({
      data: {
        id: investor.id,
        userId: userId,
        investorType: investor.type,
        investmentInterests: investor.investmentInterests,
        preferredSectors: JSON.stringify(investor.preferredSectors),
        ticketMin: investor.ticketMin,
        ticketMax: investor.ticketMax,
        portfolioStartups: JSON.stringify(investor.portfolioStartups),
      }
    });
  }

  // Seed Communities
  for (const community of db.communities) {
    await prisma.community.create({
      data: {
        id: community.id,
        name: community.name,
        channelType: community.channelType,
        joinPolicy: community.registeredOnly ? "REGISTERED_ONLY" : "OPEN",
        externalUrl: process.env[community.urlEnv] || null,
      }
    });
  }

  console.log('Seeding complete!');
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
});
