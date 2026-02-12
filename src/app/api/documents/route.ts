import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// GET /api/documents - List documents or get single document
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')
    const matterId = searchParams.get('matterId')
    const clientId = searchParams.get('clientId')
    const category = searchParams.get('category')
    const authorId = searchParams.get('authorId')

    // Single document fetch
    if (id) {
      const document = await db.document.findUnique({
        where: { id },
        include: {
          matter: true,
          client: true,
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          },
        },
      })
      
      if (!document) {
        return NextResponse.json(
          { success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } },
          { status: 404 }
        )
      }
      
      return NextResponse.json({ success: true, data: document })
    }

    // List documents
    const where: any = {}
    if (matterId) where.matterId = matterId
    if (clientId) where.clientId = clientId
    if (category) where.category = category as any
    if (authorId) where.authorId = authorId

    const documents = await db.document.findMany({
      where,
      include: {
        matter: true,
        client: true,
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
      },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json({ success: true, data: documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch documents' } },
      { status: 500 }
    )
  }
}

// POST /api/documents - Upload document
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const matterId = formData.get('matterId') as string
    const clientId = formData.get('clientId') as string
    const authorId = formData.get('authorId') as string
    const category = formData.get('category') as string
    const isConfidential = formData.get('isConfidential') === 'true'
    const file = formData.get('file') as File

    if (!title || !authorId || !file) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Title, author, and file are required' } },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'documents')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const fileName = `${timestamp}-${originalName}`
    const filePath = path.join(uploadDir, fileName)

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // Save to database
    const document = await db.document.create({
      data: {
        title,
        description,
        matterId: matterId || null,
        clientId: clientId || null,
        authorId,
        category: (category as any) || 'OTHER',
        isConfidential,
        fileName: file.name,
        filePath: `/documents/${fileName}`,
        fileSize: file.size,
        fileType: file.type,
        status: 'DRAFT',
        version: 1,
      },
      include: {
        matter: true,
        client: true,
        author: {
          select: {
            id: true,
            name: true,
          }
        },
      }
    })

    return NextResponse.json({ success: true, data: document })
  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { success: false, error: { code: 'UPLOAD_ERROR', message: 'Failed to upload document' } },
      { status: 500 }
    )
  }
}

// PATCH /api/documents - Update document
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Document ID is required' } },
        { status: 400 }
      )
    }

    const document = await db.document.update({
      where: { id },
      data: updateData,
      include: {
        matter: true,
        client: true,
        author: {
          select: {
            id: true,
            name: true,
          }
        },
      },
    })

    return NextResponse.json({ success: true, data: document })
  } catch (error: any) {
    console.error('Error updating document:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'UPDATE_ERROR', message: 'Failed to update document' } },
      { status: 500 }
    )
  }
}

// DELETE /api/documents - Delete document
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: 'Document ID is required' } },
        { status: 400 }
      )
    }

    await db.document.delete({
      where: { id },
    })

    return NextResponse.json({ success: true, data: { id } })
  } catch (error: any) {
    console.error('Error deleting document:', error)
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { success: false, error: { code: 'DELETE_ERROR', message: 'Failed to delete document' } },
      { status: 500 }
    )
  }
}
