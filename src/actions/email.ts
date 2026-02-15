"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { auth } from "@/lib/auth"
import {
  syncEmailAccount,
  sendEmail,
  type EmailProvider,
  type SendEmailOptions,
} from "@/lib/email-providers"

export async function getEmailAccounts() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const accounts = await db.emailAccount.findMany({
    orderBy: { createdAt: "desc" },
  })

  return accounts.map((a) => ({
    ...a,
    accessToken: "[REDACTED]",
    refreshToken: a.refreshToken ? "[REDACTED]" : null,
  }))
}

export async function getEmailAccount(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const account = await db.emailAccount.findUnique({
    where: { id },
  })

  if (!account) return null

  return {
    ...account,
    accessToken: "[REDACTED]",
    refreshToken: account.refreshToken ? "[REDACTED]" : null,
  }
}

export async function connectEmailAccount(data: {
  provider: EmailProvider
  email: string
  displayName?: string
  accessToken: string
  refreshToken?: string
  imapHost?: string
  imapPort?: number
  smtpHost?: string
  smtpPort?: number
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const existing = await db.emailAccount.findUnique({
    where: { email: data.email },
  })

  if (existing) {
    const account = await db.emailAccount.update({
      where: { id: existing.id },
      data: {
        provider: data.provider,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        imapHost: data.imapHost,
        imapPort: data.imapPort,
        smtpHost: data.smtpHost,
        smtpPort: data.smtpPort,
        displayName: data.displayName,
      },
    })
    revalidatePath("/email")
    return account
  }

  const account = await db.emailAccount.create({
    data: {
      provider: data.provider,
      email: data.email,
      displayName: data.displayName,
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      imapHost: data.imapHost,
      imapPort: data.imapPort,
      smtpHost: data.smtpHost,
      smtpPort: data.smtpPort,
    },
  })

  revalidatePath("/email")
  return account
}

export async function disconnectEmailAccount(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db.emailMessage.deleteMany({
    where: { accountId: id },
  })

  await db.emailAccount.delete({
    where: { id },
  })

  revalidatePath("/email")
  return { success: true }
}

export async function syncEmail(id: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const account = await db.emailAccount.findUnique({
    where: { id },
  })

  if (!account) {
    throw new Error("Email account not found")
  }

  try {
    const result = await syncEmailAccount(
      {
        provider: account.provider as EmailProvider,
        email: account.email,
        displayName: account.displayName || undefined,
        accessToken: account.accessToken,
        refreshToken: account.refreshToken || undefined,
        imapHost: account.imapHost || undefined,
        imapPort: account.imapPort || undefined,
        smtpHost: account.smtpHost || undefined,
        smtpPort: account.smtpPort || undefined,
      },
      account.lastMessageId || undefined,
      50
    )

    for (const message of result.messages) {
      await db.emailMessage.upsert({
        where: { messageId: message.id },
        create: {
          accountId: id,
          messageId: message.id,
          threadId: message.threadId,
          inReplyTo: message.inReplyTo,
          fromEmail: message.from.email,
          fromName: message.from.name,
          toEmails: JSON.stringify(message.to),
          ccEmails: message.cc ? JSON.stringify(message.cc) : null,
          bccEmails: message.bcc ? JSON.stringify(message.bcc) : null,
          subject: message.subject,
          bodyText: message.bodyText,
          bodyHtml: message.bodyHtml,
          labels: JSON.stringify(message.labels || []),
          isRead: message.isRead,
          isStarred: message.isStarred,
          sentAt: message.sentAt,
          receivedAt: message.receivedAt,
        },
        update: {
          labels: JSON.stringify(message.labels || []),
          isRead: message.isRead,
          isStarred: message.isStarred,
        },
      })
    }

    await db.emailAccount.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        lastMessageId: result.lastMessageId,
      },
    })

    revalidatePath("/email")
    return { success: true, count: result.messages.length }
  } catch (error) {
    console.error("Email sync error:", error)
    throw error
  }
}

export async function getEmailMessages(filters?: {
  accountId?: string
  contactId?: string
  companyId?: string
  threadId?: string
  limit?: number
}) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const messages = await db.emailMessage.findMany({
    where: {
      ...(filters?.accountId && { accountId: filters.accountId }),
      ...(filters?.contactId && { contactId: filters.contactId }),
      ...(filters?.companyId && { companyId: filters.companyId }),
      ...(filters?.threadId && { threadId: filters.threadId }),
    },
    take: filters?.limit || 50,
    orderBy: { sentAt: "desc" },
  })

  return messages.map((m) => ({
    ...m,
    toEmails: JSON.parse(m.toEmails),
    ccEmails: m.ccEmails ? JSON.parse(m.ccEmails) : null,
    bccEmails: m.bccEmails ? JSON.parse(m.bccEmails) : null,
    labels: m.labels ? JSON.parse(m.labels) : [],
  }))
}

export async function sendEmailMessage(
  accountId: string,
  options: {
    to: Array<{ email: string; name?: string }>
    cc?: Array<{ email: string; name?: string }>
    bcc?: Array<{ email: string; name?: string }>
    subject: string
    bodyText?: string
    bodyHtml?: string
    replyTo?: string
  }
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  const account = await db.emailAccount.findUnique({
    where: { id: accountId },
  })

  if (!account) {
    throw new Error("Email account not found")
  }

  const result = await sendEmail(
    {
      provider: account.provider as EmailProvider,
      email: account.email,
      displayName: account.displayName || undefined,
      accessToken: account.accessToken,
      refreshToken: account.refreshToken || undefined,
      imapHost: account.imapHost || undefined,
      imapPort: account.imapPort || undefined,
      smtpHost: account.smtpHost || undefined,
      smtpPort: account.smtpPort || undefined,
    },
    options as SendEmailOptions
  )

  revalidatePath("/email")
  return result
}

export async function linkEmailToContact(
  messageId: string,
  contactId: string
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db.emailMessage.update({
    where: { id: messageId },
    data: { contactId },
  })

  revalidatePath("/email")
  return { success: true }
}

export async function linkEmailToCompany(
  messageId: string,
  companyId: string
) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("Unauthorized")
  }

  await db.emailMessage.update({
    where: { id: messageId },
    data: { companyId },
  })

  revalidatePath("/email")
  return { success: true }
}
