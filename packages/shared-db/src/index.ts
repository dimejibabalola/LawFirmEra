/**
 * Shared Database Configuration
 * 
 * This module provides direct database connections for:
 * - LegalFlow (main app)
 * - Invoice Ninja data (clients, invoices, payments)
 * - Cal.com data (bookings, events, schedules)
 * 
 * NO API calls - direct Prisma queries only
 */

import { PrismaClient } from '@prisma/client'

// Singleton Prisma client
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ============================================
// Invoice Ninja Data Types & Queries
// ============================================

export interface InvoiceNinjaClient {
  id: string
  name: string
  email: string
  phone?: string
  address1?: string
  city?: string
  state?: string
  postal_code?: string
  country_id?: string
  industry?: string
  balance: number
  paid_to_date: number
  credit_balance: number
  private_notes?: string
  public_notes?: string
  created_at: Date
  updated_at: Date
}

export interface InvoiceNinjaInvoice {
  id: string
  number: string
  client_id: string
  status_id: string
  amount: number
  balance: number
  paid_to_date: number
  tax_amount: number
  discount: number
  partial: number
  date?: Date
  due_date?: Date
  partial_due_date?: Date
  design_id?: string
  private_notes?: string
  public_notes?: string
  footer?: string
  created_at: Date
  updated_at: Date
}

export interface InvoiceNinjaInvoiceItem {
  id: string
  invoice_id: string
  product_key?: string
  notes?: string
  cost: number
  quantity: number
  tax_rate1: number
  tax_name1?: string
  discount: number
  sort_id: number
}

export interface InvoiceNinjaPayment {
  id: string
  client_id: string
  amount: number
  applied: number
  transaction_reference?: string
  payment_date?: Date
  status_id: string
  created_at: Date
}

/**
 * Invoice Ninja Database Adapter
 * Direct queries to Invoice Ninja tables (same database or linked)
 */
export const InvoiceNinjaDB = {
  // Clients
  async getClients(limit = 50, offset = 0): Promise<InvoiceNinjaClient[]> {
    return prisma.$queryRaw`
      SELECT 
        id, name, email, phone, address1, city, state, postal_code,
        country_id, balance, paid_to_date, credit_balance,
        private_notes, public_notes, created_at, updated_at
      FROM clients
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    ` as Promise<InvoiceNinjaClient[]>
  },

  async getClientById(id: string): Promise<InvoiceNinjaClient | null> {
    const results = await prisma.$queryRaw`
      SELECT 
        id, name, email, phone, address1, city, state, postal_code,
        country_id, balance, paid_to_date, credit_balance,
        private_notes, public_notes, created_at, updated_at
      FROM clients
      WHERE id = ${id} AND is_deleted = 0
      LIMIT 1
    ` as InvoiceNinjaClient[]
    return results[0] || null
  },

  async searchClients(query: string): Promise<InvoiceNinjaClient[]> {
    const searchTerm = `%${query}%`
    return prisma.$queryRaw`
      SELECT 
        id, name, email, phone, address1, city, state, postal_code,
        country_id, balance, paid_to_date, credit_balance,
        private_notes, public_notes, created_at, updated_at
      FROM clients
      WHERE is_deleted = 0
        AND (name LIKE ${searchTerm} OR email LIKE ${searchTerm})
      ORDER BY name ASC
      LIMIT 20
    ` as Promise<InvoiceNinjaClient[]>
  },

  // Invoices
  async getInvoices(clientId?: string, statusId?: string): Promise<InvoiceNinjaInvoice[]> {
    if (clientId && statusId) {
      return prisma.$queryRaw`
        SELECT 
          id, number, client_id, status_id, amount, balance, paid_to_date,
          tax_amount, discount, partial, date, due_date, partial_due_date,
          private_notes, public_notes, footer, created_at, updated_at
        FROM invoices
        WHERE client_id = ${clientId} AND status_id = ${statusId} AND is_deleted = 0
        ORDER BY created_at DESC
      ` as Promise<InvoiceNinjaInvoice[]>
    } else if (clientId) {
      return prisma.$queryRaw`
        SELECT 
          id, number, client_id, status_id, amount, balance, paid_to_date,
          tax_amount, discount, partial, date, due_date, partial_due_date,
          private_notes, public_notes, footer, created_at, updated_at
        FROM invoices
        WHERE client_id = ${clientId} AND is_deleted = 0
        ORDER BY created_at DESC
      ` as Promise<InvoiceNinjaInvoice[]>
    }
    return prisma.$queryRaw`
      SELECT 
        id, number, client_id, status_id, amount, balance, paid_to_date,
        tax_amount, discount, partial, date, due_date, partial_due_date,
        private_notes, public_notes, footer, created_at, updated_at
      FROM invoices
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 100
    ` as Promise<InvoiceNinjaInvoice[]>
  },

  async getInvoiceItems(invoiceId: string): Promise<InvoiceNinjaInvoiceItem[]> {
    return prisma.$queryRaw`
      SELECT 
        id, invoice_id, product_key, notes, cost, quantity,
        tax_rate1, tax_name1, discount, sort_id
      FROM invoice_items
      WHERE invoice_id = ${invoiceId}
      ORDER BY sort_id ASC
    ` as Promise<InvoiceNinjaInvoiceItem[]>
  },

  // Payments
  async getPayments(clientId?: string): Promise<InvoiceNinjaPayment[]> {
    if (clientId) {
      return prisma.$queryRaw`
        SELECT 
          id, client_id, amount, applied, transaction_reference,
          payment_date, status_id, created_at
        FROM payments
        WHERE client_id = ${clientId} AND is_deleted = 0
        ORDER BY created_at DESC
      ` as Promise<InvoiceNinjaPayment[]>
    }
    return prisma.$queryRaw`
      SELECT 
        id, client_id, amount, applied, transaction_reference,
        payment_date, status_id, created_at
      FROM payments
      WHERE is_deleted = 0
      ORDER BY created_at DESC
      LIMIT 100
    ` as Promise<InvoiceNinjaPayment[]>
  },

  // Create Invoice (sync from LegalFlow)
  async createInvoice(data: {
    clientId: string
    number: string
    amount: number
    items: Array<{
      productKey?: string
      notes?: string
      cost: number
      quantity: number
    }>
    date: Date
    dueDate: Date
  }) {
    const invoiceId = crypto.randomUUID()
    
    await prisma.$executeRaw`
      INSERT INTO invoices (
        id, number, client_id, status_id, amount, balance,
        date, due_date, created_at, updated_at, is_deleted
      ) VALUES (
        ${invoiceId}, ${data.number}, ${data.clientId}, '1', ${data.amount}, ${data.amount},
        ${data.date}, ${data.dueDate}, NOW(), NOW(), 0
      )
    `

    for (let i = 0; i < data.items.length; i++) {
      const item = data.items[i]
      const itemId = crypto.randomUUID()
      await prisma.$executeRaw`
        INSERT INTO invoice_items (
          id, invoice_id, product_key, notes, cost, quantity, sort_id
        ) VALUES (
          ${itemId}, ${invoiceId}, ${item.productKey || null}, ${item.notes || null},
          ${item.cost}, ${item.quantity}, ${i}
        )
      `
    }

    return invoiceId
  }
}

