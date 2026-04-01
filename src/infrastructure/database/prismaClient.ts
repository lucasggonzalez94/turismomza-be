import { PrismaClient } from '@prisma/client';

console.log('Initializing PrismaClient with DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Prisma error logging is handled through the log configuration above

process.on('SIGINT', async () => {
  console.log('SIGINT received, disconnecting Prisma...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received, disconnecting Prisma...');
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
