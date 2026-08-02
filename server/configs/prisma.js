import { PrismaClient } from '@prisma/client';

if (typeof process !== 'undefined' && process?.versions?.node) {
  await import('dotenv/config');
}
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const isNode = typeof process !== 'undefined' && process?.versions?.node;
const connectionString = isNode ? `${process.env.DATABASE_URL}` : '';
const adapter = new PrismaNeon({ connectionString });
const prisma = globalThis.prisma || new PrismaClient({ adapter });

if (isNode && process.env.NODE_ENV === 'development') globalThis.prisma = prisma;

export default prisma;