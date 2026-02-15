"use client"

import * as React from "react"
import { useState, useTransition, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Zap,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Workflow as WorkflowIcon,
  ArrowRight,
  GripVertical,
  Webhook,
  Mail,
  Calendar,
  Database,
  Send,
  Timer,
  GitBranch,
  Tag,
  FileText,
  Loader2,
} from "lucide-react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

import {
  getWorkflows,
  createWorkflow,
  updateWorkflow,
  deleteWorkflow,
  toggleWorkflow,
  executeWorkflow,
  getWorkflowStats,
} from "@/actions/workflows"

type TriggerType = "RECORD_CREATED" | "RECORD_UPDATED" | "RECORD_DELETED" | "SCHEDULE" | "WEBHOOK" | "MANUAL"
type ActionType = "CREATE_RECORD" | "UPDATE_RECORD" | "DELETE_RECORD" | "SEND_EMAIL" | "HTTP_REQUEST" | "DELAY" | "CONDITION" | "ADD_TAG" | "CREATE_TASK" | "ADD_NOTE"
type EntityType = "COMPANY" | "CONTACT" | "DEAL" | "TASK" | "NOTE" | "ACTIVITY"

interface TriggerConfig {
  type: TriggerType
  entityType?: EntityType
  filters?: Record<string, unknown>
  schedule?: { cron: string; timezone?: string }
  webhook?: { path: string; method: string }
}

interface ActionConfig {
  id: string
  type: ActionType
  order: number
  config: Record<string, unknown>
  condition?: {
    field: string
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than"
    value: unknown
  }
}

interface Workflow {
  id: string
  name: string
  description: string | null
  isActive: boolean
  triggerType: string
  trigger: TriggerConfig | null
  actions: ActionConfig[]
  _executionsCount?: number
  createdAt: Date
  updatedAt: Date
}

const triggerTypeConfig: Record<TriggerType, { icon: React.ElementType; label: string; color: string }> = {
  RECORD_CREATED: { icon: Database, label: "Record Created", color: "bg-emerald-100 text-emerald-700" },
  RECORD_UPDATED: { icon: Database, label: "Record Updated", color: "bg-blue-100 text-blue-700" },
  RECORD_DELETED: { icon: Database, label: "Record Deleted", color: "bg-red-100 text-red-700" },
  SCHEDULE: { icon: Calendar, label: "Schedule", color: "bg-purple-100 text-purple-700" },
  WEBHOOK: { icon: Webhook, label: "Webhook", color: "bg-orange-100 text-orange-700" },
  MANUAL: { icon: Play, label: "Manual", color: "bg-slate-100 text-slate-700" },
}

const actionTypeConfig: Record<ActionType, { icon: React.ElementType; label: string; color: string }> = {
  CREATE_RECORD: { icon: Database, label: "Create Record", color: "bg-emerald-100 text-emerald-700" },
  UPDATE_RECORD: { icon: Database, label: "Update Record", color: "bg-blue-100 text-blue-700" },
  DELETE_RECORD: { icon: Database, label: "Delete Record", color: "bg-red-100 text-red-700" },
  SEND_EMAIL: { icon: Mail, label: "Send Email", color: "bg-purple-100 text-purple-700" },
  HTTP_REQUEST: { icon: Send, label: "HTTP Request", color: "bg-orange-100 text-orange-700" },
  DELAY: { icon: Timer, label: "Delay", color: "bg-amber-100 text-amber-700" },
  CONDITION: { icon: GitBranch, label: "Condition", color: "bg-cyan-100 text-cyan-700" },
  ADD_TAG: { icon: Tag, label: "Add Tag", color: "bg-pink-100 text-pink-700" },
  CREATE_TASK: { icon: FileText, label: "Create Task", color: "bg-indigo-100 text-indigo-700" },
  ADD_NOTE: { icon: FileText, label: "Add Note", color: "bg-teal-100 text-teal-700" },
}

const statusColors: Record<string, string> = {
  RUNNING: "bg-blue-500",
  COMPLETED: "bg-emerald-500",
  FAILED: "bg-red-500",
  PENDING: "bg-slate-400",
}

