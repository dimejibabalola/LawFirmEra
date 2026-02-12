import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import * as bcrypt from 'bcryptjs'

// GET /api/users - List users
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const role = searchParams.get('role')
    const isActive = searchParams.get('isActive')

    const users = await db.user.findMany({
      where: {
        ...(role && { role: role as any }),
        ...(isActive && { isActive: isActive === 'true' }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatar: true,
        department: true,
        title: true,
        phone: true,
        hourlyRate: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ success: true, data: users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch users' } },
      { status: 500 }
    )
  }
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role, department, title, phone, barNumber, hourlyRate } = body

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'STAFF',
        department,
        title,
        phone,
        barNumber,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        department: true,
        title: true,
      }
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create user' } },
      { status: 500 }
    )
  }
}
