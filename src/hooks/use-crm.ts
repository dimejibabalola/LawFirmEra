"use client"

import { useState, useEffect, useCallback } from 'react'

// Types matching Prisma schema
export type CRMCompanyStatus = 'TARGET' | 'PROSPECT' | 'CUSTOMER' | 'CHURNED' | 'PARTNER' | 'COMPETITOR'
export type CRMCompanyTier = 'TIER_1' | 'TIER_2' | 'TIER_3'
export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED' | 'NURTURING'
export type DealStatus = 'OPEN' | 'WON' | 'LOST' | 'ON_HOLD'
export type DealType = 'NEW_BUSINESS' | 'RENEWAL' | 'UPSELL' | 'CROSS_SELL' | 'PARTNERSHIP'
export type CRMActivityType = 'CALL' | 'EMAIL' | 'MEETING' | 'TASK' | 'NOTE' | 'DEMO' | 'PROPOSAL' | 'FOLLOW_UP'

export interface CRMCompany {
  id: string
  name: string
  domain: string | null
  website: string | null
  industry: string | null
  employeeCount: number | null
  annualRevenue: number | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string
  phone: string | null
  linkedinUrl: string | null
  twitterHandle: string | null
  description: string | null
  owner: string | null
  status: CRMCompanyStatus
  tier: CRMCompanyTier
  source: string | null
  createdAt: string
  updatedAt: string
  _count?: {
    contacts: number
    deals: number
  }
}

export interface CRMContact {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  mobile: string | null
  title: string | null
  department: string | null
  linkedinUrl: string | null
  twitterHandle: string | null
  isPrimary: boolean
  leadStatus: LeadStatus
  leadSource: string | null
  lastContactAt: string | null
  owner: string | null
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    name: string
    industry: string | null
  }
}

export interface DealStage {
  id: string
  name: string
  color: string
  probability: number
  position: number
  isDefault: boolean
  isClosed: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    deals: number
  }
}

export interface Deal {
  id: string
  companyId: string
  contactId: string | null
  name: string
  description: string | null
  value: number | null
  expectedCloseDate: string | null
  stageId: string
  probability: number
  status: DealStatus
  type: DealType
  source: string | null
  lostReason: string | null
  owner: string | null
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    name: string
    industry: string | null
  }
  contact?: {
    id: string
    firstName: string
    lastName: string
    email: string | null
  }
  stage: DealStage
}

export interface CRMActivity {
  id: string
  companyId: string | null
  contactId: string | null
  dealId: string | null
  type: CRMActivityType
  title: string
  description: string | null
  dueDate: string | null
  completedAt: string | null
  outcome: string | null
  duration: number | null
  owner: string | null
  createdAt: string
  updatedAt: string
  company?: {
    id: string
    name: string
  }
  contact?: {
    id: string
    firstName: string
    lastName: string
  }
  deal?: {
    id: string
    name: string
  }
}

// Generic fetch hook
function useFetch<T>(url: string, params?: Record<string, string>) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const queryStr = params 
        ? '?' + new URLSearchParams(params).toString() 
        : ''
      
      const response = await fetch(`/api/crm/${url}${queryStr}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [url, params])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Companies hook
export function useCompanies(status?: string, search?: string) {
  const params: Record<string, string> = {}
  if (status && status !== 'all') params.status = status
  if (search) params.search = search
  
  return useFetch<{ companies: CRMCompany[] }>('companies', Object.keys(params).length > 0 ? params : undefined)
}

// Contacts hook
export function useContacts(status?: string, search?: string, companyId?: string) {
  const params: Record<string, string> = {}
  if (status && status !== 'all') params.status = status
  if (search) params.search = search
  if (companyId) params.companyId = companyId
  
  return useFetch<{ contacts: CRMContact[] }>('contacts', Object.keys(params).length > 0 ? params : undefined)
}

// Deals hook
export function useDeals(status?: string, stageId?: string, companyId?: string) {
  const params: Record<string, string> = {}
  if (status && status !== 'all') params.status = status
  if (stageId) params.stageId = stageId
  if (companyId) params.companyId = companyId
  
  return useFetch<{ deals: Deal[] }>('deals', Object.keys(params).length > 0 ? params : undefined)
}

// Stages hook
export function useStages() {
  return useFetch<{ stages: DealStage[] }>('stages')
}

// Activities hook
export function useActivities(type?: string, companyId?: string, contactId?: string, dealId?: string) {
  const params: Record<string, string> = {}
  if (type && type !== 'all') params.type = type
  if (companyId) params.companyId = companyId
  if (contactId) params.contactId = contactId
  if (dealId) params.dealId = dealId
  
  return useFetch<{ activities: CRMActivity[] }>('activities', Object.keys(params).length > 0 ? params : undefined)
}

// Initialize CRM hook
export function useInitializeCRM() {
  const [initialized, setInitialized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const response = await fetch('/api/crm/init')
        if (response.ok) {
          setInitialized(true)
        }
      } catch {
        // Ignore errors - might already be initialized
      } finally {
        setLoading(false)
      }
    }
    
    init()
  }, [])

  return { initialized, loading }
}

// Mutations
export async function createCompany(data: Partial<CRMCompany>) {
  const response = await fetch('/api/crm/companies', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) throw new Error('Failed to create company')
  return response.json()
}

export async function createContact(data: Partial<CRMContact>) {
  const response = await fetch('/api/crm/contacts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) throw new Error('Failed to create contact')
  return response.json()
}

export async function createDeal(data: Partial<Deal>) {
  const response = await fetch('/api/crm/deals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) throw new Error('Failed to create deal')
  return response.json()
}

export async function createActivity(data: Partial<CRMActivity>) {
  const response = await fetch('/api/crm/activities', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  
  if (!response.ok) throw new Error('Failed to create activity')
  return response.json()
}

export async function updateActivity(id: string, data: Partial<CRMActivity>) {
  const response = await fetch('/api/crm/activities', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ...data }),
  })
  
  if (!response.ok) throw new Error('Failed to update activity')
  return response.json()
}
