export type CalendarProvider = "GOOGLE" | "MICROSOFT" | "CALCOM"

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  location?: string
  startAt: Date
  endAt: Date
  isAllDay: boolean
  status: "CONFIRMED" | "TENTATIVE" | "CANCELLED"
  organizer?: { email: string; name?: string }
  attendees?: Array<{ email: string; name?: string; status?: string }>
  recurrence?: string
  calendarId: string
}

export interface CalendarConfig {
  provider: CalendarProvider
  name: string
  calendarId?: string
  accessToken: string
  refreshToken?: string
}

export interface SyncResult {
  events: CalendarEvent[]
  lastEventId?: string
  hasMore: boolean
}

export abstract class BaseCalendarProvider {
  protected config: CalendarConfig

  constructor(config: CalendarConfig) {
    this.config = config
  }

  abstract connect(): Promise<boolean>
  abstract disconnect(): Promise<void>
  abstract syncEvents(start: Date, end: Date): Promise<SyncResult>
  abstract createEvent(event: Partial<CalendarEvent>): Promise<{ id: string }>
  abstract updateEvent(id: string, event: Partial<CalendarEvent>): Promise<void>
  abstract deleteEvent(id: string): Promise<void>
  refreshToken?(): Promise<{ accessToken: string; refreshToken?: string }>
}
