import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/messages - List message threads or get single thread
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const threadId = searchParams.get('threadId')

    // Get single thread with all messages
    if (threadId) {
      const thread = await db.messageThread.findUnique({
        where: { id: threadId },
        include: {
          participants: true,
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                }
              },
            },
            orderBy: { sentAt: 'asc' }
          },
          matter: true,
        },
      })
      
      if (!thread) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Thread not found' } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: thread })
    }

    // List all threads
    const threads = await db.messageThread.findMany({
      include: {
        participants: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          }
        },
        messages: {
          take: 1,
          orderBy: { sentAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: threads })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch messages' } },
      { status: 500 }
    )
  }
}

// POST /api/messages - Send message or create thread
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { threadId, senderId, content, participantIds, subject, matterId, createThread } = body

    // Create new thread
    if (createThread || (!threadId && participantIds && subject)) {
      if (!participantIds || !subject) {
        return NextResponse.json(
          { success: false, error: { code: 'VALIDATION_ERROR', message: 'Participants and subject are required for new thread' } },
          { status: 400 }
        )
      }

      const thread = await db.messageThread.create({
        data: {
          subject,
          matterId,
          participants: {
            connect: participantIds.map((id: string) => ({ id }))
          }
        },
        include: {
          participants: true,
        }
      })

      // Create initial message
      const message = await db.message.create({
        data: {
          threadId: thread.id,
          senderId,
          content,
        },
        include: {
          sender: true,
        }
      })

      // Update thread last message time
      await db.messageThread.update({
        where: { id: thread.id },
        data: { lastMessageAt: new Date() }
      })

      return NextResponse.json({ success: true, data: { thread, message } })
    }

    // Add to existing thread
    if (!threadId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Thread ID is required' } },
        { status: 400 }
      )
    }

    const message = await db.message.create({
      data: {
        threadId,
        senderId,
        content,
      },
      include: {
        sender: true,
      }
    })

    // Update thread last message time
    await db.messageThread.update({
      where: { id: threadId },
      data: { lastMessageAt: new Date() }
    })

    return NextResponse.json({ success: true, data: { message } })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json(
      { success: false, error: { code: 'CREATE_ERROR', message: 'Failed to send message' } },
      { status: 500 }
    )
  }
}

// PATCH /api/messages - Mark messages as read
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { threadId, userId } = body

    if (!threadId || !userId) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Thread ID and user ID are required' } },
        { status: 400 }
      )
    }

    // Mark all messages in thread as read (except those sent by the user)
    await db.message.updateMany({
      where: {
        threadId,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true
      }
    })

    return NextResponse.json({ success: true, data: { message: 'Messages marked as read' } })
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to mark messages as read' } },
      { status: 500 }
    )
  }
}