// ============================================
// Cal.com Data Types & Queries  
// ============================================

export interface CalcomEventType {
  id: number
  title: string
  slug: string
  description?: string
  length: number
  hidden: boolean
  position: number
  price: number
  currency: string
  slotDuration?: number
  minimumBookingNotice?: number
  beforeEventBuffer?: number
  afterEventBuffer?: number
  schedulingType?: string
  teamId?: number
  userId?: number
  created_at?: Date
}

export interface CalcomBooking {
  id: number
  uid: string
  title: string
  description?: string
  startTime: Date
  endTime: Date
  status: string
  paid: boolean
  cancelled?: Date
  rejectionReason?: string
  rescheduled?: boolean
  location?: string
  eventType: {
    id: number
    title: string
    slug: string
    length: number
    price: number
    currency: string
  }
  attendees: Array<{
    id: number
    name: string
    email: string
    timeZone: string
  }>
  userId?: number
  created_at: Date
}

export interface CalcomSchedule {
  id: number
  name: string
  timeZone: string
  availability: Array<{
    days: number[]
    startTime: string
    endTime: string
  }>
}

export interface CalcomAvailabilitySlot {
  startTime: Date
  endTime: Date
  eventTypeId: number
  userId?: number
}

/**
 * Cal.com Database Adapter
 * Direct queries to Cal.com tables
 */
