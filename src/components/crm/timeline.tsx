"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  User,
  Building,
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  Edit,
  Plus,
  ArrowRight,
  Clock,
  MessageSquare,
  Briefcase,
  DollarSign,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Types
export interface TimelineEvent {
  id: string
  type: 'created' | 'updated' | 'note' | 'email' | 'call' | 'meeting' | 'task' | 'deal' | 'field_change'
  title: string
  description?: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  timestamp: Date
  linkedRecord?: {
    id: string
    type: 'company' | 'contact' | 'deal' | 'task'
    name: string
  }
  fieldChanges?: {
    field: string
    oldValue: string
    newValue: string
  }[]
}

interface TimelineProps {
  events: TimelineEvent[]
  loading?: boolean
  onRecordClick?: (record: TimelineEvent['linkedRecord']) => void
  className?: string
}

// Helper functions
const getEventIcon = (type: TimelineEvent['type']) => {
  const icons: Record<string, React.ReactNode> = {
    created: <Plus className="h-4 w-4" />,
    updated: <Edit className="h-4 w-4" />,
    note: <MessageSquare className="h-4 w-4" />,
    email: <Mail className="h-4 w-4" />,
    call: <Phone className="h-4 w-4" />,
    meeting: <Calendar className="h-4 w-4" />,
    task: <CheckCircle className="h-4 w-4" />,
    deal: <DollarSign className="h-4 w-4" />,
    field_change: <Edit className="h-4 w-4" />,
  }
  return icons[type] || <User className="h-4 w-4" />
}

const getEventColor = (type: TimelineEvent['type']) => {
  const colors: Record<string, string> = {
    created: 'bg-teal-100 text-teal-600',
    updated: 'bg-blue-100 text-blue-600',
    note: 'bg-purple-100 text-purple-600',
    email: 'bg-amber-100 text-amber-600',
    call: 'bg-green-100 text-green-600',
    meeting: 'bg-indigo-100 text-indigo-600',
    task: 'bg-orange-100 text-orange-600',
    deal: 'bg-emerald-100 text-emerald-600',
    field_change: 'bg-gray-100 text-gray-600',
  }
  return colors[type] || 'bg-gray-100 text-gray-600'
}

const getRecordIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    company: <Building className="h-3 w-3" />,
    contact: <User className="h-3 w-3" />,
    deal: <Briefcase className="h-3 w-3" />,
    task: <CheckCircle className="h-3 w-3" />,
  }
  return icons[type] || <FileText className="h-3 w-3" />
}

const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date)
}

// Timeline Event Component
function TimelineEventItem({ 
  event, 
  onRecordClick,
}: { 
  event: TimelineEvent
  onRecordClick?: (record: TimelineEvent['linkedRecord']) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex gap-3 py-4 first:pt-0 last:pb-0"
    >
      <div className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
        getEventColor(event.type)
      )}>
        {getEventIcon(event.type)}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-medium text-gray-900 text-sm">
              {event.author.name}
            </span>
            <span className="text-gray-500 text-sm">
              {event.title}
            </span>
          </div>
          <span className="text-xs text-gray-400 shrink-0">
            {formatTimeAgo(event.timestamp)}
          </span>
        </div>

        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {event.description}
          </p>
        )}

        {event.linkedRecord && (
          <button
            onClick={() => onRecordClick?.(event.linkedRecord)}
            className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-xs text-gray-700 group/record"
          >
            {getRecordIcon(event.linkedRecord.type)}
            <span className="truncate max-w-[200px]">{event.linkedRecord.name}</span>
            <ArrowRight className="h-3 w-3 opacity-0 group-hover/record:opacity-100 transition-opacity" />
          </button>
        )}

        {event.fieldChanges && event.fieldChanges.length > 0 && (
          <div className="mt-2 space-y-1">
            {event.fieldChanges.map((change, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="font-medium text-gray-500">{change.field}:</span>
                <span className="text-red-500 line-through">{change.oldValue}</span>
                <ArrowRight className="h-3 w-3 text-gray-400" />
                <span className="text-teal-600 font-medium">{change.newValue}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

// Loading Skeleton
function TimelineSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="flex gap-3 py-4 animate-pulse">
          <div className="h-9 w-9 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Empty State
function TimelineEmpty({ onAddNote }: { onAddNote?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-4">
        <Clock className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">No activity yet</h3>
      <p className="text-sm text-gray-500 mb-4">
        Activity will appear here as you interact with this record
      </p>
      {onAddNote && (
        <Button variant="outline" size="sm" onClick={onAddNote} className="border-gray-200">
          <Plus className="h-4 w-4 mr-2" />
          Add a note
        </Button>
      )}
    </div>
  )
}

// Main Timeline Component
export function Timeline({ 
  events, 
  loading,
  onRecordClick,
  className 
}: TimelineProps) {
  if (loading) {
    return (
      <Card className={cn("border border-gray-200 shadow-sm", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimelineSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border border-gray-200 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-900">
            <Clock className="h-4 w-4 text-gray-400" />
            Activity
          </CardTitle>
          {events.length > 0 && (
            <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-600">
              {events.length} events
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <TimelineEmpty />
        ) : (
          <ScrollArea className="max-h-[400px]">
            <div className="divide-y divide-gray-100">
              <AnimatePresence mode="popLayout">
                {events.map((event) => (
                  <TimelineEventItem
                    key={event.id}
                    event={event}
                    onRecordClick={onRecordClick}
                  />
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}

// Hook to generate timeline events
export function useTimelineEvents() {
  const mockEvents: TimelineEvent[] = [
    {
      id: '1',
      type: 'created',
      title: 'created this record',
      author: { id: '1', name: 'John Smith' },
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
      id: '2',
      type: 'note',
      title: 'added a note',
      description: 'Had a great discovery call with the prospect. They are interested in our enterprise plan.',
      author: { id: '2', name: 'Sarah Johnson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '3',
      type: 'field_change',
      title: 'updated the status',
      author: { id: '1', name: 'John Smith' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
      fieldChanges: [
        { field: 'Status', oldValue: 'New', newValue: 'In Progress' },
        { field: 'Priority', oldValue: 'Medium', newValue: 'High' },
      ],
    },
    {
      id: '4',
      type: 'email',
      title: 'sent an email',
      description: 'Follow-up on our conversation',
      author: { id: '2', name: 'Sarah Johnson' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      linkedRecord: { id: 'c1', type: 'contact', name: 'Jane Doe' },
    },
    {
      id: '5',
      type: 'call',
      title: 'logged a call',
      description: 'Initial discovery call - 45 minutes',
      author: { id: '1', name: 'John Smith' },
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    },
  ]

  return { events: mockEvents, loading: false }
}
