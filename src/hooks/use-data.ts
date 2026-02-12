"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

// ============================================
// Types
// ============================================

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  avatar: string | null
  phone: string | null
  department: string | null
  title: string | null
  barNumber: string | null
  hourlyRate: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type UserRole = 'ADMIN' | 'PARTNER' | 'ASSOCIATE' | 'PARALEGAL' | 'ASSISTANT' | 'STAFF' | 'CLIENT'

export interface Client {
  id: string
  companyName: string | null
  firstName: string
  lastName: string
  email: string
  phone: string | null
  mobile: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string
  clientType: ClientType
  industry: string | null
  source: string | null
  notes: string | null
  status: ClientStatus
  createdAt: string
  updatedAt: string
  _count?: {
    matters: number
    documents: number
  }
}

export type ClientType = 'INDIVIDUAL' | 'BUSINESS' | 'GOVERNMENT' | 'NON_PROFIT'
export type ClientStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'ARCHIVED'

export interface Matter {
  id: string
  matterNumber: string
  clientId: string
  title: string
  description: string | null
  practiceArea: PracticeArea
  status: MatterStatus
  priority: Priority
  openDate: string
  closeDate: string | null
  statuteLimitDate: string | null
  leadAttorneyId: string
  estimatedHours: number | null
  billingType: BillingType
  fixedFeeAmount: number | null
  retainerAmount: number | null
  notes: string | null
  createdAt: string
  updatedAt: string
  client?: Client
  leadAttorney?: User
  _count?: {
    tasks: number
    documents: number
    timeEntries: number
  }
}

export type PracticeArea = 'CORPORATE' | 'LITIGATION' | 'REAL_ESTATE' | 'INTELLECTUAL_PROPERTY' | 'FAMILY_LAW' | 'CRIMINAL_DEFENSE' | 'IMMIGRATION' | 'TAX' | 'ESTATE_PLANNING' | 'EMPLOYMENT' | 'ENVIRONMENTAL' | 'BANKING_FINANCE' | 'OTHER'
export type MatterStatus = 'INTAKE' | 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'ON_HOLD' | 'CLOSED' | 'ARCHIVED'
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type BillingType = 'HOURLY' | 'FIXED_FEE' | 'CONTINGENCY' | 'RETAINER' | 'PRO_BONO'

export interface Task {
  id: string
  matterId: string | null
  title: string
  description: string | null
  assigneeId: string
  createdById: string
  status: TaskStatus
  priority: Priority
  dueDate: string | null
  completedAt: string | null
  createdAt: string
  updatedAt: string
  assignee?: User
  matter?: Matter
}

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'

export interface Event {
  id: string
  matterId: string | null
  userId: string
  title: string
  description: string | null
  location: string | null
  startAt: string
  endAt: string
  isAllDay: boolean
  eventType: EventType
  status: EventStatus
  reminder: number | null
  createdAt: string
  updatedAt: string
  matter?: Matter
  user?: User
}

export type EventType = 'MEETING' | 'COURT_HEARING' | 'DEPOSITION' | 'DEADLINE' | 'CONSULTATION' | 'CALL' | 'OTHER'
export type EventStatus = 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'

export interface Document {
  id: string
  matterId: string | null
  clientId: string | null
  authorId: string
  title: string
  description: string | null
  fileName: string
  filePath: string
  fileSize: number
  fileType: string
  category: DocumentCategory
  status: DocumentStatus
  version: number
  isConfidential: boolean
  uploadedAt: string
  updatedAt: string
  matter?: Matter
  client?: Client
  author?: User
}

export type DocumentCategory = 'PLEADING' | 'MOTION' | 'BRIEF' | 'CONTRACT' | 'AGREEMENT' | 'CORRESPONDENCE' | 'MEMO' | 'DISCOVERY' | 'EVIDENCE' | 'FINANCIAL' | 'FORM' | 'OTHER'
export type DocumentStatus = 'DRAFT' | 'REVIEW' | 'FINAL' | 'FILED' | 'ARCHIVED'

export interface TimeEntry {
  id: string
  matterId: string
  userId: string
  date: string
  description: string
  hours: number
  rate: number
  isBillable: boolean
  isBilled: boolean
  invoiceId: string | null
  createdAt: string
  updatedAt: string
  matter?: Matter
  user?: User
}

export interface Invoice {
  id: string
  invoiceNumber: string
  clientId: string
  matterId: string | null
  status: InvoiceStatus
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paidAmount: number
  notes: string | null
  terms: string | null
  createdAt: string
  updatedAt: string
  client?: Client
  matter?: Matter
  timeEntries?: TimeEntry[]
  lineItems?: InvoiceLineItem[]
}

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'PAID' | 'PARTIAL' | 'OVERDUE' | 'VOID'

