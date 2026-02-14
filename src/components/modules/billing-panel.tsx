"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CreditCard,
  Plus,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  Send,
  MoreHorizontal,
  Eye,
  Download,
  Printer,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  History,
  User,
  Briefcase,
  Timer,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserAvatar, ATTORNEY_PROFILES } from "@/components/ui/user-avatar"

// Import Invoice Ninja calculation utilities from package
import { 
  calculateInvoiceTotals, 
  calculateDueDate, 
  calculateLateFee,
  formatCurrency as formatInvoiceCurrency,
  generateInvoiceNumber as generateInvNumber,
  InvoiceBuilder
} from "@legalflow/invoice-ninja-core"


// Attorney emails for time entries
const attorneyEmails = Object.keys(ATTORNEY_PROFILES)

// Mock data for invoices
const initialInvoices = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    client: { id: '1', name: 'Smith Holdings LLC' },
    matter: 'Smith v. Johnson Corp',
    status: 'paid',
    issueDate: '2024-11-01',
    dueDate: '2024-11-30',
    totalAmount: 12500,
    paidAmount: 12500,
    items: [
      { description: 'Legal Research - 15 hours', quantity: 15, rate: 350, amount: 5250 },
      { description: 'Document Review - 10 hours', quantity: 10, rate: 300, amount: 3000 },
      { description: 'Court Filing Fees', quantity: 1, rate: 4250, amount: 4250 },
    ],
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    client: { id: '2', name: 'TechStart Inc.' },
    matter: 'Merger Agreement',
    status: 'sent',
    issueDate: '2024-11-15',
    dueDate: '2024-12-15',
    totalAmount: 18500,
    paidAmount: 0,
    items: [
      { description: 'Contract Drafting - 25 hours', quantity: 25, rate: 400, amount: 10000 },
      { description: 'Negotiations - 20 hours', quantity: 20, rate: 350, amount: 7000 },
      { description: 'Due Diligence Review', quantity: 1, rate: 1500, amount: 1500 },
    ],
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    client: { id: '3', name: 'Williams Family' },
    matter: 'Estate Planning',
    status: 'overdue',
    issueDate: '2024-10-01',
    dueDate: '2024-10-31',
    totalAmount: 8500,
    paidAmount: 3500,
    items: [
      { description: 'Trust Document Preparation', quantity: 1, rate: 5000, amount: 5000 },
      { description: 'Client Consultations - 10 hours', quantity: 10, rate: 350, amount: 3500 },
    ],
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    client: { id: '4', name: 'GreenTech Solutions' },
    matter: 'Patent Application',
    status: 'draft',
    issueDate: null,
    dueDate: null,
    totalAmount: 12000,
    paidAmount: 0,
    items: [
      { description: 'Patent Search & Analysis', quantity: 1, rate: 4000, amount: 4000 },
      { description: 'Application Preparation - 20 hours', quantity: 20, rate: 400, amount: 8000 },
    ],
  },
]

// Initial trust accounts with transactions
const initialTrustAccounts = [
  {
    id: '1',
    client: 'Smith Holdings LLC',
    accountName: 'Smith Holdings Retainer',
    balance: 50000,
    lastTransaction: '2024-11-28',
    status: 'active',
    transactions: [
      { id: 't1', date: '2024-11-28', type: 'deposit', amount: 25000, description: 'Initial retainer', balance: 50000 },
      { id: 't2', date: '2024-11-15', type: 'withdrawal', amount: 5000, description: 'Invoice INV-2024-001 payment', balance: 25000 },
    ],
  },
  {
    id: '2',
    client: 'TechStart Inc.',
    accountName: 'TechStart Legal Fund',
    balance: 25000,
    lastTransaction: '2024-11-25',
    status: 'active',
    transactions: [
      { id: 't3', date: '2024-11-25', type: 'deposit', amount: 25000, description: 'Merger retainer', balance: 25000 },
    ],
  },
  {
    id: '3',
    client: 'Williams Family',
    accountName: 'Williams Trust Fund',
    balance: 8000,
    lastTransaction: '2024-11-20',
    status: 'active',
    transactions: [
      { id: 't4', date: '2024-11-20', type: 'deposit', amount: 10000, description: 'Estate planning retainer', balance: 8000 },
      { id: 't5', date: '2024-11-10', type: 'withdrawal', amount: 2000, description: 'Partial invoice payment', balance: 10000 },
    ],
  },
]