export const CalcomDB = {
  // Event Types
  async getEventTypes(userId?: number): Promise<CalcomEventType[]> {
    if (userId) {
      return prisma.$queryRaw`
        SELECT 
          id, title, slug, description, length, hidden, position,
          price, currency, "slotDuration", "minimumBookingNotice",
          "beforeEventBuffer", "afterEventBuffer", "schedulingType",
          "teamId", "userId", created_at
        FROM "EventType"
        WHERE "userId" = ${userId} AND hidden = false
        ORDER BY position ASC
      ` as Promise<CalcomEventType[]>
    }
    return prisma.$queryRaw`
      SELECT 
        id, title, slug, description, length, hidden, position,
        price, currency, "slotDuration", "minimumBookingNotice",
        "beforeEventBuffer", "afterEventBuffer", "schedulingType",
        "teamId", "userId", created_at
      FROM "EventType"
      WHERE hidden = false
      ORDER BY position ASC
    ` as Promise<CalcomEventType[]>
  },

  async getEventTypeById(id: number): Promise<CalcomEventType | null> {
    const results = await prisma.$queryRaw`
      SELECT 
        id, title, slug, description, length, hidden, position,
        price, currency, "slotDuration", "minimumBookingNotice",
        "beforeEventBuffer", "afterEventBuffer", "schedulingType",
        "teamId", "userId", created_at
      FROM "EventType"
      WHERE id = ${id}
      LIMIT 1
    ` as CalcomEventType[]
    return results[0] || null
  },

  // Bookings
  async getBookings(userId?: number, startDate?: Date, endDate?: Date): Promise<CalcomBooking[]> {
    let query = `
      SELECT 
        b.id, b.uid, b.title, b.description, b."startTime", b."endTime",
        b.status, b.paid, b.cancelled, b."rejectionReason", b.rescheduled,
        b.location, b."userId", b.created_at,
        json_build_object(
          'id', et.id,
          'title', et.title,
          'slug', et.slug,
          'length', et.length,
          'price', et.price,
          'currency', et.currency
        ) as "eventType",
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'name', a.name,
              'email', a.email,
              'timeZone', a."timeZone"
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        ) as attendees
      FROM "Booking" b
      LEFT JOIN "EventType" et ON b."eventTypeId" = et.id
      LEFT JOIN "Attendee" a ON a."bookingId" = b.id
      WHERE 1=1
    `
    const params: any[] = []
    let paramIndex = 1

    if (userId) {
      query += ` AND b."userId" = $${paramIndex++}`
      params.push(userId)
    }
    if (startDate) {
      query += ` AND b."startTime" >= $${paramIndex++}`
      params.push(startDate)
    }
    if (endDate) {
      query += ` AND b."endTime" <= $${paramIndex++}`
      params.push(endDate)
    }

    query += `
      GROUP BY b.id, et.id
      ORDER BY b."startTime" DESC
      LIMIT 100
    `

    return prisma.$queryRawUnsafe(query, ...params) as Promise<CalcomBooking[]>
  },

  async getBookingById(id: number): Promise<CalcomBooking | null> {
    const results = await prisma.$queryRaw`
      SELECT 
        b.id, b.uid, b.title, b.description, b."startTime", b."endTime",
        b.status, b.paid, b.cancelled, b."rejectionReason", b.rescheduled,
        b.location, b."userId", b.created_at,
        json_build_object(
          'id', et.id,
          'title', et.title,
          'slug', et.slug,
          'length', et.length,
          'price', et.price,
          'currency', et.currency
        ) as "eventType",
        COALESCE(
          json_agg(
            json_build_object(
              'id', a.id,
              'name', a.name,
              'email', a.email,
              'timeZone', a."timeZone"
            )
          ) FILTER (WHERE a.id IS NOT NULL),
          '[]'::json
        ) as attendees
      FROM "Booking" b
      LEFT JOIN "EventType" et ON b."eventTypeId" = et.id
      LEFT JOIN "Attendee" a ON a."bookingId" = b.id
      WHERE b.id = ${id}
      GROUP BY b.id, et.id
      LIMIT 1
    ` as CalcomBooking[]
    return results[0] || null
  },

  async createBooking(data: {
    eventTypeId: number
    userId?: number
    title: string
    startTime: Date
    endTime: Date
    location?: string
    attendees: Array<{
      name: string
      email: string
      timeZone: string
    }>
  }) {
    const uid = crypto.randomUUID().replace(/-/g, '').substring(0, 16)
    
    const result = await prisma.$queryRaw`
      INSERT INTO "Booking" (
        uid, title, "eventTypeId", "userId", "startTime", "endTime",
        location, status, paid, created_at, updated_at
      ) VALUES (
        ${uid}, ${data.title}, ${data.eventTypeId}, ${data.userId || null},
        ${data.startTime}, ${data.endTime}, ${data.location || null},
        'ACCEPTED', false, NOW(), NOW()
      ) RETURNING id
    ` as { id: number }[]

    const bookingId = result[0].id

    for (const attendee of data.attendees) {
      await prisma.$executeRaw`
        INSERT INTO "Attendee" (
          name, email, "timeZone", "bookingId", created_at, updated_at
        ) VALUES (
          ${attendee.name}, ${attendee.email}, ${attendee.timeZone},
          ${bookingId}, NOW(), NOW()
        )
      `
    }

    return { id: bookingId, uid }
  },

  async cancelBooking(id: number, reason?: string) {
    return prisma.$executeRaw`
      UPDATE "Booking"
      SET status = 'CANCELLED', 
          cancelled = NOW(),
          "rejectionReason" = ${reason || null},
          updated_at = NOW()
      WHERE id = ${id}
    `
  },

  // Availability
  async getAvailability(userId?: number): Promise<CalcomSchedule[]> {
    if (userId) {
      return prisma.$queryRaw`
        SELECT 
          s.id, s.name, s."timeZone",
          json_agg(
            json_build_object(
              'days', a.days,
              'startTime', a."startTime",
              'endTime', a."endTime"
            )
          ) as availability
        FROM "Schedule" s
        LEFT JOIN "Availability" a ON a."scheduleId" = s.id
        WHERE s."userId" = ${userId}
        GROUP BY s.id
        ORDER BY s.name
      ` as Promise<CalcomSchedule[]>
    }
    return prisma.$queryRaw`
      SELECT 
        s.id, s.name, s."timeZone",
        json_agg(
          json_build_object(
            'days', a.days,
            'startTime', a."startTime",
            'endTime', a."endTime"
          )
        ) as availability
      FROM "Schedule" s
      LEFT JOIN "Availability" a ON a."scheduleId" = s.id
      GROUP BY s.id
      ORDER BY s.name
    ` as Promise<CalcomSchedule[]>
  },

  async getAvailableSlots(eventTypeId: number, dateStart: Date, dateEnd: Date): Promise<CalcomAvailabilitySlot[]> {
    return prisma.$queryRaw`
      SELECT 
        s."startTime", s."endTime", s."eventTypeId", s."userId"
      FROM "Slot" s
      WHERE s."eventTypeId" = ${eventTypeId}
        AND s."startTime" >= ${dateStart}
        AND s."endTime" <= ${dateEnd}
        AND s."isBooked" = false
      ORDER BY s."startTime" ASC
    ` as Promise<CalcomAvailabilitySlot[]>
  }
}

