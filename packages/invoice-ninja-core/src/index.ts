/**
 * Invoice Ninja Core - Source Level Integration
 * 
 * This package provides Invoice Ninja functionality directly in LegalFlow
 * WITHOUT using HTTP APIs - direct database and calculation imports.
 * 
 * Based on Invoice Ninja open source calculation utilities
 */

import React from 'react'
import { DollarSign, Percent, Calendar, FileText, Send, Download, Printer, Eye, MoreHorizontal, Plus, Trash2, Copy } from 'lucide-react'
import { format, parseISO, addDays, differenceInDays } from 'date-fns'
import { cn } from './utils'

// ============================================
// Calculation Utilities (Ported from Invoice Ninja)
// ============================================

export interface InvoiceItem {
  id?: string
  productKey?: string
  notes?: string
  cost: number
  quantity: number
  taxRate1?: number
  taxName1?: string
  taxRate2?: number
  taxName2?: string
  taxRate3?: number
  taxName3?: string
  discount?: number
  isAmountDiscount?: boolean
}

export interface InvoiceTotals {
  subTotal: number
  taxTotal: number
  discountTotal: number
  taxBreakdown: TaxBreakdown[]
  total: number
  lineItems: CalculatedLineItem[]
}

export interface TaxBreakdown {
  name: string
  rate: number
  amount: number
}

export interface CalculatedLineItem extends InvoiceItem {
  lineTotal: number
  grossTotal: number
  taxAmount: number
  discountAmount: number
}

/**
 * Calculate invoice totals
 * Ported from Invoice Ninja's InvoiceCalc class
 */
export function calculateInvoiceTotals(
  items: InvoiceItem[],
  options: {
    discount?: number
    isAmountDiscount?: boolean
    customTax1?: number
    customTax2?: number
    taxAll?: boolean
    inclusiveTax?: boolean
  } = {}
): InvoiceTotals {
  const { discount = 0, isAmountDiscount = false, taxAll = true, inclusiveTax = false } = options

  let subTotal = 0
  let taxTotal = 0
  let discountTotal = 0
  const taxBreakdown: TaxBreakdown[] = []
  const lineItems: CalculatedLineItem[] = []

  // Process each line item
  for (const item of items) {
    const lineTotal = item.cost * item.quantity
    const itemDiscount = item.discount || 0
    
    // Calculate discount
    let discountAmount = 0
    if (itemDiscount > 0) {
      if (item.isAmountDiscount) {
        discountAmount = itemDiscount
      } else {
        discountAmount = lineTotal * (itemDiscount / 100)
      }
    }

    const grossTotal = lineTotal - discountAmount

    // Calculate taxes
    let taxAmount = 0
    
    // Tax 1
    if (item.taxRate1 && item.taxRate1 > 0) {
      const tax1Amount = grossTotal * (item.taxRate1 / 100)
      taxAmount += tax1Amount
      
      addTaxBreakdown(taxBreakdown, item.taxName1 || 'Tax 1', item.taxRate1, tax1Amount)
    }

    // Tax 2
    if (item.taxRate2 && item.taxRate2 > 0) {
      const tax2Amount = grossTotal * (item.taxRate2 / 100)
      taxAmount += tax2Amount
      
      addTaxBreakdown(taxBreakdown, item.taxName2 || 'Tax 2', item.taxRate2, tax2Amount)
    }

    // Tax 3
    if (item.taxRate3 && item.taxRate3 > 0) {
      const tax3Amount = grossTotal * (item.taxRate3 / 100)
      taxAmount += tax3Amount
      
      addTaxBreakdown(taxBreakdown, item.taxName3 || 'Tax 3', item.taxRate3, tax3Amount)
    }

    lineItems.push({
      ...item,
      lineTotal,
      grossTotal,
      taxAmount,
      discountAmount
    })

    subTotal += lineTotal
    discountTotal += discountAmount
    taxTotal += taxAmount
  }

  // Apply invoice-level discount
  let invoiceDiscount = 0
  if (discount > 0) {
    if (isAmountDiscount) {
      invoiceDiscount = discount
    } else {
      invoiceDiscount = subTotal * (discount / 100)
    }
    discountTotal += invoiceDiscount
  }

  // Calculate final total
  const total = subTotal - discountTotal + taxTotal

  return {
    subTotal,
    taxTotal,
    discountTotal,
    taxBreakdown,
    total,
    lineItems
  }
}

