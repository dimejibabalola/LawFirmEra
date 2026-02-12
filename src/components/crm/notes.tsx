"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MessageSquare,
  Plus,
  Send,
  MoreHorizontal,
  Edit,
  Trash,
  Clock,
  User,
  AtSign,
  Smile,
  Paperclip,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Types
export interface Note {
  id: string
  content: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  createdAt: Date
  updatedAt?: Date
  isEdited?: boolean
  mentions?: string[]
  attachments?: {
    id: string
    name: string
    url: string
    type: string
  }[]
}

interface NotesProps {
  notes: Note[]
  loading?: boolean
  onAddNote?: (content: string) => Promise<void>
  onEditNote?: (noteId: string, content: string) => Promise<void>
  onDeleteNote?: (noteId: string) => Promise<void>
  className?: string
  placeholder?: string
}

// Helper functions
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

// Note Item Component
function NoteItem({ 
  note, 
  onEdit, 
  onDelete 
}: { 
  note: Note
  onEdit?: (note: Note) => void
  onDelete?: (noteId: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group py-4 first:pt-0"
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={note.author.avatar} />
          <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
            {note.author.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900">{note.author.name}</span>
              <span className="text-xs text-gray-400">
                {formatTimeAgo(note.createdAt)}
              </span>
              {note.isEdited && (
                <span className="text-xs text-gray-400">(edited)</span>
              )}
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border border-gray-200">
                <DropdownMenuItem onClick={() => onEdit?.(note)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete?.(note.id)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">
            {note.content}
          </div>

          {note.attachments && note.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {note.attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-gray-100 hover:bg-gray-200 transition-colors text-xs text-gray-700"
                >
                  <Paperclip className="h-3 w-3" />
                  {attachment.name}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// Note Editor Component
function NoteEditor({ 
  onSubmit, 
  placeholder = "Write a note...",
  onCancel,
  initialValue = "",
}: { 
  onSubmit: (content: string) => Promise<void>
  placeholder?: string
  onCancel?: () => void
  initialValue?: string
}) {
  const [content, setContent] = useState(initialValue)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(content)
      setContent("")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        className="min-h-[80px] border-0 bg-transparent resize-none focus-visible:ring-0 text-sm"
        rows={3}
      />
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600">
            <AtSign className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600">
            <Smile className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600">
            <Paperclip className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-500">
              Cancel
            </Button>
          )}
          <Button 
            size="sm" 
            onClick={handleSubmit}
            disabled={!content.trim() || submitting}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {submitting ? (
              "Saving..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-1" />
                Add note
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Loading Skeleton
function NotesSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="flex gap-3 py-4 animate-pulse">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  )
}

// Empty State
function NotesEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 mb-3">
        <MessageSquare className="h-6 w-6 text-purple-500" />
      </div>
      <h3 className="font-medium text-gray-900 mb-1">No notes yet</h3>
      <p className="text-sm text-gray-500">
        Add notes to keep track of important information
      </p>
    </div>
  )
}

// Main Notes Component
export function Notes({ 
  notes, 
  loading,
  onAddNote,
  onEditNote,
  onDeleteNote,
  className,
  placeholder,
}: NotesProps) {
  const [showEditor, setShowEditor] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const handleSubmit = async (content: string) => {
    if (editingNote) {
      await onEditNote?.(editingNote.id, content)
      setEditingNote(null)
    } else {
      await onAddNote?.(content)
      setShowEditor(false)
    }
  }

  const handleEdit = (note: Note) => {
    setEditingNote(note)
    setShowEditor(false)
  }

  if (loading) {
    return (
      <Card className={cn("border border-gray-200 shadow-sm", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-900">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotesSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border border-gray-200 shadow-sm", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2 text-gray-900">
            <MessageSquare className="h-4 w-4 text-gray-400" />
            Notes
          </CardTitle>
          {notes.length > 0 && !showEditor && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowEditor(true)}
              className="border-gray-200 text-gray-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        {notes.length === 0 && !showEditor ? (
          <>
            <NotesEmpty />
            {onAddNote && (
              <NoteEditor 
                onSubmit={onAddNote}
                placeholder={placeholder}
              />
            )}
          </>
        ) : (
          <>
            <ScrollArea className="max-h-[300px]">
              <div className="divide-y divide-gray-100">
                <AnimatePresence mode="popLayout">
                  {notes.map((note) => (
                    <NoteItem
                      key={note.id}
                      note={note}
                      onEdit={handleEdit}
                      onDelete={onDeleteNote}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>

            {showEditor && onAddNote && (
              <div className="pt-4 border-t border-gray-100">
                <NoteEditor 
                  onSubmit={handleSubmit}
                  placeholder={placeholder}
                  onCancel={() => setShowEditor(false)}
                />
              </div>
            )}

            {editingNote && onEditNote && (
              <div className="pt-4 border-t border-gray-100">
                <NoteEditor 
                  onSubmit={handleSubmit}
                  initialValue={editingNote.content}
                  placeholder={placeholder}
                  onCancel={() => setEditingNote(null)}
                />
              </div>
            )}

            {!showEditor && !editingNote && notes.length > 0 && onAddNote && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEditor(true)}
                className="w-full mt-2 text-gray-500 hover:text-gray-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add another note
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

// Hook for notes
export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      content: 'Had a great discovery call with this prospect. They are very interested in our enterprise plan and want to schedule a demo next week.',
      author: { id: '1', name: 'Sarah Johnson' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
      id: '2',
      content: 'Followed up on the proposal. Waiting for feedback from their CFO.',
      author: { id: '2', name: 'John Smith' },
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20),
      isEdited: true,
    },
  ])

  const addNote = async (content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      author: { id: 'current', name: 'You' },
      createdAt: new Date(),
    }
    setNotes(prev => [newNote, ...prev])
  }

  const editNote = async (noteId: string, content: string) => {
    setNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, content, updatedAt: new Date(), isEdited: true }
        : note
    ))
  }

  const deleteNote = async (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId))
  }

  return { notes, addNote, editNote, deleteNote, loading: false }
}
