import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

try {
  await prisma.$connect();
  console.log('connected');
  const count = await prisma.listing.count();
  console.log('listingCount', count);
} catch (err) {
  console.error(err);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
