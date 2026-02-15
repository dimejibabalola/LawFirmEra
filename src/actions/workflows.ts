"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import { WorkflowEngine, type TriggerConfig, type ActionConfig } from "@/lib/workflow-engine"

export async function getWorkflows() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const workflows = await db.workflow.findMany({
    include: {
      _count: {
        select: { executions: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return workflows.map((w) => ({
    ...w,
    trigger: w.triggerConfig ? JSON.parse(w.triggerConfig) : null,
    actions: w.actions ? JSON.parse(w.actions) : [],
    _executionsCount: w._count.executions,
  }))
}

export async function getWorkflow(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const workflow = await db.workflow.findUnique({
    where: { id },
    include: {
      executions: {
        take: 50,
        orderBy: { startedAt: "desc" },
      },
    },
  })

  if (!workflow) return null

  return {
    ...workflow,
    trigger: workflow.triggerConfig ? JSON.parse(workflow.triggerConfig) : null,
    actions: workflow.actions ? JSON.parse(workflow.actions) : [],
  }
}

export async function createWorkflow(data: {
  name: string
  description?: string
  trigger: TriggerConfig
  actions: ActionConfig[]
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const workflow = await db.workflow.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: false,
      triggerType: data.trigger.type,
      triggerConfig: JSON.stringify(data.trigger),
      actions: JSON.stringify(data.actions),
    },
  })

  revalidatePath("/workflows")
  return workflow
}

export async function updateWorkflow(
  id: string,
  data: Partial<{
    name: string
    description: string
    isActive: boolean
    trigger: TriggerConfig
    actions: ActionConfig[]
  }>
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const updateData: Record<string, unknown> = {}

  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.isActive !== undefined) updateData.isActive = data.isActive
  if (data.trigger) {
    updateData.triggerType = data.trigger.type
    updateData.triggerConfig = JSON.stringify(data.trigger)
  }
  if (data.actions) {
    updateData.actions = JSON.stringify(data.actions)
  }

  const workflow = await db.workflow.update({
    where: { id },
    data: updateData,
  })

  revalidatePath("/workflows")
  return workflow
}

export async function deleteWorkflow(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db.workflowExecution.deleteMany({
    where: { workflowId: id },
  })

  await db.workflow.delete({
    where: { id },
  })

  revalidatePath("/workflows")
  return { success: true }
}

export async function toggleWorkflow(id: string, isActive: boolean) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const workflow = await db.workflow.update({
    where: { id },
    data: { isActive },
  })

  revalidatePath("/workflows")
  return workflow
}

export async function executeWorkflow(id: string, triggerData?: Record<string, unknown>) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const result = await WorkflowEngine.execute(id, triggerData || {})

  revalidatePath("/workflows")
  return result
}

export async function getWorkflowExecutions(workflowId: string, limit = 50) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const executions = await db.workflowExecution.findMany({
    where: { workflowId },
    take: limit,
    orderBy: { startedAt: "desc" },
  })

  return executions.map((e) => ({
    ...e,
    triggerData: e.triggerData ? JSON.parse(e.triggerData) : null,
    result: e.result ? JSON.parse(e.result) : null,
  }))
}

export async function getWorkflowStats() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const [totalWorkflows, activeWorkflows, totalExecutions, recentExecutions] =
    await Promise.all([
      db.workflow.count(),
      db.workflow.count({ where: { isActive: true } }),
      db.workflowExecution.count(),
      db.workflowExecution.count({
        where: {
          startedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

  return {
    totalWorkflows,
    activeWorkflows,
    totalExecutions,
    recentExecutions,
  }
}