export interface InvoiceLineItem {
  id: string
  invoiceId: string
  description: string
  quantity: number
  rate: number
  amount: number
  createdAt: string
}

export interface MessageThread {
  id: string
  subject: string
  matterId: string | null
  lastMessageAt: string
  createdAt: string
  updatedAt: string
  participants?: User[]
  messages?: Message[]
}

export interface Message {
  id: string
  threadId: string
  senderId: string
  content: string
  isRead: boolean
  sentAt: string
  sender?: User
  thread?: MessageThread
}

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
  revenue: number
  revenueThisMonth: number
}

// ============================================
// API Functions
// ============================================

// Dashboard
async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await fetch('/api/dashboard/stats')
  if (!response.ok) throw new Error('Failed to fetch dashboard stats')
  return response.json()
}

// Users
async function fetchUsers(): Promise<{ users: User[] }> {
  const response = await fetch('/api/users')
  if (!response.ok) throw new Error('Failed to fetch users')
  return response.json()
}

async function fetchUser(id: string): Promise<{ user: User }> {
  const response = await fetch(`/api/users?id=${id}`)
  if (!response.ok) throw new Error('Failed to fetch user')
  return response.json()
}

async function createUser(data: Partial<User>): Promise<{ user: User }> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create user')
  return response.json()
}

async function updateUser(id: string, data: Partial<User>): Promise<{ user: User }> {
  const response = await fetch('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) throw new Error('Failed to update user')
  return response.json()
}

async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`/api/users?id=${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete user')
}

// Clients
async function fetchClients(params?: { type?: string; status?: string; search?: string }): Promise<{ clients: Client[] }> {
  const searchParams = new URLSearchParams()
  if (params?.type) searchParams.set('type', params.type)
  if (params?.status) searchParams.set('status', params.status)
  if (params?.search) searchParams.set('search', params.search)
  
  const response = await fetch(`/api/clients${searchParams.toString() ? '?' + searchParams : ''}`)
  if (!response.ok) throw new Error('Failed to fetch clients')
  return response.json()
}

async function fetchClient(id: string): Promise<{ client: Client }> {
  const response = await fetch(`/api/clients?id=${id}`)
  if (!response.ok) throw new Error('Failed to fetch client')
  return response.json()
}

async function createClient(data: Partial<Client>): Promise<{ client: Client }> {
  const response = await fetch('/api/clients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create client')
  return response.json()
}

async function updateClient(id: string, data: Partial<Client>): Promise<{ client: Client }> {
  const response = await fetch('/api/clients', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) throw new Error('Failed to update client')
  return response.json()
}

async function deleteClient(id: string): Promise<void> {
  const response = await fetch(`/api/clients?id=${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete client')
}

// Matters
async function fetchMatters(params?: { status?: string; practiceArea?: string; clientId?: string; search?: string }): Promise<{ matters: Matter[] }> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.practiceArea) searchParams.set('practiceArea', params.practiceArea)
  if (params?.clientId) searchParams.set('clientId', params.clientId)
  if (params?.search) searchParams.set('search', params.search)
  
  const response = await fetch(`/api/matters${searchParams.toString() ? '?' + searchParams : ''}`)
  if (!response.ok) throw new Error('Failed to fetch matters')
  return response.json()
}

async function fetchMatter(id: string): Promise<{ matter: Matter }> {
  const response = await fetch(`/api/matters?id=${id}`)
  if (!response.ok) throw new Error('Failed to fetch matter')
  return response.json()
}

async function createMatter(data: Partial<Matter>): Promise<{ matter: Matter }> {
  const response = await fetch('/api/matters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create matter')
  return response.json()
}

async function updateMatter(id: string, data: Partial<Matter>): Promise<{ matter: Matter }> {
  const response = await fetch('/api/matters', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) throw new Error('Failed to update matter')
  return response.json()
}