// ============================================
// LegalFlow <-> Invoice Ninja Sync
// ============================================

export const SyncService = {
  async syncClientFromInvoiceNinja(inClient: InvoiceNinjaClient) {
    // Check if client exists in LegalFlow
    const existing = await prisma.$queryRaw`
      SELECT id FROM "Client" WHERE email = ${inClient.email} LIMIT 1
    ` as { id: string }[]

    if (existing.length > 0) {
      // Update existing
      return prisma.$executeRaw`
        UPDATE "Client" 
        SET name = ${inClient.name},
            phone = ${inClient.phone || null},
            "balanceOwed" = ${inClient.balance},
            "totalPaid" = ${inClient.paid_to_date},
            "updatedAt" = NOW()
        WHERE email = ${inClient.email}
      `
    } else {
      // Create new
      return prisma.$executeRaw`
        INSERT INTO "Client" (
          id, name, email, phone, type, "balanceOwed", "totalPaid",
          "createdAt", "updatedAt"
        ) VALUES (
          gen_random_uuid(), ${inClient.name}, ${inClient.email},
          ${inClient.phone || null}, 'CORPORATE', ${inClient.balance},
          ${inClient.paid_to_date}, NOW(), NOW()
        )
      `
    }
  },

  async syncInvoicesFromInvoiceNinja(clientId?: string) {
    const invoices = await InvoiceNinjaDB.getInvoices(clientId)
    
    for (const inv of invoices) {
      // Sync each invoice to LegalFlow
      await prisma.$executeRaw`
        INSERT INTO "Invoice" (
          id, "invoiceNumber", "clientId", status, amount, "paidAmount",
          balance, "issueDate", "dueDate", "createdAt", "updatedAt"
        ) VALUES (
          ${inv.id}, ${inv.number}, ${inv.client_id}, ${inv.status_id},
          ${inv.amount}, ${inv.paid_to_date}, ${inv.balance},
          ${inv.date || new Date()}, ${inv.due_date || new Date()},
          ${inv.created_at}, ${inv.updated_at}
        )
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          amount = EXCLUDED.amount,
          "paidAmount" = EXCLUDED."paidAmount",
          balance = EXCLUDED.balance,
          "updatedAt" = NOW()
      `
    }

    return invoices.length
  }
}

// Re-export everything
export default {
  prisma,
  InvoiceNinjaDB,
  CalcomDB,
  SyncService,
}