function addTaxBreakdown(
  breakdown: TaxBreakdown[],
  name: string,
  rate: number,
  amount: number
) {
  const existing = breakdown.find(t => t.name === name)
  if (existing) {
    existing.amount += amount
  } else {
    breakdown.push({ name, rate, amount })
  }
}

/**
 * Calculate payment terms due date
 */
export function calculateDueDate(
  issueDate: Date,
  terms: 'due_on_receipt' | 'net_7' | 'net_10' | 'net_15' | 'net_30' | 'net_45' | 'net_60' | 'net_90' | 'custom',
  customDays?: number
): Date {
  switch (terms) {
    case 'due_on_receipt':
      return issueDate
    case 'net_7':
      return addDays(issueDate, 7)
    case 'net_10':
      return addDays(issueDate, 10)
    case 'net_15':
      return addDays(issueDate, 15)
    case 'net_30':
      return addDays(issueDate, 30)
    case 'net_45':
      return addDays(issueDate, 45)
    case 'net_60':
      return addDays(issueDate, 60)
    case 'net_90':
      return addDays(issueDate, 90)
    case 'custom':
      return addDays(issueDate, customDays || 30)
    default:
      return addDays(issueDate, 30)
  }
}

/**
 * Calculate late fee
 */
export function calculateLateFee(
  invoiceTotal: number,
  balanceDue: number,
  dueDate: Date,
  lateFeePercent: number = 0,
  lateFeeAmount: number = 0
): { lateFeeAmount: number; daysOverdue: number } {
  const today = new Date()
  const daysOverdue = differenceInDays(today, dueDate)

  if (daysOverdue <= 0) {
    return { lateFeeAmount: 0, daysOverdue: 0 }
  }

  let fee = lateFeeAmount
  if (lateFeePercent > 0) {
    fee += balanceDue * (lateFeePercent / 100)
  }

  return { lateFeeAmount: fee, daysOverdue }
}

/**
 * Calculate partial payments
 */
export function calculatePartialPayment(
  total: number,
  paidAmount: number,
  newPayment: number
): { newPaidAmount: number; newBalance: number; isFullyPaid: boolean } {
  const newPaidAmount = paidAmount + newPayment
  const newBalance = total - newPaidAmount
  const isFullyPaid = newBalance <= 0

  return { newPaidAmount, newBalance, isFullyPaid }
}

/**
 * Format currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Generate invoice number
 */
export function generateInvoiceNumber(
  prefix: string = 'INV',
  format: 'PREFIX-NNNN' | 'PREFIX-YYYY-NNNN' | 'YYYY-NNNN' | 'NNNN' = 'PREFIX-YYYY-NNNN',
  lastNumber: number = 0
): string {
  const year = new Date().getFullYear()
  const nextNum = (lastNumber + 1).toString().padStart(4, '0')

  switch (format) {
    case 'PREFIX-NNNN':
      return `${prefix}-${nextNum}`
    case 'PREFIX-YYYY-NNNN':
      return `${prefix}-${year}-${nextNum}`
    case 'YYYY-NNNN':
      return `${year}-${nextNum}`
    case 'NNNN':
      return nextNum
    default:
      return `${prefix}-${year}-${nextNum}`
  }
}

// ============================================
// Invoice Builder Component
// ============================================

interface InvoiceBuilderProps {
  invoice?: {
    id?: string
    number?: string
    clientId?: string
    items?: InvoiceItem[]
    discount?: number
    isAmountDiscount?: boolean
    issueDate?: string
    dueDate?: string
    notes?: string
    footer?: string
  }
  clients: Array<{ id: string; name: string; email: string }>
  onSave: (data: InvoiceData) => Promise<void>
  onSend?: (invoiceId: string) => Promise<void>
  className?: string
}

export interface InvoiceData {
  number: string
  clientId: string
  items: InvoiceItem[]
  discount: number
  isAmountDiscount: boolean
  issueDate: string
  dueDate: string
  notes?: string
  footer?: string
  totals: InvoiceTotals
}

