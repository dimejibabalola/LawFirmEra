import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (query.length < 2) {
      return NextResponse.json({ success: true, results: [] })
    }

    const searchTerm = { contains: query }

    // Search across all entities
    const [
      matters,
      clients,
      tasks,
      events,
      invoices,
      users,
    ] = await Promise.all([
      db.matter.findMany({
        where: {
          OR: [
            { title: searchTerm },
            { description: searchTerm },
            { matterNumber: searchTerm },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          practiceArea: true,
          client: { select: { firstName: true, lastName: true, companyName: true } },
        },
      }),
      db.client.findMany({
        where: {
          OR: [
            { firstName: searchTerm },
            { lastName: searchTerm },
            { companyName: searchTerm },
            { email: searchTerm },
          ],
        },
        take: 5,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          companyName: true,
          email: true,
          clientType: true,
        },
      }),
      db.task.findMany({
        where: {
          OR: [
            { title: searchTerm },
            { description: searchTerm },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          priority: true,
        },
      }),
      db.event.findMany({
        where: {
          OR: [
            { title: searchTerm },
            { description: searchTerm },
            { location: searchTerm },
          ],
        },
        take: 5,
        select: {
          id: true,
          title: true,
          description: true,
          startAt: true,
          eventType: true,
        },
      }),
      db.invoice.findMany({
        where: {
          OR: [
            { invoiceNumber: searchTerm },
            { notes: searchTerm },
          ],
        },
        take: 5,
        select: {
          id: true,
          invoiceNumber: true,
          totalAmount: true,
          status: true,
          dueDate: true,
        },
      }),
      db.user.findMany({
        where: {
          OR: [
            { name: searchTerm },
            { email: searchTerm },
            { department: searchTerm },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          role: true,
        },
      }),
    ])

    // Transform results into unified format
    const results = [
      ...matters.map((m) => ({
        type: 'matter' as const,
        id: m.id,
        title: m.title,
        description: m.client
          ? `${m.client.companyName || `${m.client.firstName} ${m.client.lastName}`} - ${m.practiceArea}`
          : m.description || '',
        url: `/matters/${m.id}`,
      })),
      ...clients.map((c) => ({
        type: 'client' as const,
        id: c.id,
        title: c.companyName || `${c.firstName} ${c.lastName}`,
        description: c.email,
        url: `/clients/${c.id}`,
      })),
      ...tasks.map((t) => ({
        type: 'task' as const,
        id: t.id,
        title: t.title,
        description: `${t.status} - ${t.priority} priority`,
        url: `/tasks/${t.id}`,
      })),
      ...events.map((e) => ({
        type: 'event' as const,
        id: e.id,
        title: e.title,
        description: new Date(e.startAt).toLocaleDateString(),
        url: `/calendar`,
      })),
      ...invoices.map((i) => ({
        type: 'invoice' as const,
        id: i.id,
        title: i.invoiceNumber,
        description: `$${i.totalAmount.toLocaleString()} - ${i.status}`,
        url: `/billing/${i.id}`,
      })),
      ...users.map((u) => ({
        type: 'user' as const,
        id: u.id,
        title: u.name,
        description: `${u.role} - ${u.department || u.email}`,
        url: `/settings/users/${u.id}`,
      })),
    ]

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      { success: false, error: { code: 'SEARCH_ERROR', message: 'Failed to search' } },
      { status: 500 }
    )
  }
}
