import { BaseCalendarProvider, CalendarProvider, CalendarConfig, CalendarEvent, SyncResult } from "./base"
import { GoogleCalendarProvider } from "./google"
import { MicrosoftCalendarProvider } from "./microsoft"
import { CalComProvider } from "./calcom"

export {
  BaseCalendarProvider,
  GoogleCalendarProvider,
  MicrosoftCalendarProvider,
  CalComProvider,
}
export type { CalendarProvider, CalendarConfig, CalendarEvent, SyncResult }

export function createCalendarProvider(config: CalendarConfig): BaseCalendarProvider {
  switch (config.provider) {
    case "GOOGLE":
      return new GoogleCalendarProvider(config)
    case "MICROSOFT":
      return new MicrosoftCalendarProvider(config)
    case "CALCOM":
      return new CalComProvider(config)
    default:
      throw new Error(`Unknown calendar provider: ${config.provider}`)
  }
}

export async function syncCalendar(
  config: CalendarConfig,
  start: Date,
  end: Date
): Promise<SyncResult> {
  const provider = createCalendarProvider(config)
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
      throw new Error("Failed to connect to calendar provider")
    }
  }

  return provider.syncEvents(start, end)
}

export async function createCalendarEvent(
  config: CalendarConfig,
  event: Partial<CalendarEvent>
): Promise<{ id: string }> {
  const provider = createCalendarProvider(config)
  await provider.connect()
  return provider.createEvent(event)
}

export async function updateCalendarEvent(
  config: CalendarConfig,
  id: string,
  event: Partial<CalendarEvent>
): Promise<void> {
  const provider = createCalendarProvider(config)
  await provider.connect()
  return provider.updateEvent(id, event)
}

export async function deleteCalendarEvent(
  config: CalendarConfig,
  id: string
): Promise<void> {
  const provider = createCalendarProvider(config)
  await provider.connect()
  return provider.deleteEvent(id)
}
