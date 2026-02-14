/**
 * Shared Database Types
 * 
 * Type definitions for:
 * - LegalFlow (main app)
 * - Invoice Ninja data (clients, invoices, payments)
 * - Cal.com data (bookings, events, schedules)
 */

// ============================================
// Invoice Ninja Data Types
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

// ============================================
// Cal.com Data Types
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

// ============================================
// Re-export everything
// ============================================

export default {
  InvoiceNinjaClient: {} as InvoiceNinjaClient,
  InvoiceNinjaInvoice: {} as InvoiceNinjaInvoice,
  InvoiceNinjaInvoiceItem: {} as InvoiceNinjaInvoiceItem,
  InvoiceNinjaPayment: {} as InvoiceNinjaPayment,
  CalcomEventType: {} as CalcomEventType,
  CalcomBooking: {} as CalcomBooking,
  CalcomSchedule: {} as CalcomSchedule,
  CalcomAvailabilitySlot: {} as CalcomAvailabilitySlot,
}