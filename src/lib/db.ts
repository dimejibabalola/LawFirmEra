import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
// Re-export from shared-db package for Invoice Ninja and Cal.com integration
export { 
  InvoiceNinjaDB, 
  CalcomDB, 
  SyncService,
  type InvoiceNinjaClient,
  type InvoiceNinjaInvoice,
  type CalcomBooking,
  type CalcomEventType
} from "@legalflow/shared-db"
