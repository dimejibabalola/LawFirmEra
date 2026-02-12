"use client"

import * as React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
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
import { Label } from "@/components/ui/label"
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  Smile,
  Check,
  CheckCheck,
  Clock,
  User,
  Briefcase,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// Mock conversations
const mockConversations = [
  {
    id: '1',
    participants: [
      { id: '1', name: 'Sarah Johnson', avatar: null, role: 'Associate', status: 'online' },
    ],
    subject: 'Merger Agreement Review',
    matter: 'Merger Agreement',
    lastMessage: 'I\'ve reviewed the amendments. Can we discuss the changes?',
    lastMessageAt: '2024-11-28T14:30:00',
    unreadCount: 2,
  },
  {
    id: '2',
    participants: [
      { id: '2', name: 'Michael Chen', avatar: null, role: 'Partner', status: 'online' },
    ],
    subject: 'Williams Trust Documents',
    matter: 'Estate Planning',
    lastMessage: 'The trust documents are ready for client signature.',
    lastMessageAt: '2024-11-28T11:00:00',
    unreadCount: 0,
  },
  {
    id: '3',
    participants: [
      { id: '3', name: 'Emily Davis', avatar: null, role: 'Associate', status: 'offline' },
    ],
    subject: 'Patent Research',
    matter: 'Patent Application',
    lastMessage: 'Prior art search completed. Found 3 relevant patents.',
    lastMessageAt: '2024-11-27T16:45:00',
    unreadCount: 0,
  },
  {
    id: '4',
    participants: [
      { id: '4', name: 'James Smith', avatar: null, role: 'Client', status: 'offline' },
    ],
    subject: 'Settlement Discussion',
    matter: 'Smith v. Johnson Corp',
    lastMessage: 'Thank you for the update. I\'ll review the offer.',
    lastMessageAt: '2024-11-26T09:20:00',
    unreadCount: 1,
  },
  {
    id: '5',
    participants: [
      { id: '5', name: 'Lisa Chen', avatar: null, role: 'Client', status: 'offline' },
    ],
    subject: 'Property Acquisition Documents',
    matter: 'Real Estate Acquisition',
    lastMessage: 'Documents received. Everything looks good.',
    lastMessageAt: '2024-11-25T14:10:00',
    unreadCount: 0,
  },
]

