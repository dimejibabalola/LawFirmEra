import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tasks - List tasks
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const status = searchParams.get('status')
    const assigneeId = searchParams.get('assigneeId')
    const matterId = searchParams.get('matterId')

    // Single task fetch
    if (id) {
      const task = await db.task.findUnique({
        where: { id },
        include: {
          matter: true,
          assignee: true,
          createdBy: true,
        },
      })
      
      if (!task) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Task not found' } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: task })
    }

    // List tasks
    const tasks = await db.task.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(assigneeId && { assigneeId }),
        ...(matterId && { matterId }),
      },
      include: {
        matter: true,
        assignee: true,
        createdBy: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: tasks })
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch tasks' } },
      { status: 500 }
    )
  }
}

// POST /api/tasks - Create task
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, matterId, assigneeId, createdById, priority, dueDate } = body

    if (!title || !assigneeId || !createdById) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title, assignee, and creator are required' } },
        { status: 400 }
      )
    }

    const task = await db.task.create({
      data: {
        title,
        description,
        matterId,
        assigneeId,
        createdById,
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
      },
      include: {
        matter: true,
        assignee: true,
      }
    })

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create task' } },
      { status: 500 }
    )
  }
}

// PATCH /api/tasks - Update task
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Task ID is required' } },
        { status: 400 }
      )
    }

    // Handle special fields
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate)
    }
    
    if (updateData.status === 'COMPLETED') {
      updateData.completedAt = new Date()
    }

    const task = await db.task.update({
      where: { id },
      data: updateData,
      include: {
        matter: true,
        assignee: true,
      },
    })

    return NextResponse.json({ success: true, data: task })
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update task' } },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks - Delete task
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Task ID is required' } },
        { status: 400 }
      )
    }

    await db.task.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete task' } },
      { status: 500 }
    )
  }
}
