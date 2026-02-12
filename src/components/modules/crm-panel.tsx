"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Building2,
  Users,
  DollarSign,
  Activity,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Target,
  LayoutGrid,
  List,
  Kanban,
  BarChart3,
  RefreshCw,
  Loader2,
  ExternalLink,
  ChevronRight,
} from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import {
  useCompanies,
  useContacts,
  useDeals,
  useStages,
  useActivities,
  useInitializeCRM,
  createCompany,
  createContact,
  createDeal,
  type CRMCompany,
  type CRMContact,
  type Deal,
  type DealStage,
} from "@/hooks/use-crm"
import { 
  RecordDetailPanel, 
  RecordData, 
  type RecordType 
} from "@/components/crm"

// Helper functions
const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    TARGET: 'bg-gray-100 text-gray-700',
    PROSPECT: 'bg-blue-100 text-blue-700',
    CUSTOMER: 'bg-teal-100 text-teal-700',
    CHURNED: 'bg-red-100 text-red-700',
    PARTNER: 'bg-purple-100 text-purple-700',
    NEW: 'bg-gray-100 text-gray-700',
    CONTACTED: 'bg-blue-100 text-blue-700',
    QUALIFIED: 'bg-amber-100 text-amber-700',
    CONVERTED: 'bg-teal-100 text-teal-700',
    OPEN: 'bg-blue-100 text-blue-700',
    WON: 'bg-teal-100 text-teal-700',
    LOST: 'bg-red-100 text-red-700',
  }
  return colors[status] || 'bg-gray-100 text-gray-700'
}

const formatCurrency = (amount: number | null) => {
  if (!amount) return '-'
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', notation: 'compact' }).format(amount)
}

const formatDate = (date: string | Date | null) => {
  if (!date) return '-'
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date))
}

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.03 } }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

