export type EmailProvider = "GMAIL" | "OUTLOOK" | "IMAP"

export interface EmailMessage {
  id: string
  threadId?: string
  from: { email: string; name?: string }
  to: Array<{ email: string; name?: string }>
  cc?: Array<{ email: string; name?: string }>
  bcc?: Array<{ email: string; name?: string }>
  subject?: string
  bodyText?: string
  bodyHtml?: string
  labels?: string[]
  isRead: boolean
  isStarred: boolean
  sentAt: Date
  receivedAt?: Date
  inReplyTo?: string
}

export interface EmailAccountConfig {
  provider: EmailProvider
  email: string
  displayName?: string
  accessToken: string
  refreshToken?: string
  imapHost?: string
  imapPort?: number
  smtpHost?: string
  smtpPort?: number
}

export interface SendEmailOptions {
  to: Array<{ email: string; name?: string }>
  cc?: Array<{ email: string; name?: string }>
  bcc?: Array<{ email: string; name?: string }>
  subject: string
  bodyText?: string
  bodyHtml?: string
  replyTo?: string
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType: string
  }>
}

export interface SyncResult {
  messages: EmailMessage[]
  lastMessageId?: string
  hasMore: boolean
}

export abstract class BaseEmailProvider {
  protected config: EmailAccountConfig

  constructor(config: EmailAccountConfig) {
    this.config = config
  }

  abstract connect(): Promise<boolean>
  abstract disconnect(): Promise<void>
  abstract syncMessages(lastMessageId?: string, limit?: number): Promise<SyncResult>
  abstract sendMessage(options: SendEmailOptions): Promise<{ id: string }>
  getFolders?(): Promise<Array<{ id: string; name: string; unreadCount: number }>>
  refreshToken?(): Promise<{ accessToken: string; refreshToken?: string }>
}

export function parseEmailAddress(address: string): { email: string; name?: string } {
  const match = address.match(/(?:"?([^"]*)"?\s)?(?:<)?([^>]+@[^>]+)(?:>)?/)
  if (match) {
    return {
      name: match[1]?.trim(),
      email: match[2].trim().toLowerCase(),
    }
  }
  return { email: address.trim().toLowerCase() }
}

export function formatEmailAddress(addr: { email: string; name?: string }): string {
  if (addr.name) {
    return `"${addr.name}" <${addr.email}>`
  }
  return addr.email
}