export function InvoiceBuilder({ invoice, clients, onSave, onSend, className }: InvoiceBuilderProps) {
  const [items, setItems] = React.useState<InvoiceItem[]>(invoice?.items || [])
  const [clientId, setClientId] = React.useState(invoice?.clientId || '')
  const [discount, setDiscount] = React.useState(invoice?.discount || 0)
  const [isAmountDiscount, setIsAmountDiscount] = React.useState(invoice?.isAmountDiscount || false)
  const [issueDate, setIssueDate] = React.useState(invoice?.issueDate || format(new Date(), 'yyyy-MM-dd'))
  const [dueDate, setDueDate] = React.useState(invoice?.dueDate || format(addDays(new Date(), 30), 'yyyy-MM-dd'))
  const [notes, setNotes] = React.useState(invoice?.notes || '')
  const [isSaving, setIsSaving] = React.useState(false)

  const totals = calculateInvoiceTotals(items, { discount, isAmountDiscount })

  const addItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        productKey: '',
        notes: '',
        cost: 0,
        quantity: 1,
        taxRate1: 0,
        taxName1: 'Tax'
      }
    ])
  }

  const updateItem = (index: number, updates: Partial<InvoiceItem>) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], ...updates }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const duplicateItem = (index: number) => {
    const newItem = { ...items[index], id: crypto.randomUUID() }
    setItems([...items.slice(0, index + 1), newItem, ...items.slice(index + 1)])
  }

  const handleSave = async () => {
    if (!clientId) {
      alert('Please select a client')
      return
    }

    setIsSaving(true)
    try {
      await onSave({
        number: invoice?.number || generateInvoiceNumber(),
        clientId,
        items,
        discount,
        isAmountDiscount,
        issueDate,
        dueDate,
        notes,
        totals
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200", className)}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {invoice?.id ? 'Edit Invoice' : 'New Invoice'}
            </h2>
            <p className="text-gray-500 text-sm">{invoice?.number || 'Draft'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            {invoice?.id && onSend && (
              <button
                onClick={() => onSend(invoice.id)}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="p-6 space-y-6">
        {/* Client & Dates */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="">Select client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Line Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">Line Items</label>
            <button
              onClick={addItem}
              className="text-sm text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Item
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-3 w-[200px]">Product/Service</th>
                  <th className="text-left p-3 w-[200px]">Description</th>
                  <th className="text-right p-3 w-[100px]">Cost</th>
                  <th className="text-right p-3 w-[80px]">Qty</th>
                  <th className="text-right p-3 w-[80px]">Tax %</th>
                  <th className="text-right p-3 w-[100px]">Line Total</th>
                  <th className="w-[60px]"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={item.id || idx} className="border-t border-gray-100">
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.productKey || ''}
                        onChange={(e) => updateItem(idx, { productKey: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-200 rounded"
                        placeholder="Product key"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="text"
                        value={item.notes || ''}
                        onChange={(e) => updateItem(idx, { notes: e.target.value })}
                        className="w-full px-2 py-1 border border-gray-200 rounded"
                        placeholder="Description"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.01"
                        value={item.cost}
                        onChange={(e) => updateItem(idx, { cost: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-right"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.25"
                        value={item.quantity}
                        onChange={(e) => updateItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-right"
                      />
                    </td>
                    <td className="p-2">
                      <input
                        type="number"
                        step="0.1"
                        value={item.taxRate1 || 0}
                        onChange={(e) => updateItem(idx, { taxRate1: parseFloat(e.target.value) || 0 })}
                        className="w-full px-2 py-1 border border-gray-200 rounded text-right"
                      />
                    </td>
                    <td className="p-2 text-right font-medium">
                      {formatCurrency(totals.lineItems[idx]?.lineTotal || 0)}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => duplicateItem(idx)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeItem(idx)}
                          className="p-1 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span>{formatCurrency(totals.subTotal)}</span>
            </div>
            {totals.discountTotal > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="text-red-600">-{formatCurrency(totals.discountTotal)}</span>
              </div>
            )}
            {totals.taxBreakdown.map((tax, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-500">{tax.name} ({tax.rate}%)</span>
                <span>{formatCurrency(tax.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        {/* Discount */}
        <div className="flex items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <select
                value={isAmountDiscount ? 'amount' : 'percent'}
                onChange={(e) => setIsAmountDiscount(e.target.value === 'amount')}
                className="px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="percent">%</option>
                <option value="amount">$</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Notes visible to client"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Footer</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Invoice footer text"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Export everything
export default {
  calculateInvoiceTotals,
  calculateDueDate,
  calculateLateFee,
  calculatePartialPayment,
  formatCurrency,
  generateInvoiceNumber,
  InvoiceBuilder,
}
