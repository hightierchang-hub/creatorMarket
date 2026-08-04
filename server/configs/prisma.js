import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;

const isNode = typeof process !== 'undefined' && process?.versions?.node;
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const adapter = connectionString ? new PrismaNeon({ connectionString }) : null;
const prisma = globalThis.prisma || new PrismaClient(adapter ? { adapter } : undefined);

let dbConnectionState = 'unknown';
let dbConnectionError = null;

const connectWithRetry = async (attempt = 1) => {
  if (!connectionString) {
    dbConnectionState = 'missing';
    dbConnectionError = new Error('Missing DATABASE_URL or DIRECT_URL');
    console.warn('[prisma] No database connection string configured.');
    return false;
  }

  try {
    await prisma.$connect();
    dbConnectionState = 'connected';
    dbConnectionError = null;
    return true;
  } catch (error) {
    if (attempt < 4) {
      const delayMs = 1000 * attempt;
      console.warn(`[prisma] Connection failed (attempt ${attempt}/4). Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return connectWithRetry(attempt + 1);
    }

    dbConnectionState = 'disconnected';
    dbConnectionError = error;
    console.error('[prisma] Database connection failed after retries:', error);
    return false;
  }
};

if (isNode && process.env.NODE_ENV === 'development') globalThis.prisma = prisma;

const isDbAvailable = () => dbConnectionState === 'connected';

export { connectWithRetry, isDbAvailable, dbConnectionError };
export default prisma;