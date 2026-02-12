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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Search,
  Plus,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Star,
  Calendar,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for clients
const mockClients = [
  {
    id: '1',
    name: 'Smith Holdings LLC',
    type: 'business',
    email: 'contact@smithholdings.com',
    phone: '+1 (555) 123-4567',
    address: '123 Business Ave, New York, NY 10001',
    industry: 'Real Estate',
    source: 'Referral',
    status: 'active',
    openMatters: 3,
    totalBilled: 125000,
    outstanding: 15000,
    createdAt: '2023-06-15',
    contacts: [
      { id: '1', name: 'James Smith', title: 'CEO', email: 'james@smithholdings.com', phone: '+1 (555) 111-2222', isPrimary: true },
    ],
  },
  {
    id: '2',
    name: 'TechStart Inc.',
    type: 'business',
    email: 'legal@techstart.io',
    phone: '+1 (555) 234-5678',
    address: '456 Tech Blvd, San Francisco, CA 94102',
    industry: 'Technology',
    source: 'Website',
    status: 'active',
    openMatters: 2,
    totalBilled: 89000,
    outstanding: 0,
    createdAt: '2023-08-20',
    contacts: [
      { id: '1', name: 'Sarah Lee', title: 'General Counsel', email: 'sarah@techstart.io', phone: '+1 (555) 222-3333', isPrimary: true },
    ],
  },
  {
    id: '3',
    name: 'Williams Family',
    type: 'individual',
    email: 'r.williams@email.com',
    phone: '+1 (555) 345-6789',
    address: '789 Oak Street, Boston, MA 02101',
    industry: null,
    source: 'Referral',
    status: 'active',
    openMatters: 1,
    totalBilled: 28000,
    outstanding: 5000,
    createdAt: '2024-01-10',
    contacts: [
      { id: '1', name: 'Robert Williams', title: null, email: 'r.williams@email.com', phone: '+1 (555) 333-4444', isPrimary: true },
    ],
  },
  {
    id: '4',
    name: 'GreenTech Solutions',
    type: 'business',
    email: 'info@greentech.com',
    phone: '+1 (555) 456-7890',
    address: '321 Green Way, Austin, TX 78701',
    industry: 'Clean Energy',
    source: 'Conference',
    status: 'active',
    openMatters: 1,
    totalBilled: 45000,
    outstanding: 0,
    createdAt: '2024-02-28',
    contacts: [
      { id: '1', name: 'Mike Johnson', title: 'CTO', email: 'mike@greentech.com', phone: '+1 (555) 444-5555', isPrimary: true },
    ],
  },
  {
    id: '5',
    name: 'Downtown Properties LLC',
    type: 'business',
    email: 'legal@downtownprops.com',
    phone: '+1 (555) 567-8901',
    address: '555 Main Street, Chicago, IL 60601',
    industry: 'Real Estate',
    source: 'Referral',
    status: 'inactive',
    openMatters: 0,
    totalBilled: 67000,
    outstanding: 0,
    createdAt: '2023-03-01',
    contacts: [
      { id: '1', name: 'Lisa Chen', title: 'Legal Director', email: 'lisa@downtownprops.com', phone: '+1 (555) 555-6666', isPrimary: true },
    ],
  },
]

const typeColors: Record<string, string> = {
  'individual': 'bg-slate-100 text-slate-700',
  'business': 'bg-emerald-100 text-emerald-700',
  'government': 'bg-amber-100 text-amber-700',
}

