import {
  BaseEmailProvider,
  EmailMessage,
  SendEmailOptions,
  SyncResult,
  parseEmailAddress,
  formatEmailAddress,
} from "./base"

export class OutlookProvider extends BaseEmailProvider {
  private baseUrl = "https://graph.microsoft.com/v1.0"

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me`, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {
    // Outlook doesn't require explicit disconnect
  }

  async syncMessages(lastMessageId?: string, limit = 50): Promise<SyncResult> {
    const messages: EmailMessage[] = []
    let hasMore = false

    try {
      let url = `${this.baseUrl}/me/messages?$top=${limit}&$orderby=receivedDateTime desc&$select=id,conversationId,from,toRecipients,ccRecipients,bccRecipients,subject,body,internetMessageId,receivedDateTime,sentDateTime,isRead,flag,hasAttachments,inReplyTo`

      if (lastMessageId) {
        url += `&$skiptoken=${lastMessageId}`
      }

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })

      if (!response.ok) {
        throw new Error(`Outlook sync failed: ${response.status}`)
      }

      const data = await response.json()
      const items = data.value || []

      for (const item of items) {
        messages.push(this.parseOutlookMessage(item))
      }

      hasMore = !!data["@odata.nextLink"]

      return {
        messages,
        lastMessageId: data["@odata.nextLink"]
          ? new URL(data["@odata.nextLink"]).searchParams.get("$skiptoken") || undefined
          : undefined,
        hasMore,
      }
    } catch (error) {
      console.error("Outlook sync error:", error)
      throw error
    }
  }

  private parseOutlookMessage(data: any): EmailMessage {
    const from = data.from?.emailAddress
      ? { email: data.from.emailAddress.address, name: data.from.emailAddress.name }
      : { email: "" }

    const to = (data.toRecipients || []).map((r: any) => ({
      email: r.emailAddress?.address || "",
      name: r.emailAddress?.name,
    }))

    const cc = data.ccRecipients?.map((r: any) => ({
      email: r.emailAddress?.address || "",
      name: r.emailAddress?.name,
    }))

    const bcc = data.bccRecipients?.map((r: any) => ({
      email: r.emailAddress?.address || "",
      name: r.emailAddress?.name,
    }))

    return {
      id: data.id,
      threadId: data.conversationId,
      from,
      to,
      cc,
      bcc,
      subject: data.subject,
      bodyText: data.body?.contentType === "text" ? data.body.content : undefined,
      bodyHtml: data.body?.contentType === "html" ? data.body.content : undefined,
      labels: data.flag?.flagStatus === "flagged" ? ["FLAGGED"] : [],
      isRead: data.isRead,
      isStarred: data.flag?.flagStatus === "flagged",
      sentAt: new Date(data.sentDateTime),
      receivedAt: new Date(data.receivedDateTime),
      inReplyTo: data.inReplyTo?.[0]?.internetMessageId,
    }
  }

  async sendMessage(options: SendEmailOptions): Promise<{ id: string }> {
    const message: any = {
      subject: options.subject,
      body: {
        contentType: options.bodyHtml ? "html" : "text",
        content: options.bodyHtml || options.bodyText,
      },
      from: {
        emailAddress: {
          address: this.config.email,
          name: this.config.displayName,
        },
      },
      toRecipients: options.to.map((addr) => ({
        emailAddress: { address: addr.email, name: addr.name },
      })),
    }

    if (options.cc?.length) {
      message.ccRecipients = options.cc.map((addr) => ({
        emailAddress: { address: addr.email, name: addr.name },
      }))
    }

    if (options.bcc?.length) {
      message.bccRecipients = options.bcc.map((addr) => ({
        emailAddress: { address: addr.email, name: addr.name },
      }))
    }

    const response = await fetch(`${this.baseUrl}/me/sendMail`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Outlook send failed: ${error}`)
    }

    return { id: crypto.randomUUID() }
  }

  async refreshToken(): Promise<{ accessToken: string; refreshToken?: string }> {
    if (!this.config.refreshToken) {
      throw new Error("No refresh token available")
    }

    const response = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID!,
        client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
        refresh_token: this.config.refreshToken,
        grant_type: "refresh_token",
        scope: "https://graph.microsoft.com/.default",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh Outlook token")
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.config.refreshToken,
    }
  }
}