// Initial time entries
const initialTimeEntries = [
  { id: '1', userEmail: 'john.doe@lawfirm.com', matter: 'Smith v. Johnson Corp', date: '2024-11-28', hours: 4.5, rate: 550, description: 'Legal research and document review', amount: 2475, billed: false },
  { id: '2', userEmail: 'sarah.johnson@lawfirm.com', matter: 'Merger Agreement', date: '2024-11-28', hours: 6, rate: 425, description: 'Contract drafting and negotiations', amount: 2550, billed: false },
  { id: '3', userEmail: 'michael.chen@lawfirm.com', matter: 'Estate Planning', date: '2024-11-27', hours: 3, rate: 175, description: 'Document preparation', amount: 525, billed: false },
  { id: '4', userEmail: 'emily.williams@lawfirm.com', matter: 'Patent Application', date: '2024-11-27', hours: 5, rate: 350, description: 'Patent research', amount: 1750, billed: true },
]

const statusColors: Record<string, string> = {
  'draft': 'bg-slate-100 text-slate-700',
  'sent': 'bg-blue-100 text-blue-700',
  'paid': 'bg-emerald-100 text-emerald-700',
  'partial': 'bg-amber-100 text-amber-700',
  'overdue': 'bg-red-100 text-red-700',
  'void': 'bg-slate-100 text-slate-500',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

export function BillingPanel() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [invoices, setInvoices] = useState(initialInvoices)
  const [timeEntries, setTimeEntries] = useState(initialTimeEntries)
  const [trustAccounts, setTrustAccounts] = useState(initialTrustAccounts)
  
  // Dialog states
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false)
  const [isNewTrustOpen, setIsNewTrustOpen] = useState(false)
  const [selectedTrustAccount, setSelectedTrustAccount] = useState<string | null>(null)
  const [isDepositOpen, setIsDepositOpen] = useState(false)
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false)
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false)
  
  // Form states
  const [newTimeEntry, setNewTimeEntry] = useState({
    userEmail: '',
    matter: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    rate: '',
    description: ''
  })
  
  const [newTransaction, setNewTransaction] = useState({
    amount: '',
    description: ''
  })
  
  const [newTrustAccount, setNewTrustAccount] = useState({
    client: '',
    accountName: '',
    initialDeposit: ''
  })

  const filteredInvoices = invoices.filter(inv => 
    selectedStatus === 'all' || inv.status === selectedStatus
  )

  const totalUnbilled = timeEntries.filter(t => !t.billed).reduce((sum, t) => sum + t.amount, 0)
  const totalOutstanding = invoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)
  const totalTrustBalance = trustAccounts.reduce((sum, acc) => sum + acc.balance, 0)

  // Handlers
  const handleLogTime = () => {
    if (newTimeEntry.userEmail && newTimeEntry.matter && newTimeEntry.hours && newTimeEntry.rate) {
      const hours = parseFloat(newTimeEntry.hours)
      const rate = parseFloat(newTimeEntry.rate)
      const profile = ATTORNEY_PROFILES[newTimeEntry.userEmail]
      
      const entry = {
        id: String(timeEntries.length + 1),
        userEmail: newTimeEntry.userEmail,
        matter: newTimeEntry.matter,
        date: newTimeEntry.date,
        hours,
        rate,
        description: newTimeEntry.description,
        amount: hours * rate,
        billed: false
      }
      
      setTimeEntries([entry, ...timeEntries])
      setNewTimeEntry({
        userEmail: '',
        matter: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        rate: '',
        description: ''
      })
      setIsLogTimeOpen(false)
    }
  }

  const handleDeposit = () => {
    if (selectedTrustAccount && newTransaction.amount) {
      const amount = parseFloat(newTransaction.amount)
      setTrustAccounts(trustAccounts.map(acc => {
        if (acc.id === selectedTrustAccount) {
          const newBalance = acc.balance + amount
          const transaction = {
            id: `t${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'deposit' as const,
            amount,
            description: newTransaction.description || 'Deposit',
            balance: newBalance
          }
          return {
            ...acc,
            balance: newBalance,
            lastTransaction: new Date().toISOString().split('T')[0],
            transactions: [transaction, ...acc.transactions]
          }
        }
        return acc
      }))
      setNewTransaction({ amount: '', description: '' })
      setIsDepositOpen(false)
    }
  }

  const handleWithdraw = () => {
    if (selectedTrustAccount && newTransaction.amount) {
      const amount = parseFloat(newTransaction.amount)
      setTrustAccounts(trustAccounts.map(acc => {
        if (acc.id === selectedTrustAccount) {
          const newBalance = acc.balance - amount
          const transaction = {
            id: `t${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            type: 'withdrawal' as const,
            amount,
            description: newTransaction.description || 'Withdrawal',
            balance: newBalance
          }
          return {
            ...acc,
            balance: newBalance,
            lastTransaction: new Date().toISOString().split('T')[0],
            transactions: [transaction, ...acc.transactions]
          }
        }
        return acc
      }))
      setNewTransaction({ amount: '', description: '' })
      setIsWithdrawOpen(false)
    }
  }

  const handleCreateTrustAccount = () => {
    if (newTrustAccount.client && newTrustAccount.accountName) {
      const initialDeposit = parseFloat(newTrustAccount.initialDeposit) || 0
      const account = {
        id: String(trustAccounts.length + 1),
        client: newTrustAccount.client,
        accountName: newTrustAccount.accountName,
        balance: initialDeposit,
        lastTransaction: new Date().toISOString().split('T')[0],
        status: 'active',
        transactions: initialDeposit > 0 ? [{
          id: `t${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          type: 'deposit' as const,
          amount: initialDeposit,
          description: 'Initial deposit',
          balance: initialDeposit
        }] : []
      }
      setTrustAccounts([account, ...trustAccounts])
      setNewTrustAccount({ client: '', accountName: '', initialDeposit: '' })
      setIsNewTrustOpen(false)
    }
  }

  const selectedAccount = trustAccounts.find(a => a.id === selectedTrustAccount)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: 'Unbilled Time', 
            value: formatCurrency(totalUnbilled), 
            icon: Clock,
            iconBg: 'bg-slate-100',
            iconColor: 'text-slate-600',
            change: `${timeEntries.filter(t => !t.billed).length} entries`,
          },
          { 
            title: 'Outstanding', 
            value: formatCurrency(totalOutstanding), 
            icon: DollarSign,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            change: `${invoices.filter(i => i.status !== 'paid').length} invoices`,
          },
          { 
            title: 'Overdue', 
            value: formatCurrency(totalOverdue), 
            icon: AlertTriangle,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            change: `${invoices.filter(i => i.status === 'overdue').length} invoice`,
          },
          { 
            title: 'Trust Balance', 
            value: formatCurrency(totalTrustBalance), 
            icon: Building2,
            iconBg: 'bg-teal-100',
            iconColor: 'text-teal-600',
            change: `${trustAccounts.length} accounts`,
          },
        ].map((stat) => (
          <Card key={stat.title} className="border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                  <p className="text-xs text-slate-500">{stat.change}</p>
                </div>
                <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
          <TabsTrigger value="trust-accounts">Trust Accounts</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px] border-slate-200">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Dialog open={isCreateInvoiceOpen} onOpenChange={setIsCreateInvoiceOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>Generate a new invoice for a client</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Smith Holdings LLC</SelectItem>
                        <SelectItem value="2">TechStart Inc.</SelectItem>
                        <SelectItem value="3">Williams Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Matter</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select matter" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Smith v. Johnson Corp</SelectItem>
                        <SelectItem value="2">Merger Agreement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Issue Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>Due Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Invoice notes or terms" rows={3} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateInvoiceOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700" onClick={() => setIsCreateInvoiceOpen(false)}>Create Invoice</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client / Matter</TableHead>
                      <TableHead>Issue Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInvoices.map((invoice) => (
                      <TableRow key={invoice.id} className="group cursor-pointer hover:bg-slate-50">
                        <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.client.name}</p>
                            <p className="text-sm text-slate-500">{invoice.matter}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.totalAmount)}</TableCell>
                        <TableCell className="text-emerald-600">{formatCurrency(invoice.paidAmount)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={statusColors[invoice.status]}>
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> View</DropdownMenuItem>
                              <DropdownMenuItem><Send className="mr-2 h-4 w-4" /> Send</DropdownMenuItem>
                              <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download PDF</DropdownMenuItem>
                              <DropdownMenuItem><Printer className="mr-2 h-4 w-4" /> Print</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600"><FileText className="mr-2 h-4 w-4" /> Void</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Time Entries Tab */}
        <TabsContent value="time-entries" className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              {timeEntries.filter(t => !t.billed).length} unbilled entries • {formatCurrency(totalUnbilled)}
            </Badge>
            <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Timer className="mr-2 h-4 w-4" />
                  Log Time
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Log Time Entry</DialogTitle>
                  <DialogDescription>Record billable time for a matter</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Team Member</Label>
                    <Select value={newTimeEntry.userEmail} onValueChange={(v) => setNewTimeEntry({...newTimeEntry, userEmail: v, rate: ATTORNEY_PROFILES[v]?.hourlyRate?.toString() || ''})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select team member" />
                      </SelectTrigger>
                      <SelectContent>
                        {attorneyEmails.map(email => {
                          const profile = ATTORNEY_PROFILES[email]
                          return (
                            <SelectItem key={email} value={email}>
                              <div className="flex items-center gap-2">
                                <UserAvatar email={email} name={profile.name} size="sm" />
                                <span>{profile.name}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Matter</Label>
                    <Select value={newTimeEntry.matter} onValueChange={(v) => setNewTimeEntry({...newTimeEntry, matter: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Smith v. Johnson Corp">Smith v. Johnson Corp</SelectItem>
                        <SelectItem value="Merger Agreement">Merger Agreement</SelectItem>
                        <SelectItem value="Estate Planning">Estate Planning</SelectItem>
                        <SelectItem value="Patent Application">Patent Application</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" value={newTimeEntry.date} onChange={(e) => setNewTimeEntry({...newTimeEntry, date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hours</Label>
                      <Input type="number" step="0.25" placeholder="0.00" value={newTimeEntry.hours} onChange={(e) => setNewTimeEntry({...newTimeEntry, hours: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Hourly Rate</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type="number" className="pl-10" placeholder="0" value={newTimeEntry.rate} onChange={(e) => setNewTimeEntry({...newTimeEntry, rate: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Describe the work performed..." rows={3} value={newTimeEntry.description} onChange={(e) => setNewTimeEntry({...newTimeEntry, description: e.target.value})} />
                  </div>
                  {newTimeEntry.hours && newTimeEntry.rate && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-500">Total Amount</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatCurrency(parseFloat(newTimeEntry.hours || '0') * parseFloat(newTimeEntry.rate || '0'))}
                      </p>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsLogTimeOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleLogTime}>Save Entry</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-slate-200">
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team Member</TableHead>
                      <TableHead>Matter</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Hours</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {timeEntries.map((entry) => {
                      const profile = ATTORNEY_PROFILES[entry.userEmail]
                      return (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <UserAvatar email={entry.userEmail} name={profile?.name || entry.userEmail} size="sm" />
                              <span>{profile?.name || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{entry.matter}</TableCell>
                          <TableCell>{formatDate(entry.date)}</TableCell>
                          <TableCell>{entry.hours}h</TableCell>
                          <TableCell>{formatCurrency(entry.rate)}/hr</TableCell>
                          <TableCell className="font-medium">{formatCurrency(entry.amount)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={entry.billed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                              {entry.billed ? 'Billed' : 'Unbilled'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trust Accounts Tab */}
        <TabsContent value="trust-accounts" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={isNewTrustOpen} onOpenChange={setIsNewTrustOpen}>
              <DialogTrigger asChild>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Trust Account
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Trust Account</DialogTitle>
                  <DialogDescription>Set up a new client trust account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Client Name</Label>
                    <Input placeholder="Enter client name" value={newTrustAccount.client} onChange={(e) => setNewTrustAccount({...newTrustAccount, client: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input placeholder="e.g., Smith Retainer Fund" value={newTrustAccount.accountName} onChange={(e) => setNewTrustAccount({...newTrustAccount, accountName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Initial Deposit (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input type="number" className="pl-10" placeholder="0.00" value={newTrustAccount.initialDeposit} onChange={(e) => setNewTrustAccount({...newTrustAccount, initialDeposit: e.target.value})} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewTrustOpen(false)}>Cancel</Button>
                  <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleCreateTrustAccount}>Create Account</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trustAccounts.map((account) => (
              <Card key={account.id} className="border-slate-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span>{account.accountName}</span>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                      Active
                    </Badge>
                  </CardTitle>
                  <CardDescription>{account.client}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">Balance</span>
                      <span className="text-xl font-bold text-slate-900">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Last Transaction</span>
                      <span>{formatDate(account.lastTransaction)}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedTrustAccount(account.id)
                          setIsDepositOpen(true)
                        }}
                      >
                        <ArrowDownLeft className="h-3 w-3 mr-1 text-emerald-600" />
                        Deposit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedTrustAccount(account.id)
                          setIsWithdrawOpen(true)
                        }}
                      >
                        <ArrowUpRight className="h-3 w-3 mr-1 text-red-600" />
                        Withdraw
                      </Button>
                    </div>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full"
                      onClick={() => {
                        setSelectedTrustAccount(account.id)
                        setIsTransactionHistoryOpen(true)
                      }}
                    >
                      <History className="h-3 w-3 mr-1" />
                      View History
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Deposit Dialog */}
      <Dialog open={isDepositOpen} onOpenChange={setIsDepositOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit to Trust Account</DialogTitle>
            <DialogDescription>{selectedAccount?.accountName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="number" className="pl-10" placeholder="0.00" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g., Retainer deposit" value={newTransaction.description} onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDepositOpen(false)}>Cancel</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleDeposit}>Deposit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw from Trust Account</DialogTitle>
            <DialogDescription>{selectedAccount?.accountName} • Balance: {selectedAccount && formatCurrency(selectedAccount.balance)}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input type="number" className="pl-10" placeholder="0.00" value={newTransaction.amount} onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="e.g., Invoice payment" value={newTransaction.description} onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleWithdraw}>Withdraw</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Transaction History Dialog */}
      <Dialog open={isTransactionHistoryOpen} onOpenChange={setIsTransactionHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Transaction History</DialogTitle>
            <DialogDescription>{selectedAccount?.accountName}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedAccount?.transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>{formatDate(tx.date)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={tx.type === 'deposit' ? 'text-emerald-600 border-emerald-200' : 'text-red-600 border-red-200'}>
                        {tx.type === 'deposit' ? <ArrowDownLeft className="h-3 w-3 mr-1" /> : <ArrowUpRight className="h-3 w-3 mr-1" />}
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className={`text-right font-medium ${tx.type === 'deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(tx.balance)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
