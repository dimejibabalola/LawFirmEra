import { db } from "@/lib/db"

export type TriggerType =
  | "RECORD_CREATED"
  | "RECORD_UPDATED"
  | "RECORD_DELETED"
  | "SCHEDULE"
  | "WEBHOOK"
  | "EMAIL_RECEIVED"
  | "MANUAL"

export type ActionType =
  | "CREATE_RECORD"
  | "UPDATE_RECORD"
  | "DELETE_RECORD"
  | "SEND_EMAIL"
  | "HTTP_REQUEST"
  | "DELAY"
  | "CONDITION"
  | "ADD_TAG"
  | "REMOVE_TAG"
  | "CREATE_TASK"
  | "ADD_NOTE"

export type EntityType = "COMPANY" | "CONTACT" | "DEAL" | "TASK" | "NOTE" | "ACTIVITY"

export interface TriggerConfig {
  type: TriggerType
  entityType?: EntityType
  filters?: Record<string, unknown>
  schedule?: {
    cron: string
    timezone?: string
  }
  webhook?: {
    path: string
    method: string
  }
}

export interface ActionConfig {
  type: ActionType
  order: number
  config: Record<string, unknown>
  condition?: {
    field: string
    operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than"
    value: unknown
  }
}

export interface WorkflowDefinition {
  id: string
  name: string
  description?: string
  isActive: boolean
  trigger: TriggerConfig
  actions: ActionConfig[]
}

interface WorkflowContext {
  executionId: string
  workflowId: string
  triggerData: Record<string, unknown>
  variables: Record<string, unknown>
}

