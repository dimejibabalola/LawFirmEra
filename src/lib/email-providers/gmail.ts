import {
  BaseEmailProvider,
  EmailMessage,
  SendEmailOptions,
  SyncResult,
  parseEmailAddress,
  formatEmailAddress,
} from "./base"

export class GmailProvider extends BaseEmailProvider {
  private baseUrl = "https://gmail.googleapis.com/gmail/v1"

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/profile`, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {
    // Gmail doesn't require explicit disconnect
  }

  async syncMessages(lastMessageId?: string, limit = 50): Promise<SyncResult> {
    const messages: EmailMessage[] = []
    let hasMore = false

    try {
      let listUrl = `${this.baseUrl}/users/me/messages?maxResults=${limit}`
      if (lastMessageId) {
        listUrl += `&pageToken=${lastMessageId}`
      }

      const listResponse = await fetch(listUrl, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })

      if (!listResponse.ok) {
        throw new Error(`Gmail list failed: ${listResponse.status}`)
      }

      const listData = await listResponse.json()
      const messageIds = listData.messages?.map((m: { id: string }) => m.id) || []

      if (messageIds.length === 0) {
        return { messages: [], hasMore: false }
      }

      hasMore = !!listData.nextPageToken

      for (const messageId of messageIds) {
        const message = await this.fetchMessage(messageId)
        if (message) {
          messages.push(message)
        }
      }

      return {
        messages,
        lastMessageId: listData.nextPageToken,
        hasMore,
      }
    } catch (error) {
      console.error("Gmail sync error:", error)
      throw error
    }
  }

  private async fetchMessage(messageId: string): Promise<EmailMessage | null> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })

      if (!response.ok) return null

      const data = await response.json()
      return this.parseGmailMessage(data)
    } catch {
      return null
    }
  }

  private parseGmailMessage(data: any): EmailMessage {
    const headers: Record<string, string> = {}
    data.payload?.headers?.forEach((h: { name: string; value: string }) => {
      headers[h.name.toLowerCase()] = h.value
    })

    const from = parseEmailAddress(headers["from"] || "")
    const to = (headers["to"] || "").split(",").map(parseEmailAddress)
    const cc = headers["cc"] ? headers["cc"].split(",").map(parseEmailAddress) : undefined
    const bcc = headers["bcc"] ? headers["bcc"].split(",").map(parseEmailAddress) : undefined

    let bodyText = ""
    let bodyHtml = ""

    const extractBody = (payload: any) => {
      if (payload.body?.data) {
        const decoded = Buffer.from(payload.body.data, "base64").toString("utf-8")
        if (payload.mimeType === "text/plain") bodyText = decoded
        if (payload.mimeType === "text/html") bodyHtml = decoded
      }
      if (payload.parts) {
        payload.parts.forEach(extractBody)
      }
    }

    extractBody(data.payload)

    const labels = data.labelIds || []

    return {
      id: data.id,
      threadId: data.threadId,
      from,
      to,
      cc,
      bcc,
      subject: headers["subject"],
      bodyText,
      bodyHtml,
      labels,
      isRead: !labels.includes("UNREAD"),
      isStarred: labels.includes("STARRED"),
      sentAt: new Date(parseInt(data.internalDate)),
      receivedAt: new Date(parseInt(data.internalDate)),
      inReplyTo: headers["in-reply-to"],
    }
  }

  async sendMessage(options: SendEmailOptions): Promise<{ id: string }> {
    const boundary = `boundary_${Date.now()}`
    const lines: string[] = []

    lines.push(`From: ${formatEmailAddress({ email: this.config.email, name: this.config.displayName })}`)
    lines.push(`To: ${options.to.map(formatEmailAddress).join(", ")}`)
    if (options.cc?.length) {
      lines.push(`Cc: ${options.cc.map(formatEmailAddress).join(", ")}`)
    }
    if (options.bcc?.length) {
      lines.push(`Bcc: ${options.bcc.map(formatEmailAddress).join(", ")}`)
    }
    lines.push(`Subject: =?utf-8?B?${Buffer.from(options.subject).toString("base64")}?=`)
    if (options.replyTo) {
      lines.push(`Reply-To: ${options.replyTo}`)
    }
    lines.push("MIME-Version: 1.0")
    lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`)
    lines.push("")

    if (options.bodyText) {
      lines.push(`--${boundary}`)
      lines.push("Content-Type: text/plain; charset=utf-8")
      lines.push("Content-Transfer-Encoding: quoted-printable")
      lines.push("")
      lines.push(options.bodyText)
    }

    if (options.bodyHtml) {
      lines.push(`--${boundary}`)
      lines.push("Content-Type: text/html; charset=utf-8")
      lines.push("Content-Transfer-Encoding: quoted-printable")
      lines.push("")
      lines.push(options.bodyHtml)
    }

    lines.push(`--${boundary}--`)

    const raw = Buffer.from(lines.join("\r\n"))
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "")

    const response = await fetch(`${this.baseUrl}/users/me/messages/send`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ raw }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gmail send failed: ${error}`)
    }

    const data = await response.json()
    return { id: data.id }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken?: string }> {
    if (!this.config.refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: this.config.refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh Gmail token")
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.config.refreshToken,
    }
  }
}
