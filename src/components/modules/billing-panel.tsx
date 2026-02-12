"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
  Search,
  Plus,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Send,
  MoreHorizontal,
  Eye,
  Download,
  Printer,
  TrendingUp,
  TrendingDown,
  Building2,
  Calendar,
  ArrowRight,
} from "lucide-react"
import { motion } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for invoices
const mockInvoices = [
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

// Mock trust accounts
const mockTrustAccounts = [
  {
    id: '1',
    client: 'Smith Holdings LLC',
    accountName: 'Smith Holdings Retainer',
    balance: 50000,
    lastTransaction: '2024-11-28',
    status: 'active',
  },
  {
    id: '2',
    client: 'TechStart Inc.',
    accountName: 'TechStart Legal Fund',
    balance: 25000,
    lastTransaction: '2024-11-25',
    status: 'active',
  },
  {
    id: '3',
    client: 'Williams Family',
    accountName: 'Williams Trust Fund',
    balance: 8000,
    lastTransaction: '2024-11-20',
    status: 'active',
  },
]

// Mock time entries
const mockTimeEntries = [
  { id: '1', user: 'John Doe', matter: 'Smith v. Johnson', date: '2024-11-28', hours: 4.5, rate: 400, amount: 1800, billed: false },
  { id: '2', user: 'Sarah Johnson', matter: 'Merger Agreement', date: '2024-11-28', hours: 6, rate: 450, amount: 2700, billed: false },
  { id: '3', user: 'Michael Chen', matter: 'Estate Planning', date: '2024-11-27', hours: 3, rate: 350, amount: 1050, billed: false },
  { id: '4', user: 'Emily Davis', matter: 'Patent Application', date: '2024-11-27', hours: 5, rate: 400, amount: 2000, billed: true },
]

const statusColors: Record<string, string> = {
  'draft': 'bg-slate-100 text-slate-700',
  'sent': 'bg-emerald-100 text-emerald-700',
  'paid': 'bg-emerald-100 text-emerald-700',
  'partial': 'bg-amber-100 text-amber-700',
  'overdue': 'bg-red-100 text-red-700',
  'void': 'bg-slate-100 text-slate-500',
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function BillingPanel() {
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false)
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false)

  const filteredInvoices = mockInvoices.filter(inv => 
    selectedStatus === 'all' || inv.status === selectedStatus
  )

  const totalUnbilled = mockTimeEntries.filter(t => !t.billed).reduce((sum, t) => sum + t.amount, 0)
  const totalOutstanding = mockInvoices.filter(inv => inv.status !== 'paid').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)
  const totalOverdue = mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)
  const totalTrustBalance = mockTrustAccounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { 
            title: 'Unbilled Time', 
            value: formatCurrency(totalUnbilled), 
            icon: Clock,
            iconBg: 'bg-slate-100 dark:bg-slate-800',
            iconColor: 'text-slate-600 dark:text-slate-400',
            change: '12 entries',
          },
          { 
            title: 'Outstanding', 
            value: formatCurrency(totalOutstanding), 
            icon: DollarSign,
            iconBg: 'bg-amber-100 dark:bg-amber-900',
            iconColor: 'text-amber-600 dark:text-amber-400',
            change: '4 invoices',
          },
          { 
            title: 'Overdue', 
            value: formatCurrency(totalOverdue), 
            icon: AlertTriangle,
            iconBg: 'bg-red-100 dark:bg-red-900',
            iconColor: 'text-red-600 dark:text-red-400',
            change: '1 invoice',
          },
          { 
            title: 'Trust Balance', 
            value: formatCurrency(totalTrustBalance), 
            icon: Building2,
            iconBg: 'bg-emerald-100 dark:bg-emerald-900',
            iconColor: 'text-emerald-600 dark:text-emerald-400',
            change: '3 accounts',
          },
        ].map((stat) => (
          <motion.div key={stat.title} variants={item}>
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                      {stat.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <Tabs defaultValue="invoices" className="space-y-6">
        <TabsList className="bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="time-entries">Time Entries</TabsTrigger>
          <TabsTrigger value="trust-accounts">Trust Accounts</TabsTrigger>
        </TabsList>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[160px] border-slate-200 dark:border-slate-700">
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
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="mr-2 h-4 w-4" />
                  New Invoice
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Invoice</DialogTitle>
                  <DialogDescription>
                    Generate a new invoice for a client
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Client</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
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
                      <SelectTrigger>
                        <SelectValue placeholder="Select matter" />
                      </SelectTrigger>
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
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCreateInvoiceOpen(false)}>
                    Create Invoice
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-slate-200 dark:border-slate-800">
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
                      <TableRow key={invoice.id} className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.client.name}</p>
                            <p className="text-sm text-slate-500">{invoice.matter}</p>
                          </div>
                        </TableCell>
                        <TableCell>{invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : '-'}</TableCell>
                        <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}</TableCell>
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
            <div className="flex gap-2">
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {mockTimeEntries.filter(t => !t.billed).length} unbilled entries
              </Badge>
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              Log Time
            </Button>
          </div>

          <Card className="border-slate-200 dark:border-slate-800">
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
                    {mockTimeEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.user}</TableCell>
                        <TableCell>{entry.matter}</TableCell>
                        <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                        <TableCell>{entry.hours}h</TableCell>
                        <TableCell>{formatCurrency(entry.rate)}/hr</TableCell>
                        <TableCell className="font-medium">{formatCurrency(entry.amount)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className={entry.billed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                            {entry.billed ? 'Billed' : 'Unbilled'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trust Accounts Tab */}
        <TabsContent value="trust-accounts" className="space-y-4">
          <div className="flex justify-end">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              New Trust Account
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockTrustAccounts.map((account) => (
              <Card key={account.id} className="border-slate-200 dark:border-slate-800">
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
                      <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(account.balance)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500">Last Transaction</span>
                      <span>{new Date(account.lastTransaction).toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">Deposit</Button>
                      <Button size="sm" variant="outline" className="flex-1">Withdraw</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
