import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/billing - List invoices or get single invoice
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const clientId = searchParams.get('clientId')

    // Single invoice fetch
    if (id) {
      const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
          client: true,
          matter: true,
          timeEntries: {
            include: {
              user: true,
            }
          },
          lineItems: true,
          payments: true,
        },
      })
      
      if (!invoice) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: invoice })
    }

    // List invoices
    const invoices = await db.invoice.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(clientId && { clientId }),
      },
      include: {
        client: true,
        matter: true,
        _count: {
          select: {
            payments: true,
            lineItems: true,
          }
        },
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: invoices })
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch invoices' } },
      { status: 500 }
    )
  }
}

// POST /api/billing - Create invoice, generate from time entries, or record payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      clientId, 
      matterId, 
      issueDate, 
      dueDate, 
      lineItems, 
      notes, 
      terms,
      generateFromTimeEntries,
      timeEntryIds,
      recordPayment,
      paymentMethod,
      amount,
      reference,
      invoiceId 
    } = body

    // Generate invoice from time entries
    if (generateFromTimeEntries) {
      if (!clientId || !matterId || !timeEntryIds || timeEntryIds.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Client, matter, and time entries are required' } },
          { status: 400 }
        )
      }

      // Get time entries
      const entries = await db.timeEntry.findMany({
        where: {
          id: { in: timeEntryIds },
          isBilled: false,
        },
        include: {
          user: true,
          matter: true,
        }
      })

      if (entries.length === 0) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'No unbilled time entries found' } },
          { status: 400 }
        )
      }

      // Generate invoice number
      const currentYear = new Date().getFullYear()
      const invoiceCount = await db.invoice.count()
      const invoiceNumber = `INV-${currentYear}-${String(invoiceCount + 1).padStart(4, '0')}`

      // Create line items from time entries
      const items = entries.map(entry => ({
        description: `${entry.date.toISOString().split('T')[0]} - ${entry.description}`,
        quantity: entry.hours,
        rate: entry.rate,
        amount: entry.hours * entry.rate,
      }))

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0)

      // Create invoice
      const invoice = await db.invoice.create({
        data: {
          invoiceNumber,
          clientId,
          matterId,
          issueDate: new Date(),
          dueDate: new Date(dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000),
          subtotal,
          totalAmount: subtotal,
          paidAmount: 0,
          notes,
          terms: terms || 'Net 30',
          status: 'DRAFT',
          timeEntries: {
            connect: entries.map(e => ({ id: e.id }))
          },
          lineItems: {
            create: items
          }
        },
        include: {
          client: true,
          matter: true,
          lineItems: true,
        }
      })

      // Mark time entries as billed
      await db.timeEntry.updateMany({
        where: { id: { in: timeEntryIds } },
        data: { isBilled: true, invoiceId: invoice.id }
      })

      return NextResponse.json({ success: true, data: invoice })
    }

    // Record payment
    if (recordPayment) {
      if (!invoiceId || !amount || !paymentMethod) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invoice, amount, and payment method are required' } },
          { status: 400 }
        )
      }

      const invoice = await db.invoice.findUnique({
        where: { id: invoiceId }
      })

      if (!invoice) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } },
          { status: 404 }
        )
      }

      // Create payment record
      const payment = await db.payment.create({
        data: {
          clientId: invoice.clientId,
          invoiceId,
          amount,
          paymentMethod: paymentMethod as any,
          reference,
          paymentDate: new Date(),
        }
      })

      // Update invoice
      const newPaidAmount = invoice.paidAmount + amount
      let newStatus = invoice.status
      
      if (newPaidAmount >= invoice.totalAmount) {
        newStatus = 'PAID'
      } else if (newPaidAmount > 0) {
        newStatus = 'PARTIAL'
      }

      const updatedInvoice = await db.invoice.update({
        where: { id: invoiceId },
        data: {
          paidAmount: newPaidAmount,
          status: newStatus,
        },
        include: {
          client: true,
          payments: true,
        }
      })

      return NextResponse.json({ success: true, data: updatedInvoice })
    }

    // Create regular invoice
    if (!clientId || !lineItems || lineItems.length === 0) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Client and line items are required' } },
        { status: 400 }
      )
    }

    // Generate invoice number
    const currentYear = new Date().getFullYear()
    const invoiceCount = await db.invoice.count()
    const invoiceNumber = `INV-${currentYear}-${String(invoiceCount + 1).padStart(4, '0')}`

    const subtotal = lineItems.reduce((sum: number, item: { amount: number }) => sum + item.amount, 0)
    const totalAmount = subtotal

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        clientId,
        matterId,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        subtotal,
        totalAmount,
        paidAmount: 0,
        notes,
        terms,
        status: 'DRAFT',
        lineItems: {
          create: lineItems.map((item: { description: string; quantity: number; rate: number; amount: number }) => ({
            description: item.description,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          }))
        }
      },
      include: {
        client: true,
        lineItems: true,
      }
    })

    return NextResponse.json({ success: true, data: invoice })
  } catch (error) {
    console.error('Error processing billing request:', error)
    return NextResponse.json(
      { success: false, error: { code: 'ERROR', message: 'Failed to process billing request' } },
      { status: 500 }
    )
  }
}

// PATCH /api/billing - Update invoice
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invoice ID is required' } },
        { status: 400 }
      )
    }

    // Handle date fields
    if (updateData.issueDate) {
      updateData.issueDate = new Date(updateData.issueDate)
    }
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate)
    }

    const invoice = await db.invoice.update({
      where: { id },
      data: updateData,
      include: {
        client: true,
        matter: true,
      },
    })

    return NextResponse.json({ success: true, data: invoice })
  } catch (error: any) {
    console.error('Error updating invoice:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update invoice' } },
      { status: 500 }
    )
  }
}

// DELETE /api/billing - Delete invoice
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Invoice ID is required' } },
        { status: 400 }
      )
    }

    // Unlink time entries first
    await db.timeEntry.updateMany({
      where: { invoiceId: id },
      data: { invoiceId: null, isBilled: false }
    })

    await db.invoice.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    console.error('Error deleting invoice:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Invoice not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete invoice' } },
      { status: 500 }
    )
  }
}
