import { BaseEmailProvider, EmailMessage, SendEmailOptions, SyncResult, parseEmailAddress, formatEmailAddress } from "./base"

interface ImapMessage {
  uid: number
  headers: Record<string, string>
  body: string
  flags: string[]
  date: Date
}

export class ImapProvider extends BaseEmailProvider {
  async connect(): Promise<boolean> {
    if (!this.config.imapHost || !this.config.smtpHost) {
      throw new Error("IMAP/SMTP host not configured")
    }
    return true
  }

  async disconnect(): Promise<void> {
    // Connection closed after each operation
  }

  async syncMessages(lastMessageId?: string, limit = 50): Promise<SyncResult> {
    console.log(`[IMAP] Syncing from ${this.config.imapHost}`)
    
    const messages: EmailMessage[] = []
    
    return {
      messages,
      lastMessageId: undefined,
      hasMore: false,
    }
  }

  async sendMessage(options: SendEmailOptions): Promise<{ id: string }> {
    const messageId = crypto.randomUUID()
    
    console.log(`[IMAP] Sending via ${this.config.smtpHost}:${this.config.smtpPort || 587}`)
    console.log(`[IMAP] From: ${this.config.email}`)
    console.log(`[IMAP] To: ${options.to.map((a) => a.email).join(", ")}`)
    console.log(`[IMAP] Subject: ${options.subject}`)

    return { id: messageId }
  }

  private parseImapMessage(msg: ImapMessage): EmailMessage {
    const from = parseEmailAddress(msg.headers["from"] || "")
    const to = (msg.headers["to"] || "").split(",").map(parseEmailAddress)
    const cc = msg.headers["cc"] ? msg.headers["cc"].split(",").map(parseEmailAddress) : undefined

    return {
      id: String(msg.uid),
      threadId: msg.headers["message-id"],
      from,
      to,
      cc,
      subject: msg.headers["subject"],
      bodyText: msg.body,
      labels: msg.flags,
      isRead: !msg.flags.includes("\\Seen"),
      isStarred: msg.flags.includes("\\Flagged"),
      sentAt: msg.date,
      receivedAt: msg.date,
      inReplyTo: msg.headers["in-reply-to"],
    }
  }
}
