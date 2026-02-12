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
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  FileText,
  Search,
  Plus,
  Upload,
  FolderOpen,
  File,
  FileImage,
  FileSpreadsheet,
  FileArchive,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Share2,
  Grid,
  List,
  Clock,
  User,
  Building2,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock folders
const mockFolders = [
  { id: '1', name: 'Litigation', count: 45, color: 'bg-amber-500' },
  { id: '2', name: 'Corporate', count: 32, color: 'bg-emerald-500' },
  { id: '3', name: 'Real Estate', count: 18, color: 'bg-slate-500' },
  { id: '4', name: 'Estate Planning', count: 12, color: 'bg-orange-500' },
  { id: '5', name: 'IP & Patents', count: 8, color: 'bg-purple-500' },
  { id: '6', name: 'Templates', count: 24, color: 'bg-slate-400' },
]

// Mock documents
const mockDocuments = [
  {
    id: '1',
    name: 'Complaint_Smith_v_Johnson.pdf',
    type: 'pdf',
    matter: 'Smith v. Johnson Corp',
    client: 'Smith Holdings LLC',
    category: 'Pleading',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-11-28',
    size: '2.4 MB',
    confidential: true,
  },
  {
    id: '2',
    name: 'Merger_Agreement_Draft_v3.docx',
    type: 'doc',
    matter: 'Merger Agreement',
    client: 'TechStart Inc.',
    category: 'Contract',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2024-11-27',
    size: '856 KB',
    confidential: true,
  },
  {
    id: '3',
    name: 'Trust_Document_Williams.pdf',
    type: 'pdf',
    matter: 'Estate Planning',
    client: 'Williams Family',
    category: 'Agreement',
    uploadedBy: 'Michael Chen',
    uploadedAt: '2024-11-26',
    size: '1.2 MB',
    confidential: true,
  },
  {
    id: '4',
    name: 'Patent_Application_GreenTech.pdf',
    type: 'pdf',
    matter: 'Patent Application',
    client: 'GreenTech Solutions',
    category: 'Filing',
    uploadedBy: 'Emily Davis',
    uploadedAt: '2024-11-25',
    size: '3.8 MB',
    confidential: true,
  },
  {
    id: '5',
    name: 'Financial_Statements_Q3.xlsx',
    type: 'spreadsheet',
    matter: 'Smith v. Johnson Corp',
    client: 'Smith Holdings LLC',
    category: 'Financial',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-11-24',
    size: '445 KB',
    confidential: false,
  },
  {
    id: '6',
    name: 'Evidence_Photos.zip',
    type: 'archive',
    matter: 'Smith v. Johnson Corp',
    client: 'Smith Holdings LLC',
    category: 'Evidence',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '2024-11-23',
    size: '15.6 MB',
    confidential: true,
  },
  {
    id: '7',
    name: 'Settlement_Agreement_Template.docx',
    type: 'doc',
    matter: null,
    client: null,
    category: 'Template',
    uploadedBy: 'John Doe',
    uploadedAt: '2024-11-20',
    size: '234 KB',
    confidential: false,
  },
]

const fileTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'pdf': FileText,
  'doc': FileText,
  'spreadsheet': FileSpreadsheet,
  'image': FileImage,
  'archive': FileArchive,
  'default': File,
}

const fileTypeColors: Record<string, string> = {
  'pdf': 'text-red-500',
  'doc': 'text-blue-500',
  'spreadsheet': 'text-emerald-500',
  'image': 'text-purple-500',
  'archive': 'text-amber-500',
  'default': 'text-slate-500',
}

const categoryColors: Record<string, string> = {
  'Pleading': 'bg-amber-100 text-amber-700',
  'Contract': 'bg-emerald-100 text-emerald-700',
  'Agreement': 'bg-slate-100 text-slate-700',
  'Filing': 'bg-emerald-100 text-emerald-700',
  'Financial': 'bg-emerald-100 text-emerald-700',
  'Evidence': 'bg-purple-100 text-purple-700',
  'Template': 'bg-slate-100 text-slate-500',
  'Correspondence': 'bg-slate-100 text-slate-600',
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.03 }
  }
}

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
}