// Mock messages for a conversation
const mockMessages = [
  { id: '1', senderId: 'other', content: 'Hi John, I\'ve been reviewing the merger agreement and have some questions about section 4.2.', timestamp: '2024-11-28T10:00:00', read: true },
  { id: '2', senderId: 'me', content: 'Sure, let me pull up that section. What specifically are you concerned about?', timestamp: '2024-11-28T10:05:00', read: true },
  { id: '3', senderId: 'other', content: 'The indemnification clause seems one-sided. Can we negotiate better terms for our client?', timestamp: '2024-11-28T10:10:00', read: true },
  { id: '4', senderId: 'me', content: 'I agree. I\'ll draft some alternative language. Let me check similar deals we\'ve done recently.', timestamp: '2024-11-28T10:15:00', read: true },
  { id: '5', senderId: 'other', content: 'Perfect. Also, the timeline for due diligence seems tight. Should we request an extension?', timestamp: '2024-11-28T11:30:00', read: true },
  { id: '6', senderId: 'me', content: 'Good catch. I\'ll prepare a request for an additional 15 days. That should give us enough time for a thorough review.', timestamp: '2024-11-28T14:00:00', read: true },
  { id: '7', senderId: 'other', content: 'I\'ve reviewed the amendments. Can we discuss the changes?', timestamp: '2024-11-28T14:30:00', read: false },
]

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  } else if (days === 1) {
    return 'Yesterday'
  } else if (days < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const item = {
  hidden: { opacity: 0, x: -10 },
  show: { opacity: 1, x: 0 }
}

export function MessagesPanel() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [isComposeOpen, setIsComposeOpen] = useState(false)

  const filteredConversations = mockConversations.filter(conv =>
    conv.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.participants.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const currentConversation = mockConversations.find(c => c.id === selectedConversation)

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In a real app, this would send the message
      setNewMessage('')
    }
  }

  const totalUnread = mockConversations.reduce((sum, c) => sum + c.unreadCount, 0)

  return (
    <div className="h-[calc(100vh-280px)] min-h-[500px]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        {/* Conversations List */}
        <Card className="border-slate-200 dark:border-slate-800 lg:col-span-1 h-full flex flex-col">
          <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Messages
                {totalUnread > 0 && (
                  <Badge className="bg-emerald-600">{totalUnread}</Badge>
                )}
              </CardTitle>
              <Dialog open={isComposeOpen} onOpenChange={setIsComposeOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>New Message</DialogTitle>
                    <DialogDescription>
                      Compose a new message
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>To</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select recipient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sarah">Sarah Johnson</SelectItem>
                          <SelectItem value="michael">Michael Chen</SelectItem>
                          <SelectItem value="emily">Emily Davis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input placeholder="Message subject" />
                    </div>
                    <div className="space-y-2">
                      <Label>Matter (Optional)</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select matter" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Smith v. Johnson Corp</SelectItem>
                          <SelectItem value="2">Merger Agreement</SelectItem>
                          <SelectItem value="3">Williams Trust</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Message</Label>
                      <Textarea placeholder="Type your message..." rows={4} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsComposeOpen(false)}>Cancel</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setIsComposeOpen(false)}>
                      Send Message
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-200 dark:border-slate-700"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <ScrollArea className="h-full">
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="divide-y divide-slate-100 dark:divide-slate-800"
              >
                {filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    variants={item}
                    className={`p-4 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      selectedConversation === conversation.id ? 'bg-slate-100 dark:bg-slate-800' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                            {conversation.participants[0].name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.participants[0].status === 'online' && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-slate-900 dark:text-slate-100 truncate">
                            {conversation.participants[0].name}
                          </p>
                          <span className="text-xs text-slate-500">
                            {formatTime(conversation.lastMessageAt)}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                          {conversation.subject}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-slate-500 truncate pr-2">
                            {conversation.lastMessage}
                          </p>
                          {conversation.unreadCount > 0 && (
                            <Badge className="bg-emerald-600 text-white shrink-0">
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>
                        {conversation.matter && (
                          <div className="flex items-center gap-1 mt-1">
                            <Briefcase className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{conversation.matter}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Message Thread */}
        <Card className="border-slate-200 dark:border-slate-800 lg:col-span-2 h-full flex flex-col">
          {selectedConversation && currentConversation ? (
            <>
              {/* Thread Header */}
              <CardHeader className="pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-200">
                        {currentConversation.participants[0].name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">
                          {currentConversation.participants[0].name}
                        </CardTitle>
                        <Badge variant="secondary" className="text-xs">
                          {currentConversation.participants[0].role}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">{currentConversation.subject}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-4">
                    {mockMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${message.senderId === 'me' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${
                          message.senderId === 'me' 
                            ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-2xl rounded-bl-sm'
                        } px-4 py-2.5`}>
                          <p className="text-sm">{message.content}</p>
                          <div className={`flex items-center justify-end gap-1 mt-1 ${
                            message.senderId === 'me' ? 'text-emerald-100' : 'text-slate-400'
                          }`}>
                            <span className="text-xs">
                              {new Date(message.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                            {message.senderId === 'me' && (
                              message.read ? (
                                <CheckCheck className="h-3 w-3" />
                              ) : (
                                <Check className="h-3 w-3" />
                              )
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ImageIcon className="h-4 w-4 text-slate-500" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 border-slate-200 dark:border-slate-700"
                  />
                  <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Select a conversation</p>
                <p className="text-sm">Choose a conversation from the list to view messages</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