const statusColors: Record<string, string> = {
  'active': 'bg-emerald-100 text-emerald-700',
  'inactive': 'bg-slate-100 text-slate-600',
  'prospect': 'bg-amber-100 text-amber-700',
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

export function ClientsPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<typeof mockClients[0] | null>(null)

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === 'all' || client.type === selectedType
    const matchesStatus = selectedStatus === 'all' || client.status === selectedStatus
    return matchesSearch && matchesType && matchesStatus
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-slate-200 dark:border-slate-700"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-[140px] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="individual">Individual</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="government">Government</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px] border-slate-200 dark:border-slate-700">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-2 h-4 w-4" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Create a new client record
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Client Name</Label>
                <Input id="name" placeholder="Enter client name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Client Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="government">Government</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="client@email.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" placeholder="Full address" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" placeholder="e.g., Technology" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="referral">Referral</SelectItem>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="conference">Conference</SelectItem>
                    <SelectItem value="advertisement">Advertisement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" placeholder="Additional notes" rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsCreateOpen(false)}>
                Add Client
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Clients Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence>
          {filteredClients.map((client) => (
            <motion.div
              key={client.id}
              variants={item}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card 
                className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => setSelectedClient(client)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 bg-emerald-100 dark:bg-emerald-900">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                          {client.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-base">{client.name}</CardTitle>
                        <CardDescription className="text-xs">{client.industry || 'Individual Client'}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Briefcase className="mr-2 h-4 w-4" /> New Matter
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={typeColors[client.type]}>
                      {client.type}
                    </Badge>
                    <Badge variant="secondary" className={statusColors[client.status]}>
                      {client.status}
                    </Badge>
                    {client.outstanding > 0 && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                        Outstanding
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <Phone className="h-4 w-4" />
                    <span>{client.phone}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500">Open Matters</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{client.openMatters}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Total Billed</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(client.totalBilled)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Client Detail Dialog */}
      <Dialog open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <DialogContent className="max-w-3xl">
          {selectedClient && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900">
                    <AvatarFallback className="text-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                      {selectedClient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <DialogTitle className="text-xl">{selectedClient.name}</DialogTitle>
                    <DialogDescription className="mt-1">
                      {selectedClient.industry || 'Individual Client'} • Client since {new Date(selectedClient.createdAt).toLocaleDateString()}
                    </DialogDescription>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className={typeColors[selectedClient.type]}>
                        {selectedClient.type}
                      </Badge>
                      <Badge variant="secondary" className={statusColors[selectedClient.status]}>
                        {selectedClient.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="matters">Matters</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="contacts">Contacts</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="mt-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Email:</span>
                        <span className="font-medium">{selectedClient.email}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Phone:</span>
                        <span className="font-medium">{selectedClient.phone}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Address:</span>
                        <span className="font-medium">{selectedClient.address}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Briefcase className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Open Matters:</span>
                        <span className="font-medium">{selectedClient.openMatters}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <DollarSign className="h-4 w-4 text-slate-400" />
                        <span className="text-slate-500">Total Billed:</span>
                        <span className="font-medium">{formatCurrency(selectedClient.totalBilled)}</span>
                      </div>
                      {selectedClient.outstanding > 0 && (
                        <div className="flex items-center gap-3 text-sm">
                          <DollarSign className="h-4 w-4 text-amber-500" />
                          <span className="text-slate-500">Outstanding:</span>
                          <span className="font-medium text-amber-600">{formatCurrency(selectedClient.outstanding)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="matters" className="mt-4">
                  <div className="text-center py-8 text-slate-500">
                    <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Matters list would appear here</p>
                  </div>
                </TabsContent>
                <TabsContent value="billing" className="mt-4">
                  <div className="text-center py-8 text-slate-500">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Billing history would appear here</p>
                  </div>
                </TabsContent>
                <TabsContent value="contacts" className="mt-4">
                  <div className="space-y-3">
                    {selectedClient.contacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{contact.name}</p>
                              {contact.isPrimary && (
                                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                              )}
                            </div>
                            <p className="text-sm text-slate-500">{contact.title}</p>
                          </div>
                        </div>
                        <div className="text-right text-sm">
                          <p>{contact.email}</p>
                          <p className="text-slate-500">{contact.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedClient(null)}>Close</Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  View Full Profile
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
