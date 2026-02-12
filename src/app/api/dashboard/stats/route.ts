import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    // Get counts
    const [
      totalMatters,
      activeMatters,
      pendingTasks,
      upcomingEvents,
      unreadMessages,
      timeEntries,
      invoices,
    ] = await Promise.all([
      db.matter.count(),
      db.matter.count({
        where: { status: { in: ['INTAKE', 'OPEN', 'IN_PROGRESS', 'PENDING'] } },
      }),
      db.task.count({
        where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      }),
      db.event.count({
        where: {
          startAt: { gte: now },
          endAt: { lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      db.message.count({
        where: { isRead: false },
      }),
      db.timeEntry.findMany({
        where: { isBillable: true },
      }),
      db.invoice.findMany({
        where: { status: { in: ['OVERDUE', 'PARTIAL', 'PAID', 'SENT'] } },
      }),
    ])

    // Calculate unbilled hours and amount
    const unbilledEntries = timeEntries.filter((te) => !te.isBilled)
    const unbilledHours = unbilledEntries.reduce((sum, te) => sum + te.hours, 0)
    const unbilledAmount = unbilledEntries.reduce((sum, te) => sum + te.hours * te.rate, 0)

    // Calculate overdue invoices
    const overdueInvoices = invoices.filter(
      (inv) => inv.status === 'OVERDUE' || (inv.status === 'SENT' && new Date(inv.dueDate) < now)
    )
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0)

    // Calculate revenue (paid invoices this month)
    const paidInvoices = invoices.filter((inv) => inv.status === 'PAID')
    const revenueThisMonth = paidInvoices
      .filter((inv) => new Date(inv.issueDate) >= startOfMonth && new Date(inv.issueDate) <= endOfMonth)
      .reduce((sum, inv) => sum + inv.paidAmount, 0)

    // Total revenue (all time)
    const revenue = paidInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0)

    const stats = {
      totalMatters,
      activeMatters,
      pendingTasks,
      upcomingEvents,
      unreadMessages,
      unbilledHours: Math.round(unbilledHours * 10) / 10,
      unbilledAmount,
      overdueInvoices: overdueInvoices.length,
      overdueAmount,
      revenue,
      revenueThisMonth,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch dashboard stats' } },
      { status: 500 }
    )
  }
}