export function WorkflowBuilder() {
  const [isPending, startTransition] = useTransition()
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [stats, setStats] = useState<{
    totalWorkflows: number
    activeWorkflows: number
    totalExecutions: number
    recentExecutions: number
  } | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const [editForm, setEditForm] = useState<{
    name: string
    description: string
    trigger: TriggerConfig
    actions: ActionConfig[]
  }>({
    name: "",
    description: "",
    trigger: { type: "MANUAL" },
    actions: [],
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    startTransition(async () => {
      try {
        const [workflowData, statsData] = await Promise.all([getWorkflows(), getWorkflowStats()])
        setWorkflows(workflowData as Workflow[])
        setStats(statsData)
      } catch (error) {
        toast.error("Failed to load workflows")
      }
    })
  }

  const handleCreate = () => {
    startTransition(async () => {
      try {
        await createWorkflow({
          name: editForm.name,
          description: editForm.description,
          trigger: editForm.trigger,
          actions: editForm.actions,
        })
        toast.success("Workflow created")
        setIsCreateOpen(false)
        resetForm()
        loadData()
      } catch (error) {
        toast.error("Failed to create workflow")
      }
    })
  }

  const handleUpdate = () => {
    if (!selectedWorkflow) return
    startTransition(async () => {
      try {
        await updateWorkflow(selectedWorkflow.id, {
          name: editForm.name,
          description: editForm.description,
          trigger: editForm.trigger,
          actions: editForm.actions,
        })
        toast.success("Workflow updated")
        setIsEditing(false)
        setSelectedWorkflow(null)
        loadData()
      } catch (error) {
        toast.error("Failed to update workflow")
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this workflow?")) return
    startTransition(async () => {
      try {
        await deleteWorkflow(id)
        toast.success("Workflow deleted")
        loadData()
      } catch (error) {
        toast.error("Failed to delete workflow")
      }
    })
  }

  const handleToggle = (id: string, isActive: boolean) => {
    startTransition(async () => {
      try {
        await toggleWorkflow(id, isActive)
        toast.success(isActive ? "Workflow activated" : "Workflow deactivated")
        loadData()
      } catch (error) {
        toast.error("Failed to toggle workflow")
      }
    })
  }

  const handleExecute = (id: string) => {
    startTransition(async () => {
      try {
        const result = await executeWorkflow(id)
        if (result.success) {
          toast.success("Workflow executed successfully")
        } else {
          toast.error(`Workflow failed: ${result.error}`)
        }
        loadData()
      } catch (error) {
        toast.error("Failed to execute workflow")
      }
    })
  }

  const resetForm = () => {
    setEditForm({
      name: "",
      description: "",
      trigger: { type: "MANUAL" },
      actions: [],
    })
  }

  const startEditing = (workflow: Workflow) => {
    setSelectedWorkflow(workflow)
    setEditForm({
      name: workflow.name,
      description: workflow.description || "",
      trigger: workflow.trigger || { type: "MANUAL" },
      actions: workflow.actions || [],
    })
    setIsEditing(true)
  }

  const addAction = (type: ActionType) => {
    const newAction: ActionConfig = {
      id: crypto.randomUUID(),
      type,
      order: editForm.actions.length,
      config: {},
    }
    setEditForm({ ...editForm, actions: [...editForm.actions, newAction] })
  }

  const removeAction = (id: string) => {
    setEditForm({
      ...editForm,
      actions: editForm.actions.filter((a) => a.id !== id).map((a, i) => ({ ...a, order: i })),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{stats?.totalWorkflows || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800">
                <WorkflowIcon className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{stats?.activeWorkflows || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900">
                <Play className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Runs</p>
                <p className="text-2xl font-bold">{stats?.totalExecutions || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Runs (24h)</p>
                <p className="text-2xl font-bold">{stats?.recentExecutions || 0}</p>
              </div>
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflows</h3>
          <p className="text-sm text-muted-foreground">Automate your CRM processes</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              New Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Workflow</DialogTitle>
              <DialogDescription>Define triggers and actions for automation</DialogDescription>
            </DialogHeader>
            <WorkflowForm
              form={editForm}
              setForm={setEditForm}
              onAddAction={addAction}
              onRemoveAction={removeAction}
            />
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleCreate} disabled={isPending}>
                Create Workflow
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[500px]">
        {workflows.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Zap className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No workflows yet</p>
              <p className="text-sm text-muted-foreground">Create your first automation workflow</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {workflows.map((workflow, index) => {
                const triggerConfig = triggerTypeConfig[workflow.triggerType as TriggerType] || triggerTypeConfig.MANUAL
                const TriggerIcon = triggerConfig.icon

                return (
                  <motion.div
                    key={workflow.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="border-slate-200 dark:border-slate-800">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={cn("p-2 rounded-lg", triggerConfig.color)}>
                            <TriggerIcon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium truncate">{workflow.name}</h4>
                              {workflow.isActive ? (
                                <Badge variant="default" className="bg-emerald-600">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {workflow.description || "No description"}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>Trigger: {triggerConfig.label}</span>
                              <span>Actions: {workflow.actions?.length || 0}</span>
                              <span>Runs: {workflow._executionsCount || 0}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={workflow.isActive}
                              onCheckedChange={(checked) => handleToggle(workflow.id, checked)}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleExecute(workflow.id)}
                              disabled={!workflow.isActive || isPending}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="icon" onClick={() => startEditing(workflow)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(workflow.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </ScrollArea>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Workflow</DialogTitle>
            <DialogDescription>Modify triggers and actions</DialogDescription>
          </DialogHeader>
          <WorkflowForm
            form={editForm}
            setForm={setEditForm}
            onAddAction={addAction}
            onRemoveAction={removeAction}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleUpdate} disabled={isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WorkflowForm({
  form,
  setForm,
  onAddAction,
  onRemoveAction,
}: {
  form: { name: string; description: string; trigger: TriggerConfig; actions: ActionConfig[] }
  setForm: React.Dispatch<React.SetStateAction<typeof form>>
  onAddAction: (type: ActionType) => void
  onRemoveAction: (id: string) => void
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Name</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g., New lead notification"
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What does this workflow do?"
            rows={2}
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label>Trigger</Label>
        <div className="grid grid-cols-2 gap-4">
          <Select
            value={form.trigger.type}
            onValueChange={(v) => setForm({ ...form, trigger: { ...form.trigger, type: v as TriggerType } })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select trigger type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RECORD_CREATED">Record Created</SelectItem>
              <SelectItem value="RECORD_UPDATED">Record Updated</SelectItem>
              <SelectItem value="RECORD_DELETED">Record Deleted</SelectItem>
              <SelectItem value="SCHEDULE">Schedule</SelectItem>
              <SelectItem value="WEBHOOK">Webhook</SelectItem>
              <SelectItem value="MANUAL">Manual</SelectItem>
            </SelectContent>
          </Select>
          {["RECORD_CREATED", "RECORD_UPDATED", "RECORD_DELETED"].includes(form.trigger.type) && (
            <Select
              value={form.trigger.entityType || ""}
              onValueChange={(v) => setForm({ ...form, trigger: { ...form.trigger, entityType: v as EntityType } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPANY">Company</SelectItem>
                <SelectItem value="CONTACT">Contact</SelectItem>
                <SelectItem value="DEAL">Deal</SelectItem>
                <SelectItem value="TASK">Task</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Actions</Label>
          <Select onValueChange={(v) => onAddAction(v as ActionType)}>
            <SelectTrigger className="w-[180px]">
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </SelectTrigger>
            <SelectContent>
              {Object.entries(actionTypeConfig).map(([type, config]) => (
                <SelectItem key={type} value={type}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {form.actions.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-6 text-center text-muted-foreground">
            No actions added yet
          </div>
        ) : (
          <Reorder.Group
            axis="y"
            values={form.actions}
            onReorder={(newOrder) => setForm({ ...form, actions: newOrder.map((a, i) => ({ ...a, order: i })) })}
            className="space-y-2"
          >
            {form.actions.map((action) => {
              const config = actionTypeConfig[action.type]
              const Icon = config.icon
              return (
                <Reorder.Item
                  key={action.id}
                  value={action}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg cursor-move"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className={cn("p-1.5 rounded", config.color)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="flex-1 text-sm font-medium">{config.label}</span>
                  <Button variant="ghost" size="icon" onClick={() => onRemoveAction(action.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </Reorder.Item>
              )
            })}
          </Reorder.Group>
        )}
      </div>
    </div>
  )
}
