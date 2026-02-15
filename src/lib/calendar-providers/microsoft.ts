import { BaseCalendarProvider, CalendarEvent, SyncResult } from "./base"

export class MicrosoftCalendarProvider extends BaseCalendarProvider {
  private baseUrl = "https://graph.microsoft.com/v1.0"

  async connect(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/me/calendars`, {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      })
      return response.ok
    } catch {
      return false
    }
  }

  async disconnect(): Promise<void> {}

  async syncEvents(start: Date, end: Date): Promise<SyncResult> {
    const calendarId = this.config.calendarId || "calendar"

    const response = await fetch(
      `${this.baseUrl}/me/calendars/${calendarId}/calendarView?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}&$orderby=start/dateTime`,
      {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      }
    )

    if (!response.ok) {
      throw new Error(`Microsoft Calendar sync failed: ${response.status}`)
    }

    const data = await response.json()
    const events: CalendarEvent[] = (data.value || []).map((item: any) => this.parseEvent(item))

    return { events, hasMore: !!data["@odata.nextLink"] }
  }

  private parseEvent(item: any): CalendarEvent {
    return {
      id: item.id,
      title: item.subject || "Untitled",
      description: item.body?.content,
      location: item.location?.displayName,
      startAt: new Date(item.start?.dateTime || item.start),
      endAt: new Date(item.end?.dateTime || item.end),
      isAllDay: item.isAllDay || false,
      status: item.responseStatus?.response?.toUpperCase() || "CONFIRMED",
      organizer: item.organizer?.emailAddress
        ? {
            email: item.organizer.emailAddress.address,
            name: item.organizer.emailAddress.name,
          }
        : undefined,
      attendees: item.attendees?.map((a: any) => ({
        email: a.emailAddress?.address,
        name: a.emailAddress?.name,
        status: a.status?.response,
      })),
      recurrence: item.recurrence ? JSON.stringify(item.recurrence) : undefined,
      calendarId: this.config.calendarId || "calendar",
    }
  }

  async createEvent(event: Partial<CalendarEvent>): Promise<{ id: string }> {
    const calendarId = this.config.calendarId || "calendar"

    const body = {
      subject: event.title,
      body: event.description ? { contentType: "html", content: event.description } : undefined,
      location: event.location ? { displayName: event.location } : undefined,
      start: {
        dateTime: event.startAt?.toISOString(),
        timeZone: "UTC",
      },
      end: {
        dateTime: event.endAt?.toISOString(),
        timeZone: "UTC",
      },
      isAllDay: event.isAllDay || false,
      attendees: event.attendees?.map((a) => ({
        emailAddress: { address: a.email, name: a.name },
      })),
    }

    const response = await fetch(`${this.baseUrl}/me/calendars/${calendarId}/events`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to create Microsoft Calendar event: ${error}`)
    }

    const data = await response.json()
    return { id: data.id }
  }

  async updateEvent(id: string, event: Partial<CalendarEvent>): Promise<void> {
    const calendarId = this.config.calendarId || "calendar"

    const body: any = {}
    if (event.title) body.subject = event.title
    if (event.description) body.body = { contentType: "html", content: event.description }
    if (event.location) body.location = { displayName: event.location }
    if (event.startAt) {
      body.start = { dateTime: event.startAt.toISOString(), timeZone: "UTC" }
    }
    if (event.endAt) {
      body.end = { dateTime: event.endAt.toISOString(), timeZone: "UTC" }
    }

    const response = await fetch(`${this.baseUrl}/me/calendars/${calendarId}/events/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error("Failed to update Microsoft Calendar event")
    }
  }

  async deleteEvent(id: string): Promise<void> {
    const calendarId = this.config.calendarId || "calendar"

    const response = await fetch(`${this.baseUrl}/me/calendars/${calendarId}/events/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${this.config.accessToken}` },
    })

    if (!response.ok && response.status !== 404) {
      throw new Error("Failed to delete Microsoft Calendar event")
    }
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
      throw new Error("Failed to refresh Microsoft Calendar token")
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token || this.config.refreshToken,
    }
  }
}
