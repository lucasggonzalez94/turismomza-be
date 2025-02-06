import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Maneja el cierre de la conexión de manera segura cuando se termina el proceso
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
