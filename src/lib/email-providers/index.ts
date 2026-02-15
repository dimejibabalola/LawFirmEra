import { BaseEmailProvider, EmailProvider, EmailAccountConfig, EmailMessage, SendEmailOptions, SyncResult } from "./base"
import { GmailProvider } from "./gmail"
import { OutlookProvider } from "./outlook"
import { ImapProvider } from "./imap"

export { BaseEmailProvider, GmailProvider, OutlookProvider, ImapProvider }
export type { EmailProvider, EmailAccountConfig, EmailMessage, SendEmailOptions, SyncResult }

export function createEmailProvider(config: EmailAccountConfig): BaseEmailProvider {
  switch (config.provider) {
    case "GMAIL":
      return new GmailProvider(config)
    case "OUTLOOK":
      return new OutlookProvider(config)
    case "IMAP":
      return new ImapProvider(config)
    default:
      throw new Error(`Unknown email provider: ${config.provider}`)
  }
}

export async function syncEmailAccount(
  config: EmailAccountConfig,
  lastMessageId?: string,
  limit = 50
): Promise<SyncResult> {
  const provider = createEmailProvider(config)
  const connected = await provider.connect()

  if (!connected) {
    if (provider.refreshToken && config.refreshToken) {
      const tokens = await provider.refreshToken()
      config.accessToken = tokens.accessToken
      if (tokens.refreshToken) {
        config.refreshToken = tokens.refreshToken
      }

      const retryConnected = await provider.connect()
      if (!retryConnected) {
        throw new Error("Failed to connect after token refresh")
      }
    } else {
      throw new Error("Failed to connect to email provider")
    }
  }

  return provider.syncMessages(lastMessageId, limit)
}

export async function sendEmail(
  config: EmailAccountConfig,
  options: SendEmailOptions
): Promise<{ id: string }> {
  const provider = createEmailProvider(config)
  await provider.connect()
  return provider.sendMessage(options)
}