export class WorkflowEngine {
  static async execute(workflowId: string, triggerData: Record<string, unknown>) {
    const workflow = await db.workflow.findUnique({
      where: { id: workflowId },
    })

    if (!workflow || !workflow.isActive) {
      return { success: false, error: "Workflow not found or inactive" }
    }

    const execution = await db.workflowExecution.create({
      data: {
        workflowId,
        status: "RUNNING",
        triggerData: JSON.stringify(triggerData),
      },
    })

    const context: WorkflowContext = {
      executionId: execution.id,
      workflowId,
      triggerData,
      variables: { ...triggerData },
    }

    try {
      const actions: ActionConfig[] = workflow.actions
        ? JSON.parse(workflow.actions)
        : []

      for (const action of actions.sort((a, b) => a.order - b.order)) {
        if (action.condition && !this.evaluateCondition(action.condition, context)) {
          continue
        }

        await this.executeAction(action, context)
      }

      await db.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: "COMPLETED",
          completedAt: new Date(),
          result: JSON.stringify(context.variables),
        },
      })

      return { success: true, executionId: execution.id }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error"

      await db.workflowExecution.update({
        where: { id: execution.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          error: errorMessage,
        },
      })

      return { success: false, error: errorMessage, executionId: execution.id }
    }
  }

  private static evaluateCondition(
    condition: ActionConfig["condition"],
    context: WorkflowContext
  ): boolean {
    if (!condition) return true

    const fieldValue = this.resolveValue(condition.field, context)
    const targetValue = condition.value

    switch (condition.operator) {
      case "equals":
        return fieldValue === targetValue
      case "not_equals":
        return fieldValue !== targetValue
      case "contains":
        return String(fieldValue).includes(String(targetValue))
      case "greater_than":
        return Number(fieldValue) > Number(targetValue)
      case "less_than":
        return Number(fieldValue) < Number(targetValue)
      default:
        return false
    }
  }

  private static resolveValue(path: string, context: WorkflowContext): unknown {
    const parts = path.split(".")
    let value: unknown = context

    for (const part of parts) {
      if (value && typeof value === "object" && part in value) {
        value = (value as Record<string, unknown>)[part]
      } else {
        return undefined
      }
    }

    return value
  }

  private static async executeAction(
    action: ActionConfig,
    context: WorkflowContext
  ): Promise<void> {
    switch (action.type) {
      case "CREATE_RECORD":
        await this.createRecord(action.config, context)
        break
      case "UPDATE_RECORD":
        await this.updateRecord(action.config, context)
        break
      case "DELETE_RECORD":
        await this.deleteRecord(action.config, context)
        break
      case "SEND_EMAIL":
        await this.sendEmail(action.config, context)
        break
      case "HTTP_REQUEST":
        await this.httpRequest(action.config, context)
        break
      case "DELAY":
        await this.delay(action.config)
        break
      case "CREATE_TASK":
        await this.createTask(action.config, context)
        break
      case "ADD_NOTE":
        await this.addNote(action.config, context)
        break
      case "ADD_TAG":
      case "REMOVE_TAG":
        await this.modifyTag(action.type, action.config, context)
        break
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private static async createRecord(
    config: Record<string, unknown>,
    context: WorkflowContext
  ) {
    const entityType = config.entityType as EntityType
    const data = this.interpolateValues(config.data as Record<string, unknown>, context)

    switch (entityType) {
      case "COMPANY":
        const company = await db.cRMCompany.create({ data: data as any })
        context.variables.createdCompanyId = company.id
        break
      case "CONTACT":
        const contact = await db.cRMContact.create({ data: data as any })
        context.variables.createdContactId = contact.id
        break
      case "DEAL":
        const deal = await db.deal.create({ data: data as any })
        context.variables.createdDealId = deal.id
        break
      case "TASK":
        const task = await db.cRMActivity.create({ data: data as any })
        context.variables.createdTaskId = task.id
        break
      default:
        throw new Error(`Cannot create record for type: ${entityType}`)
    }
  }

  private static async updateRecord(
    config: Record<string, unknown>,
    context: WorkflowContext
  ) {
    const entityType = config.entityType as EntityType
    const recordId = this.interpolateValue(config.recordId as string, context)
    const data = this.interpolateValues(config.data as Record<string, unknown>, context)

    switch (entityType) {
      case "COMPANY":
        await db.cRMCompany.update({ where: { id: recordId }, data: data as any })
        break
      case "CONTACT":
        await db.cRMContact.update({ where: { id: recordId }, data: data as any })
        break
      case "DEAL":
        await db.deal.update({ where: { id: recordId }, data: data as any })
        break
      case "TASK":
        await db.cRMActivity.update({ where: { id: recordId }, data: data as any })
        break
      default:
        throw new Error(`Cannot update record for type: ${entityType}`)
    }
  }

  private static async deleteRecord(
    config: Record<string, unknown>,
    context: WorkflowContext
  ) {
    const entityType = config.entityType as EntityType
    const recordId = this.interpolateValue(config.recordId as string, context)

    switch (entityType) {
      case "COMPANY":
        await db.cRMCompany.delete({ where: { id: recordId } })
        break
      case "CONTACT":
        await db.cRMContact.delete({ where: { id: recordId } })
        break
      case "DEAL":
        await db.deal.delete({ where: { id: recordId } })
        break
      case "TASK":
        await db.cRMActivity.delete({ where: { id: recordId } })
        break
      default:
        throw new Error(`Cannot delete record for type: ${entityType}`)
    }
  }

  private static async sendEmail(
    config: Record<string, unknown>,
    context: WorkflowContext
  ) {
    const to = this.interpolateValue(config.to as string, context)
    const subject = this.interpolateValue(config.subject as string, context)
    const body = this.interpolateValue(config.body as string, context)

    console.log(`[Workflow] Sending email to ${to}: ${subject}`)

    context.variables.lastEmailSent = {
      to,
      subject,
      body,
      sentAt: new Date().toISOString(),
    }
  }

  private static async httpRequest(
    config: Record<string, unknown>,
    context: WorkflowContext
  ) {
    const url = this.interpolateValue(config.url as string, context)
    const method = (config.method as string) || "GET"
    const headers = config.headers as Record<string, string> | undefined
    const body = config.body ? this.interpolateValue(config.body as string, context) : undefined

    const response = await fetch(url, {
      method,
      headers: headers || {},
      body: body ? JSON.stringify(body) : undefined,
    })

    const responseText = await response.text()
    let responseData: unknown

    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = responseText
    }

    context.variables.lastHttpResponse = {
      status: response.status,
      data: responseData,
    }

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status}`)
    }
  }

  private static async delay(config: Record<string, unknown>) {
    const seconds = Number(config.seconds) || 0
    if (seconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, seconds * 1000))
    }
  }

  private static async createTask(
    config: Record<string, unknown>,
    context: WorkflowContext
  ) {
    const data = this.interpolateValues(config as Record<string, unknown>, context)

    const task = await db.cRMActivity.create({
      data: {
        type: "TASK",
        title: data.title as string,
        description: data.description as string,
        dueDate: data.dueDate ? new Date(data.dueDate as string) : undefined,
        companyId: data.companyId as string,
        contactId: data.contactId as string,
        dealId: data.dealId as string,
      },
    })

    context.variables.createdTaskId = task.id
  }

  private static async addNote(
    config: Record<string, unknown>,
    context: WorkflowContext
  ) {
    const entityType = config.entityType as EntityType
    const entityId = this.interpolateValue(config.entityId as string, context)
    const content = this.interpolateValue(config.content as string, context)

    const note = await db.cRMNote.create({
      data: {
        content,
        companyId: entityType === "COMPANY" ? entityId : undefined,
        contactId: entityType === "CONTACT" ? entityId : undefined,
        dealId: entityType === "DEAL" ? entityId : undefined,
      },
    })

    context.variables.createdNoteId = note.id
  }

  private static async modifyTag(
    actionType: "ADD_TAG" | "REMOVE_TAG",
    config: Record<string, unknown>,
    context: WorkflowContext
  ) {
    const entityType = config.entityType as EntityType
    const entityId = this.interpolateValue(config.entityId as string, context)
    const tag = this.interpolateValue(config.tag as string, context)

    console.log(`[Workflow] ${actionType}: ${tag} on ${entityType}:${entityId}`)
  }

  private static interpolateValue(
    template: string,
    context: WorkflowContext
  ): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = this.resolveValue(path.trim(), context)
      return value !== undefined ? String(value) : ""
    })
  }

  private static interpolateValues(
    data: Record<string, unknown>,
    context: WorkflowContext
  ): Record<string, unknown> {
    const result: Record<string, unknown> = {}

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === "string") {
        result[key] = this.interpolateValue(value, context)
      } else if (typeof value === "object" && value !== null) {
        result[key] = this.interpolateValues(value as Record<string, unknown>, context)
      } else {
        result[key] = value
      }
    }

    return result
  }
}

export async function triggerWorkflow(
  triggerType: TriggerType,
  entityType?: EntityType,
  entityData?: Record<string, unknown>
) {
  const workflows = await db.workflow.findMany({
    where: { isActive: true },
  })

  for (const workflow of workflows) {
    const triggerConfig: TriggerConfig = workflow.triggerConfig
      ? JSON.parse(workflow.triggerConfig)
      : { type: "MANUAL" }

    if (triggerConfig.type !== triggerType) continue

    if (entityType && triggerConfig.entityType !== entityType) continue

    if (triggerConfig.filters) {
      const matches = Object.entries(triggerConfig.filters).every(([key, value]) => {
        return entityData?.[key] === value
      })
      if (!matches) continue
    }

    WorkflowEngine.execute(workflow.id, entityData || {}).catch((error) => {
      console.error(`Workflow ${workflow.id} execution failed:`, error)
    })
  }
}
