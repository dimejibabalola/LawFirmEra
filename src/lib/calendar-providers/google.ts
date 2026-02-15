import { BaseCalendarProvider, CalendarEvent, SyncResult } from "./base"

export class GoogleCalendarProvider extends BaseCalendarProvider {
  private baseUrl = "https://www.googleapis.com/calendar/v3"

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me/calendarList`, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {}

  async syncEvents(start: Date, end: Date): Promise<SyncResult> {
    const calendarId = this.config.calendarId || "primary"

    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${start.toISOString()}&timeMax=${end.toISOString()}&singleEvents=true&orderBy=startTime`,
      {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      }
    )

    if (!response.ok) {
      throw new Error(`Google Calendar sync failed: ${response.status}`)
    }

    const data = await response.json()
    const events: CalendarEvent[] = (data.items || []).map((item: any) => this.parseEvent(item))

    return { events, hasMore: false }
  }

  private parseEvent(item: any): CalendarEvent {
    const start = item.start?.dateTime || item.start?.date
    const end = item.end?.dateTime || item.end?.date

    return {
      id: item.id,
      title: item.summary || "Untitled",
      description: item.description,
      location: item.location,
      startAt: new Date(start),
      endAt: new Date(end),
      isAllDay: !!item.start?.date,
      status: item.status?.toUpperCase() || "CONFIRMED",
      organizer: item.organizer
        ? { email: item.organizer.email, name: item.organizer.displayName }
        : undefined,
      attendees: item.attendees?.map((a: any) => ({
        email: a.email,
        name: a.displayName,
        status: a.responseStatus,
      })),
      recurrence: item.recurrence?.[0],
      calendarId: this.config.calendarId || "primary",
    }
  }

  async createEvent(event: Partial<CalendarEvent>): Promise<{ id: string }> {
    const calendarId = this.config.calendarId || "primary"

    const body = {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: event.isAllDay
        ? { date: event.startAt?.toISOString().split("T")[0] }
        : { dateTime: event.startAt?.toISOString() },
      end: event.isAllDay
        ? { date: event.endAt?.toISOString().split("T")[0] }
        : { dateTime: event.endAt?.toISOString() },
      attendees: event.attendees?.map((a) => ({ email: a.email })),
    }

    const response = await fetch(`${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create Google Calendar event: ${error}`)
    }

    const data = await response.json()
    return { id: data.id }
  }

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<void> {
    const calendarId = this.config.calendarId || "primary"

    const body: any = {}
    if (event.title) body.summary = event.title
    if (event.description) body.description = event.description
    if (event.location) body.location = event.location
    if (event.startAt) {
      body.start = event.isAllDay
        ? { date: event.startAt.toISOString().split("T")[0] }
        : { dateTime: event.startAt.toISOString() }
    }
    if (event.endAt) {
      body.end = event.isAllDay
        ? { date: event.endAt.toISOString().split("T")[0] }
        : { dateTime: event.endAt.toISOString() }
    }

    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${id}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update Google Calendar event`)
    }
  }

  async deleteEvent(id: string): Promise<void> {
    const calendarId = this.config.calendarId || "primary"

    const response = await fetch(
      `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      }
    )

    if (!response.ok && response.status !== 410) {
      throw new Error(`Failed to delete Google Calendar event`)
    }
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
      throw new Error("Failed to refresh Google Calendar token")
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.config.refreshToken,
    }
  }
}