// Sub-components
function StatCard({ title, value, change, changeType, icon: Icon, loading }: {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ElementType
  loading?: boolean
}) {
  if (loading) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-11 w-11 rounded-xl" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
            {change && (
              <p className={cn(
                "text-xs font-medium flex items-center gap-1",
                changeType === 'positive' && "text-teal-600",
                changeType === 'negative' && "text-red-600",
                changeType === 'neutral' && "text-gray-500"
              )}>
                {changeType === 'positive' && <TrendingUp className="h-3 w-3" />}
                {changeType === 'negative' && <TrendingDown className="h-3 w-3" />}
                {change}
              </p>
            )}
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
            <Icon className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Companies View with Detail Panel
function CompaniesView({ 
  companies, 
  loading, 
  onRefresh,
  onSelectRecord
}: { 
  companies: CRMCompany[]
  loading: boolean
  onRefresh: () => void
  onSelectRecord: (record: RecordData) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [createOpen, setCreateOpen] = useState(false)
  const [creating, setCreating] = useState(false)

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || company.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setCreating(true)
    const formData = new FormData(e.currentTarget)
    try {
      await createCompany({
        name: formData.get('name') as string,
        domain: formData.get('domain') as string || null,
        industry: formData.get('industry') as string || null,
        city: formData.get('city') as string || null,
        state: formData.get('state') as string || null,
        status: 'TARGET',
      })
      setCreateOpen(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to create company:', error)
    } finally {
      setCreating(false)
    }
  }

  const handleSelectCompany = (company: CRMCompany) => {
    const record: RecordData = {
      id: company.id,
      type: 'company',
      name: company.name,
      fields: {
        industry: { label: 'Industry', value: company.industry, type: 'text' },
        website: { label: 'Website', value: company.website, type: 'url' },
        phone: { label: 'Phone', value: company.phone, type: 'phone' },
        location: { label: 'Location', value: company.city && company.state ? `${company.city}, ${company.state}` : null, type: 'text' },
        employees: { label: 'Employees', value: company.employeeCount, type: 'number' },
        revenue: { label: 'Annual Revenue', value: company.annualRevenue, type: 'currency' },
        status: { 
          label: 'Status', 
          value: company.status, 
          type: 'select',
          options: [
            { value: 'TARGET', label: 'Target' },
            { value: 'PROSPECT', label: 'Prospect' },
            { value: 'CUSTOMER', label: 'Customer' },
            { value: 'PARTNER', label: 'Partner' },
          ]
        },
      }
    }
    onSelectRecord(record)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg border-gray-200"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px] rounded-lg border-gray-200">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="TARGET">Target</SelectItem>
              <SelectItem value="PROSPECT">Prospect</SelectItem>
              <SelectItem value="CUSTOMER">Customer</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center border border-gray-200 rounded-lg p-1">
            <Button variant={viewMode === 'grid' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('grid')} className="rounded-md">
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'secondary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="rounded-md">
              <List className="h-4 w-4" />
            </Button>
          </div>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-lg bg-teal-600 hover:bg-teal-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Company
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border border-gray-200">
              <DialogHeader>
                <DialogTitle>Add New Company</DialogTitle>
                <DialogDescription>Add a new company to your CRM.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreate}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Company Name *</Label>
                    <Input id="name" name="name" required placeholder="Acme Corporation" className="border-gray-200" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="domain">Domain</Label>
                      <Input id="domain" name="domain" placeholder="acme.com" className="border-gray-200" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="industry">Industry</Label>
                      <Input id="industry" name="industry" placeholder="Technology" className="border-gray-200" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" placeholder="San Francisco" className="border-gray-200" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" placeholder="CA" className="border-gray-200" />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" className="border-gray-200">Cancel</Button>
                  </DialogClose>
                  <Button type="submit" disabled={creating} className="bg-teal-600 hover:bg-teal-700 text-white">
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : filteredCompanies.length === 0 ? (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-medium mb-1 text-gray-900">No companies found</h3>
            <p className="text-sm text-gray-500 mb-4">Get started by adding your first company</p>
            <Button onClick={() => setCreateOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Company
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <motion.div key={company.id} variants={item}>
              <Card 
                className="group border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                onClick={() => handleSelectCompany(company)}
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-700 font-semibold text-lg">
                      {company.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{company.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{company.industry || 'No industry'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <Badge className={getStatusColor(company.status)}>{company.status}</Badge>
                    <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                      {company.tier.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {company._count?.contacts || 0}
                    </span>
                    {company.city && company.state && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {company.city}
                      </span>
                    )}
                  </div>

                  {company.annualRevenue && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-500">Revenue</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(company.annualRevenue)}</p>
                    </div>
                  )}

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              {filteredCompanies.map((company) => (
                <div 
                  key={company.id} 
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectCompany(company)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-700 font-semibold">
                    {company.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{company.name}</p>
                      <Badge className={cn("text-xs", getStatusColor(company.status))}>{company.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{company.industry || 'No industry'}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-gray-500">Revenue</p>
                      <p className="font-medium text-gray-900">{formatCurrency(company.annualRevenue)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500">Contacts</p>
                      <p className="font-medium text-gray-900">{company._count?.contacts || 0}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Contacts View
function ContactsView({ 
  contacts, 
  companies,
  loading,
  onRefresh,
  onSelectRecord
}: { 
  contacts: CRMContact[]
  companies: CRMCompany[]
  loading: boolean
  onRefresh: () => void
  onSelectRecord: (record: RecordData) => void
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = `${contact.firstName} ${contact.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || contact.leadStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleSelectContact = (contact: CRMContact) => {
    const record: RecordData = {
      id: contact.id,
      type: 'contact',
      name: `${contact.firstName} ${contact.lastName}`,
      fields: {
        email: { label: 'Email', value: contact.email, type: 'email' },
        phone: { label: 'Phone', value: contact.phone, type: 'phone' },
        title: { label: 'Title', value: contact.title, type: 'text' },
        company: { label: 'Company', value: contact.company?.name || null, type: 'text', editable: false },
        leadStatus: { 
          label: 'Lead Status', 
          value: contact.leadStatus, 
          type: 'select',
          options: [
            { value: 'NEW', label: 'New' },
            { value: 'CONTACTED', label: 'Contacted' },
            { value: 'QUALIFIED', label: 'Qualified' },
            { value: 'CONVERTED', label: 'Converted' },
          ]
        },
      }
    }
    onSelectRecord(record)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-lg border-gray-200"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] rounded-lg border-gray-200">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONTACTED">Contacted</SelectItem>
            <SelectItem value="QUALIFIED">Qualified</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-0">
            <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-gray-100">
              {filteredContacts.map((contact) => (
                <motion.div
                  key={contact.id}
                  variants={item}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleSelectContact(contact)}
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-teal-100 text-teal-700">
                      {contact.firstName[0]}{contact.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{contact.firstName} {contact.lastName}</p>
                      {contact.isPrimary && <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">Primary</Badge>}
                    </div>
                    <p className="text-sm text-gray-500">{contact.title || 'No title'} at {contact.company?.name || 'Unknown'}</p>
                  </div>
                  <div className="hidden md:flex items-center gap-6 text-sm text-gray-500">
                    {contact.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{contact.email}</span>}
                  </div>
                  <Badge className={getStatusColor(contact.leadStatus)}>{contact.leadStatus}</Badge>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </motion.div>
              ))}
            </motion.div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Pipeline View
function PipelineView({ 
  deals, 
  stages, 
  companies,
  loading,
  onSelectRecord
}: { 
  deals: Deal[]
  stages: DealStage[]
  companies: CRMCompany[]
  loading: boolean
  onSelectRecord: (record: RecordData) => void
}) {
  const openDeals = deals.filter(d => d.status === 'OPEN')
  const dealsByStage = stages.map(stage => ({
    ...stage,
    deals: openDeals.filter(d => d.stageId === stage.id)
  }))

  const totalPipelineValue = openDeals.reduce((sum, deal) => sum + (deal.value || 0), 0)
  const weightedValue = openDeals.reduce((sum, deal) => sum + ((deal.value || 0) * deal.probability / 100), 0)

  const handleSelectDeal = (deal: Deal) => {
    const record: RecordData = {
      id: deal.id,
      type: 'deal',
      name: deal.name,
      fields: {
        value: { label: 'Value', value: deal.value, type: 'currency' },
        company: { label: 'Company', value: deal.company?.name || null, type: 'text', editable: false },
        stage: { label: 'Stage', value: deal.stage.name, type: 'text', editable: false },
        probability: { label: 'Probability', value: `${deal.probability}%`, type: 'text' },
        expectedClose: { label: 'Expected Close', value: deal.expectedCloseDate, type: 'date' },
      }
    }
    onSelectRecord(record)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Pipeline" value={formatCurrency(totalPipelineValue)} change={`${openDeals.length} deals`} changeType="neutral" icon={DollarSign} loading={loading} />
        <StatCard title="Weighted Value" value={formatCurrency(weightedValue)} icon={TrendingUp} loading={loading} />
        <StatCard title="Avg Deal Size" value={formatCurrency(totalPipelineValue / (openDeals.length || 1))} icon={BarChart3} loading={loading} />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {dealsByStage.map((stage) => (
              <div key={stage.id} className="w-[280px] flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
                    <h3 className="font-medium text-sm text-gray-700">{stage.name}</h3>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">{stage.deals.length}</Badge>
                </div>

                <div className="space-y-3">
                  {stage.deals.map((deal) => (
                    <Card 
                      key={deal.id} 
                      className="border border-gray-200 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleSelectDeal(deal)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm text-gray-900 mb-2">{deal.name}</h4>
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(deal.value)}</p>
                        <p className="text-xs text-gray-500 mb-3">Close: {formatDate(deal.expectedCloseDate)}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-gray-100 text-xs font-medium text-gray-600">
                              {deal.company?.name?.charAt(0) || '?'}
                            </div>
                            <span className="text-xs text-gray-500 truncate max-w-[100px]">{deal.company?.name}</span>
                          </div>
                          <Badge variant="outline" className="text-xs border-gray-200">{deal.probability}%</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {stage.deals.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-400">No deals</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Main CRM Panel
export function CRMPanel() {
  const [activeView, setActiveView] = useState<'companies' | 'contacts' | 'pipeline'>('companies')
  const [selectedRecord, setSelectedRecord] = useState<RecordData | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  
  // Initialize CRM
  const { initialized, loading: initLoading } = useInitializeCRM()
  
  // Fetch data
  const { data: companiesData, loading: companiesLoading, refetch: refetchCompanies } = useCompanies()
  const { data: contactsData, loading: contactsLoading, refetch: refetchContacts } = useContacts()
  const { data: dealsData, loading: dealsLoading, refetch: refetchDeals } = useDeals()
  const { data: stagesData, loading: stagesLoading, refetch: refetchStages } = useStages()

  const companies = companiesData?.companies || []
  const contacts = contactsData?.contacts || []
  const deals = dealsData?.deals || []
  const stages = stagesData?.stages || []

  const isLoading = initLoading || companiesLoading || contactsLoading || dealsLoading || stagesLoading

  const handleSelectRecord = (record: RecordData) => {
    setSelectedRecord(record)
    setPanelOpen(true)
  }

  const handleUpdateRecord = async (record: RecordData) => {
    console.log('Updating record:', record)
    // In a real app, this would call the API
    refetchCompanies()
    refetchContacts()
    refetchDeals()
  }

  if (initLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <StatCard key={i} title="" value="" icon={Building2} loading />)}
        </div>
        <Card className="border border-gray-200">
          <CardContent className="py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight flex items-center gap-2 text-gray-900">
              <Target className="h-5 w-5 text-teal-600" />
              CRM
            </h2>
            <p className="text-sm text-gray-500">Manage your customer relationships</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Companies" value={companies.length} change={`${companies.filter(c => c.status === 'CUSTOMER').length} customers`} changeType="positive" icon={Building2} loading={isLoading} />
          <StatCard title="Contacts" value={contacts.length} icon={Users} loading={isLoading} />
          <StatCard title="Open Deals" value={deals.filter(d => d.status === 'OPEN').length} icon={DollarSign} loading={isLoading} />
          <StatCard title="Pipeline Value" value={formatCurrency(deals.filter(d => d.status === 'OPEN').reduce((sum, d) => sum + (d.value || 0), 0))} icon={BarChart3} loading={isLoading} />
        </div>

        {/* View Tabs */}
        <Tabs value={activeView} onValueChange={(v) => setActiveView(v as typeof activeView)} className="space-y-6">
          <TabsList className="bg-gray-100 p-1 h-auto flex-wrap gap-1 rounded-xl border border-gray-200">
            <TabsTrigger value="companies" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
              <Building2 className="mr-2 h-4 w-4" /> Companies
            </TabsTrigger>
            <TabsTrigger value="contacts" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
              <Users className="mr-2 h-4 w-4" /> Contacts
            </TabsTrigger>
            <TabsTrigger value="pipeline" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600">
              <Kanban className="mr-2 h-4 w-4" /> Pipeline
            </TabsTrigger>
          </TabsList>

          <TabsContent value="companies" className="mt-0">
            <CompaniesView 
              companies={companies} 
              loading={companiesLoading} 
              onRefresh={refetchCompanies}
              onSelectRecord={handleSelectRecord}
            />
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <ContactsView 
              contacts={contacts} 
              companies={companies} 
              loading={contactsLoading} 
              onRefresh={refetchContacts}
              onSelectRecord={handleSelectRecord}
            />
          </TabsContent>

          <TabsContent value="pipeline" className="mt-0">
            <PipelineView 
              deals={deals} 
              stages={stages} 
              companies={companies}
              loading={dealsLoading || stagesLoading}
              onSelectRecord={handleSelectRecord}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Record Detail Panel */}
      <RecordDetailPanel
        record={selectedRecord}
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        onUpdate={handleUpdateRecord}
      />
    </>
  )
}
