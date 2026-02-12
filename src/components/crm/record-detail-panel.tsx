"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  X,
  Building2,
  User,
  Briefcase,
  Edit,
  ExternalLink,
  MoreHorizontal,
  Phone,
  Mail,
  Globe,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Clock,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Timeline, useTimelineEvents } from "./timeline"
import { Notes, useNotes } from "./notes"

// Types
export type RecordType = 'company' | 'contact' | 'deal'

export interface RecordData {
  id: string
  type: RecordType
  name: string
  fields: Record<string, {
    label: string
    value: string | number | null
    type: 'text' | 'email' | 'phone' | 'url' | 'number' | 'date' | 'currency' | 'select' | 'textarea'
    editable?: boolean
    options?: { value: string; label: string }[]
  }>
}

interface RecordDetailPanelProps {
  record: RecordData | null
  open: boolean
  onClose: () => void
  onUpdate?: (record: RecordData) => Promise<void>
}

// Field Icon
function FieldIcon({ type }: { type: string }) {
  switch (type) {
    case 'email': return <Mail className="h-4 w-4" />
    case 'phone': return <Phone className="h-4 w-4" />
    case 'url': return <Globe className="h-4 w-4" />
    case 'date': return <Calendar className="h-4 w-4" />
    case 'currency': return <DollarSign className="h-4 w-4" />
    default: return null
  }
}

// Record Header Icon
function RecordTypeIcon({ type }: { type: RecordType }) {
  switch (type) {
    case 'company': return <Building2 className="h-5 w-5" />
    case 'contact': return <User className="h-5 w-5" />
    case 'deal': return <Briefcase className="h-5 w-5" />
    default: return <Briefcase className="h-5 w-5" />
  }
}

// Field Value Display
function FieldValue({ 
  field, 
  editing, 
  value, 
  onChange 
}: { 
  field: RecordData['fields'][string]
  editing: boolean
  value: string
  onChange: (value: string) => void
}) {
  if (editing && field.editable !== false) {
    switch (field.type) {
      case 'textarea':
        return (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[80px] border-gray-200"
          />
        )
      case 'select':
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="border-gray-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      default:
        return (
          <Input
            type={field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : 'text'}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-gray-200"
          />
        )
    }
  }

  // Display mode
  let displayValue = field.value?.toString() || '-'
  
  if (field.type === 'currency' && field.value) {
    displayValue = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      notation: 'compact'
    }).format(field.value as number)
  }
  
  if (field.type === 'date' && field.value) {
    displayValue = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(field.value as string))
  }

  if (field.type === 'select' && field.options) {
    const option = field.options.find(o => o.value === field.value)
    displayValue = option?.label || field.value?.toString() || '-'
  }

  if (field.type === 'email' && field.value) {
    return (
      <a 
        href={`mailto:${field.value}`}
        className="text-teal-600 hover:underline"
      >
        {displayValue}
      </a>
    )
  }

  if (field.type === 'phone' && field.value) {
    return (
      <a 
        href={`tel:${field.value}`}
        className="text-teal-600 hover:underline"
      >
        {displayValue}
      </a>
    )
  }

  if (field.type === 'url' && field.value) {
    return (
      <a 
        href={field.value.toString()}
        target="_blank"
        rel="noopener noreferrer"
        className="text-teal-600 hover:underline inline-flex items-center gap-1"
      >
        {displayValue}
        <ExternalLink className="h-3 w-3" />
      </a>
    )
  }

  return <span className="text-gray-700">{displayValue}</span>
}

// Main Panel Component
export function RecordDetailPanel({ 
  record, 
  open, 
  onClose,
  onUpdate 
}: RecordDetailPanelProps) {
  const [editing, setEditing] = useState(false)
  const [editedFields, setEditedFields] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  
  const { events: timelineEvents } = useTimelineEvents()
  const { notes, addNote, editNote, deleteNote } = useNotes()

  // Reset editing state when record changes
  React.useEffect(() => {
    setEditing(false)
    setEditedFields({})
  }, [record?.id])

  const handleFieldChange = (key: string, value: string) => {
    setEditedFields(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!record || !onUpdate) return
    setSaving(true)
    try {
      const updatedFields: RecordData['fields'] = {}
      for (const [key, field] of Object.entries(record.fields)) {
        updatedFields[key] = {
          ...field,
          value: editedFields[key] ?? field.value
        }
      }
      await onUpdate({ ...record, fields: updatedFields })
      setEditing(false)
      setEditedFields({})
    } finally {
      setSaving(false)
    }
  }

  if (!record) return null

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-teal-600">
                  <RecordTypeIcon type={record.type} />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">{record.name}</h2>
                  <p className="text-xs text-gray-500 capitalize">{record.type}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setEditing(false)
                        setEditedFields({})
                      }}
                      className="text-gray-500"
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setEditing(true)}
                    className="border-gray-200 text-gray-600"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-6">
                <Tabs defaultValue="details" className="space-y-4">
                  <TabsList className="bg-gray-100 p-1 w-full">
                    <TabsTrigger 
                      value="details" 
                      className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600"
                    >
                      Details
                    </TabsTrigger>
                    <TabsTrigger 
                      value="activity"
                      className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600"
                    >
                      Activity
                    </TabsTrigger>
                    <TabsTrigger 
                      value="notes"
                      className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-teal-600"
                    >
                      Notes
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="mt-4 space-y-4">
                    {/* Fields */}
                    <div className="space-y-4">
                      {Object.entries(record.fields).map(([key, field]) => (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-xs text-gray-500 font-medium">
                            {field.label}
                          </Label>
                          <div className="flex items-center gap-2">
                            {FieldIcon({ type: field.type })}
                            <div className="flex-1">
                              <FieldValue
                                field={field}
                                editing={editing}
                                value={editedFields[key] ?? field.value?.toString() ?? ''}
                                onChange={(v) => handleFieldChange(key, v)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="activity" className="mt-4">
                    <Timeline events={timelineEvents} />
                  </TabsContent>

                  <TabsContent value="notes" className="mt-4">
                    <Notes 
                      notes={notes} 
                      onAddNote={addNote}
                      onEditNote={editNote}
                      onDeleteNote={deleteNote}
                      placeholder="Add a note about this record..."
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