async function deleteMatter(id: string): Promise<void> {
  const response = await fetch(`/api/matters?id=${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete matter')
}

// Tasks
async function fetchTasks(params?: { status?: string; assigneeId?: string; matterId?: string }): Promise<{ tasks: Task[] }> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.assigneeId) searchParams.set('assigneeId', params.assigneeId)
  if (params?.matterId) searchParams.set('matterId', params.matterId)
  
  const response = await fetch(`/api/tasks${searchParams.toString() ? '?' + searchParams : ''}`)
  if (!response.ok) throw new Error('Failed to fetch tasks')
  return response.json()
}

async function fetchTask(id: string): Promise<{ task: Task }> {
  const response = await fetch(`/api/tasks?id=${id}`)
  if (!response.ok) throw new Error('Failed to fetch task')
  return response.json()
}

async function createTask(data: Partial<Task>): Promise<{ task: Task }> {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create task')
  return response.json()
}

async function updateTask(id: string, data: Partial<Task>): Promise<{ task: Task }> {
  const response = await fetch('/api/tasks', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) throw new Error('Failed to update task')
  return response.json()
}

async function deleteTask(id: string): Promise<void> {
  const response = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete task')
}

// Events
async function fetchEvents(params?: { start?: string; end?: string; matterId?: string }): Promise<{ events: Event[] }> {
  const searchParams = new URLSearchParams()
  if (params?.start) searchParams.set('start', params.start)
  if (params?.end) searchParams.set('end', params.end)
  if (params?.matterId) searchParams.set('matterId', params.matterId)
  
  const response = await fetch(`/api/events${searchParams.toString() ? '?' + searchParams : ''}`)
  if (!response.ok) throw new Error('Failed to fetch events')
  return response.json()
}

async function fetchEvent(id: string): Promise<{ event: Event }> {
  const response = await fetch(`/api/events?id=${id}`)
  if (!response.ok) throw new Error('Failed to fetch event')
  return response.json()
}

async function createEvent(data: Partial<Event>): Promise<{ event: Event }> {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create event')
  return response.json()
}

async function updateEvent(id: string, data: Partial<Event>): Promise<{ event: Event }> {
  const response = await fetch('/api/events', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) throw new Error('Failed to update event')
  return response.json()
}

async function deleteEvent(id: string): Promise<void> {
  const response = await fetch(`/api/events?id=${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete event')
}

// Messages
async function fetchMessageThreads(): Promise<{ threads: MessageThread[] }> {
  const response = await fetch('/api/messages')
  if (!response.ok) throw new Error('Failed to fetch messages')
  return response.json()
}

async function fetchMessageThread(id: string): Promise<{ thread: MessageThread }> {
  const response = await fetch(`/api/messages?threadId=${id}`)
  if (!response.ok) throw new Error('Failed to fetch message thread')
  return response.json()
}

async function createMessage(data: { threadId: string; content: string }): Promise<{ message: Message }> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to send message')
  return response.json()
}

async function createMessageThread(data: { subject: string; participantIds: string[]; matterId?: string }): Promise<{ thread: MessageThread }> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, createThread: true }),
  })
  if (!response.ok) throw new Error('Failed to create message thread')
  return response.json()
}

// Billing
async function fetchInvoices(params?: { status?: string; clientId?: string }): Promise<{ invoices: Invoice[] }> {
  const searchParams = new URLSearchParams()
  if (params?.status) searchParams.set('status', params.status)
  if (params?.clientId) searchParams.set('clientId', params.clientId)
  
  const response = await fetch(`/api/billing${searchParams.toString() ? '?' + searchParams : ''}`)
  if (!response.ok) throw new Error('Failed to fetch invoices')
  return response.json()
}

async function fetchInvoice(id: string): Promise<{ invoice: Invoice }> {
  const response = await fetch(`/api/billing?id=${id}`)
  if (!response.ok) throw new Error('Failed to fetch invoice')
  return response.json()
}

async function createInvoice(data: Partial<Invoice>): Promise<{ invoice: Invoice }> {
  const response = await fetch('/api/billing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create invoice')
  return response.json()
}

async function updateInvoice(id: string, data: Partial<Invoice>): Promise<{ invoice: Invoice }> {
  const response = await fetch('/api/billing', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) throw new Error('Failed to update invoice')
  return response.json()
}

async function deleteInvoice(id: string): Promise<void> {
  const response = await fetch(`/api/billing?id=${id}`, { method: 'DELETE' })
  if (!response.ok) throw new Error('Failed to delete invoice')
}

async function createInvoiceFromTimeEntries(data: { clientId: string; matterId: string; timeEntryIds: string[]; dueDate: string }): Promise<{ invoice: Invoice }> {
  const response = await fetch('/api/billing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, generateFromTimeEntries: true }),
  })
  if (!response.ok) throw new Error('Failed to generate invoice')
  return response.json()
}

async function recordPayment(data: { invoiceId: string; amount: number; paymentMethod: string; reference?: string }): Promise<{ invoice: Invoice }> {
  const response = await fetch('/api/billing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, recordPayment: true }),
  })
  if (!response.ok) throw new Error('Failed to record payment')
  return response.json()
}

// Time Entries
async function fetchTimeEntries(params?: { matterId?: string; userId?: string; isBilled?: boolean }): Promise<{ timeEntries: TimeEntry[] }> {
  const searchParams = new URLSearchParams()
  if (params?.matterId) searchParams.set('matterId', params.matterId)
  if (params?.userId) searchParams.set('userId', params.userId)
  if (params?.isBilled !== undefined) searchParams.set('isBilled', String(params.isBilled))
  
  const response = await fetch(`/api/billing/time-entries${searchParams.toString() ? '?' + searchParams : ''}`)
  if (!response.ok) throw new Error('Failed to fetch time entries')
  return response.json()
}

