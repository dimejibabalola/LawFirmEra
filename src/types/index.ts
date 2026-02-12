// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: UserRole
  department?: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'admin' | 'partner' | 'associate' | 'paralegal' | 'assistant' | 'billing'

// ============================================
// Client Types
// ============================================

export interface Client {
  id: string
  name: string
  type: ClientType
  email: string
  phone?: string
  address?: Address
  company?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type ClientType = 'individual' | 'corporate' | 'government'

export interface Address {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

// ============================================
// Matter Types
// ============================================

export interface Matter {
  id: string
  clientId: string
  client?: Client
  title: string
  description?: string
  practiceArea: PracticeArea
  status: MatterStatus
  priority: MatterPriority
  assignedTo: string[]
  assignedUsers?: User[]
  openDate: Date
  closeDate?: Date
  statuteOfLimitations?: Date
  estimatedHours?: number
  actualHours?: number
  budget?: number
  createdAt: Date
  updatedAt: Date
}

export type PracticeArea = 
  | 'corporate'
  | 'litigation'
  | 'real-estate'
  | 'estate-planning'
  | 'family-law'
  | 'criminal-defense'
  | 'intellectual-property'
  | 'employment'
  | 'immigration'
  | 'tax'
  | 'environmental'
  | 'bankruptcy'

export type MatterStatus = 
  | 'new'
  | 'open'
  | 'pending'
  | 'in-discovery'
  | 'in-negotiation'
  | 'in-litigation'
  | 'settled'
  | 'closed'
  | 'archived'

export type MatterPriority = 'low' | 'medium' | 'high' | 'urgent' | 'critical'

// ============================================
// Billing Types
// ============================================

export interface Invoice {
  id: string
  matterId: string
  matter?: Matter
  invoiceNumber: string
  status: InvoiceStatus
  issueDate: Date
  dueDate: Date
  amount: number
  tax?: number
  total: number
  paidAmount: number
  items: InvoiceItem[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export type InvoiceStatus = 'draft' | 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface InvoiceItem {
  id: string
  description: string
  quantity: number
  rate: number
  amount: number
  type: 'time' | 'expense' | 'flat-fee'
}

export interface TimeEntry {
  id: string
  matterId: string
  matter?: Matter
  userId: string
  user?: User
  description: string
  duration: number // in minutes
  rate: number
  amount: number
  date: Date
  billable: boolean
  invoiced: boolean
  invoiceId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Expense {
  id: string
  matterId: string
  matter?: Matter
  userId: string
  user?: User
  description: string
  amount: number
  date: Date
  category: ExpenseCategory
  receipt?: string
  billable: boolean
  invoiced: boolean
  invoiceId?: string
  createdAt: Date
  updatedAt: Date
}

export type ExpenseCategory = 
  | 'travel'
  | 'court-fees'
  | 'filing-fees'
  | 'expert-witnesses'
  | 'investigative'
  | 'photocopying'
  | 'postage'
  | 'research'
  | 'other'

// ============================================
// Document Types
// ============================================

export interface Document {
  id: string
  matterId?: string
  matter?: Matter
  clientId?: string
  client?: Client
  name: string
  description?: string
  type: DocumentType
  category: DocumentCategory
  size: number
  mimeType: string
  url: string
  uploadedBy: string
  uploadedByUser?: User
  tags?: string[]
  version: number
  parentId?: string
  createdAt: Date
  updatedAt: Date
}

export type DocumentType = 
  | 'contract'
  | 'pleading'
  | 'motion'
  | 'brief'
  | 'correspondence'
  | 'discovery'
  | 'evidence'
  | 'financial'
  | 'certificate'
  | 'agreement'
  | ' memorandum'
  | 'form'
  | 'other'

export type DocumentCategory = 
  | 'legal'
  | 'financial'
  | 'correspondence'
  | 'evidence'
  | 'administrative'
  | 'templates'
  | 'other'

// ============================================
// Calendar & Events Types
// ============================================

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: EventType
  startTime: Date
  endTime: Date
  allDay: boolean
  location?: string
  matterId?: string
  matter?: Matter
  clientId?: string
  client?: Client
  participants?: EventParticipant[]
  reminders?: Reminder[]
  recurrence?: RecurrenceRule
  status: EventStatus
  color?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type EventType = 
  | 'meeting'
  | 'court-hearing'
  | 'deposition'
  | 'deadline'
  | 'task'
  | 'appointment'
  | 'reminder'
  | 'other'

export type EventStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled'

export interface EventParticipant {
  id: string
  type: 'user' | 'client' | 'contact'
  userId?: string
  user?: User
  clientId?: string
  client?: Client
  email?: string
  name?: string
  status: 'pending' | 'accepted' | 'declined' | 'tentative'
}

export interface Reminder {
  id: string
  time: number // minutes before event
  type: 'email' | 'notification' | 'sms'
  sent: boolean
}

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
  interval: number
  endDate?: Date
  endAfterOccurrences?: number
  daysOfWeek?: number[]
  dayOfMonth?: number
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate?: Date
  completedAt?: Date
  matterId?: string
  matter?: Matter
  clientId?: string
  client?: Client
  assignedTo: string[]
  assignedUsers?: User[]
  createdBy: string
  createdByUser?: User
  parentTaskId?: string
  subtasks?: Task[]
  tags?: string[]
  estimatedHours?: number
  actualHours?: number
  createdAt: Date
  updatedAt: Date
}

export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

// ============================================
// Message Types
// ============================================

export interface Message {
  id: string
  subject?: string
  content: string
  senderId: string
  sender?: User
  recipientIds: string[]
  recipients?: User[]
  matterId?: string
  matter?: Matter
  parentId?: string
  replies?: Message[]
  attachments?: MessageAttachment[]
  read: boolean
  readAt?: Date
  starred: boolean
  createdAt: Date
  updatedAt: Date
}

export interface MessageAttachment {
  id: string
  documentId: string
  document?: Document
  name: string
  size: number
  mimeType: string
  url: string
}

export interface Conversation {
  id: string
  participants: User[]
  messages: Message[]
  lastMessage?: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  read: boolean
  readAt?: Date
  actionUrl?: string
  actionText?: string
  entityId?: string
  entityType?: string
  createdAt: Date
}

export type NotificationType = 
  | 'task-assigned'
  | 'task-due'
  | 'task-completed'
  | 'message-received'
  | 'event-reminder'
  | 'deadline-reminder'
  | 'invoice-created'
  | 'invoice-paid'
  | 'invoice-overdue'
  | 'matter-updated'
  | 'document-shared'
  | 'system'

// ============================================
// Report Types
// ============================================

export interface Report {
  id: string
  name: string
  type: ReportType
  description?: string
  parameters: ReportParameters
  schedule?: ReportSchedule
  recipients?: string[]
  format: 'pdf' | 'excel' | 'csv'
  lastRunAt?: Date
  nextRunAt?: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

export type ReportType = 
  | 'billing-summary'
  | 'time-tracking'
  | 'matter-status'
  | 'client-activity'
  | 'financial'
  | 'productivity'
  | 'custom'

export interface ReportParameters {
  startDate?: Date
  endDate?: Date
  matterIds?: string[]
  clientIds?: string[]
  userIds?: string[]
  practiceAreas?: PracticeArea[]
  groupBy?: 'day' | 'week' | 'month' | 'quarter' | 'year'
}

export interface ReportSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly'
  dayOfWeek?: number
  dayOfMonth?: number
  time: string
}

// ============================================
// Settings Types
// ============================================

export interface UserSettings {
  id: string
  userId: string
  theme: 'light' | 'dark' | 'system'
  sidebarCollapsed: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  defaultCalendarView: 'day' | 'week' | 'month'
  defaultTaskView: 'list' | 'board' | 'calendar'
  language: string
  timezone: string
  dateFormat: string
  timeFormat: '12h' | '24h'
  createdAt: Date
  updatedAt: Date
}

export interface FirmSettings {
  id: string
  name: string
  logo?: string
  address?: Address
  phone?: string
  email?: string
  website?: string
  taxId?: string
  invoicePrefix: string
  invoiceStartingNumber: number
  defaultHourlyRate: number
  defaultBillableHourlyRate: number
  currency: string
  fiscalYearStart: number
  createdAt: Date
  updatedAt: Date
}

// ============================================
// Dashboard & Analytics Types
// ============================================

export interface DashboardStats {
  totalMatters: number
  activeMatters: number
  pendingTasks: number
  upcomingEvents: number
  unreadMessages: number
  unbilledHours: number
  unbilledAmount: number
  overdueInvoices: number
  overdueAmount: number
}

export interface MatterActivity {
  id: string
  matterId: string
  matter?: Matter
  type: MatterActivityType
  description: string
  userId: string
  user?: User
  metadata?: Record<string, unknown>
  createdAt: Date
}

export type MatterActivityType = 
  | 'created'
  | 'updated'
  | 'status-changed'
  | 'assigned'
  | 'note-added'
  | 'document-uploaded'
  | 'time-logged'
  | 'expense-added'
  | 'invoice-created'
  | 'event-scheduled'

// ============================================
// Search Types
// ============================================

export interface SearchResult {
  id: string
  type: 'matter' | 'client' | 'document' | 'task' | 'event' | 'contact'
  title: string
  description?: string
  url: string
  relevance: number
  highlights?: string[]
}

export interface SearchFilters {
  query: string
  types?: SearchResult['type'][]
  dateFrom?: Date
  dateTo?: Date
  practiceAreas?: PracticeArea[]
  statuses?: MatterStatus[]
  assignedTo?: string[]
  clients?: string[]
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ============================================
// UI Component Types
// ============================================

export interface NavItem {
  id: string
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: number | string
  children?: NavItem[]
  disabled?: boolean
}

export interface BreadcrumbItem {
  title: string
  href?: string
}

export interface TableColumn<T> {
  id: string
  header: string
  accessor: keyof T | ((row: T) => unknown)
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  cell?: (value: unknown, row: T) => React.ReactNode
}

export interface FilterOption {
  label: string
  value: string
  count?: number
}