export function DocumentsPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const filteredDocuments = mockDocuments.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.matter?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.client?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const getFileIcon = (type: string) => fileTypeIcons[type] || fileTypeIcons.default
  const getFileColor = (type: string) => fileTypeColors[type] || fileTypeColors.default

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Documents</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">139</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-100 dark:bg-amber-900">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Recent Uploads</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">12</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900">
              <FileText className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Confidential</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">87</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6">
        {/* Folders Sidebar */}
        <div className="w-56 shrink-0 space-y-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Folders</h3>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="space-y-1">
            <Button
              variant={selectedFolder === null ? 'secondary' : 'ghost'}
              className={`w-full justify-start ${selectedFolder === null ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
              onClick={() => setSelectedFolder(null)}
            >
              <FolderOpen className="mr-2 h-4 w-4 text-slate-400" />
              All Documents
              <Badge variant="secondary" className="ml-auto text-xs">{mockDocuments.length}</Badge>
            </Button>
            {mockFolders.map((folder) => (
              <Button
                key={folder.id}
                variant={selectedFolder === folder.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${selectedFolder === folder.id ? 'bg-slate-100 dark:bg-slate-800' : ''}`}
                onClick={() => setSelectedFolder(folder.id)}
              >
                <FolderOpen className="mr-2 h-4 w-4 text-slate-400" />
                {folder.name}
                <Badge variant="secondary" className="ml-auto text-xs">{folder.count}</Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-4">
          {/* Actions Bar */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search documents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-200 dark:border-slate-700"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[140px] border-slate-200 dark:border-slate-700">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="pleading">Pleadings</SelectItem>
                <SelectItem value="contract">Contracts</SelectItem>
                <SelectItem value="evidence">Evidence</SelectItem>
                <SelectItem value="financial">Financial</SelectItem>
                <SelectItem value="template">Templates</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="icon"
                className="h-9 w-9 rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a new document to the system
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-8 text-center">
                    <Upload className="h-10 w-10 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm text-slate-500 mb-2">Drag and drop files here, or click to browse</p>
                    <p className="text-xs text-slate-400">Supports PDF, DOC, DOCX, XLS, XLSX up to 50MB</p>
                    <Input type="file" className="hidden" id="file-upload" />
                    <Button variant="outline" className="mt-4" asChild>
                      <label htmlFor="file-upload" className="cursor-pointer">Choose Files</label>
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Document Category</label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pleading">Pleading</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="evidence">Evidence</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="correspondence">Correspondence</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="confidential" className="rounded" />
                    <label htmlFor="confidential" className="text-sm">Mark as confidential</label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUploadOpen(false)}>Cancel</Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsUploadOpen(false)}>
                    Upload
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Documents Grid/List */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}
          >
            <AnimatePresence>
              {filteredDocuments.map((doc) => {
                const Icon = getFileIcon(doc.type)
                const iconColor = getFileColor(doc.type)
                
                if (viewMode === 'list') {
                  return (
                    <motion.div
                      key={doc.id}
                      variants={item}
                      initial="hidden"
                      animate="show"
                      className="flex items-center gap-4 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer group"
                    >
                      <Icon className={`h-8 w-8 ${iconColor}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{doc.name}</p>
                          {doc.confidential && (
                            <Badge variant="secondary" className="text-xs bg-red-100 text-red-700">Confidential</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 truncate">{doc.matter || 'No matter'}</p>
                      </div>
                      <Badge variant="secondary" className={categoryColors[doc.category]}>
                        {doc.category}
                      </Badge>
                      <span className="text-sm text-slate-500">{doc.size}</span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                          <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                          <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  )
                }

                return (
                  <motion.div
                    key={doc.id}
                    variants={item}
                    initial="hidden"
                    animate="show"
                  >
                    <Card className="border-slate-200 dark:border-slate-800 hover:shadow-md transition-all cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Icon className={`h-10 w-10 ${iconColor}`} />
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem><Eye className="mr-2 h-4 w-4" /> Preview</DropdownMenuItem>
                              <DropdownMenuItem><Download className="mr-2 h-4 w-4" /> Download</DropdownMenuItem>
                              <DropdownMenuItem><Share2 className="mr-2 h-4 w-4" /> Share</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate flex-1">{doc.name}</p>
                            {doc.confidential && (
                              <Badge variant="secondary" className="text-xs shrink-0 bg-red-100 text-red-700">C</Badge>
                            )}
                          </div>
                          <Badge variant="secondary" className={categoryColors[doc.category]}>
                            {doc.category}
                          </Badge>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>{doc.size}</span>
                            <span>•</span>
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