async function createTimeEntry(data: Partial<TimeEntry>): Promise<{ timeEntry: TimeEntry }> {
  const response = await fetch('/api/billing/time-entries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error('Failed to create time entry')
  return response.json()
}

async function updateTimeEntry(id: string, data: Partial<TimeEntry>): Promise<{ timeEntry: TimeEntry }> {
  const response = await fetch('/api/billing/time-entries', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  if (!response.ok) throw new Error('Failed to update time entry')
  return response.json()
}

// Search
export interface SearchResult {
  type: 'matter' | 'client' | 'task' | 'document' | 'event' | 'invoice' | 'user'
  id: string
  title: string
  description: string
  url: string
}

async function searchAll(query: string): Promise<{ results: SearchResult[] }> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  if (!response.ok) throw new Error('Failed to search')
  return response.json()
}

// ============================================
// React Query Hooks
// ============================================

// Dashboard Hooks
export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30000,
  })
}

// User Hooks
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => fetchUser(id),
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => updateUser(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
      toast.success('User updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('User deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Client Hooks
export function useClients(params?: { type?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => fetchClients(params),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => fetchClient(id),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) => updateClient(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      queryClient.invalidateQueries({ queryKey: ['clients', variables.id] })
      toast.success('Client updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Matter Hooks
export function useMatters(params?: { status?: string; practiceArea?: string; clientId?: string; search?: string }) {
  return useQuery({
    queryKey: ['matters', params],
    queryFn: () => fetchMatters(params),
  })
}

export function useMatter(id: string) {
  return useQuery({
    queryKey: ['matters', id],
    queryFn: () => fetchMatter(id),
    enabled: !!id,
  })
}

export function useCreateMatter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMatter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matters'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Matter created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateMatter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Matter> }) => updateMatter(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['matters'] })
      queryClient.invalidateQueries({ queryKey: ['matters', variables.id] })
      toast.success('Matter updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteMatter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteMatter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['matters'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Matter deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Task Hooks
export function useTasks(params?: { status?: string; assigneeId?: string; matterId?: string }) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => fetchTasks(params),
  })
}

export function useTask(id: string) {
  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => fetchTask(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Task created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) => updateTask(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.id] })
      toast.success('Task updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Task deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Event Hooks
export function useEvents(params?: { start?: string; end?: string; matterId?: string }) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: () => fetchEvent(id),
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Event created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) => updateEvent(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
      toast.success('Event updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Event deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Message Hooks
export function useMessageThreads() {
  return useQuery({
    queryKey: ['messages', 'threads'],
    queryFn: fetchMessageThreads,
    refetchInterval: 10000,
  })
}

export function useMessageThread(id: string) {
  return useQuery({
    queryKey: ['messages', 'thread', id],
    queryFn: () => fetchMessageThread(id),
    enabled: !!id,
    refetchInterval: 5000,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMessage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      queryClient.invalidateQueries({queryKey: ['messages', 'thread', data.message.threadId] })
      toast.success('Message sent')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useCreateMessageThread() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMessageThread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] })
      toast.success('Conversation started')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Invoice Hooks
export function useInvoices(params?: { status?: string; clientId?: string }) {
  return useQuery({
    queryKey: ['invoices', params],
    queryFn: () => fetchInvoices(params),
  })
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: ['invoices', id],
    queryFn: () => fetchInvoice(id),
    enabled: !!id,
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Invoice created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Invoice> }) => updateInvoice(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Invoice updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Invoice deleted successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useGenerateInvoice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createInvoiceFromTimeEntries,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Invoice generated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useRecordPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: recordPayment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.invalidateQueries({ queryKey: ['invoices', data.invoice.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Payment recorded successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Time Entry Hooks
export function useTimeEntries(params?: { matterId?: string; userId?: string; isBilled?: boolean }) {
  return useQuery({
    queryKey: ['time-entries', params],
    queryFn: () => fetchTimeEntries(params),
  })
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createTimeEntry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Time entry added successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TimeEntry> }) => updateTimeEntry(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
      toast.success('Time entry updated successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

// Search Hook
export function useSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchAll(query),
    enabled: query.length >= 2,
    staleTime: 5000,
  })
}

// Dashboard Stats Hook
export interface DashboardStats {
  activeMatters: number
  pendingTasks: number
  unbilledHours: number
  unbilledAmount: number
  overdueInvoices: number
  overdueAmount: number
  revenue: number
  clientsCount: number
}

async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard/stats')
  if (!res.ok) throw new Error('Failed to fetch dashboard stats')
  const data = await res.json()
  return data.data
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 30000, // 30 seconds
  })
}
