import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/crm/init - Initialize CRM with default data
export async function GET() {
  try {
    // Check if stages already exist
    const existingStages = await db.dealStage.count()
    
    if (existingStages > 0) {
      return NextResponse.json({ 
        message: 'CRM already initialized',
        stagesCount: existingStages 
      })
    }

    // Create default deal stages
    const defaultStages = await db.dealStage.createMany({
      data: [
        { name: 'Qualified', color: '#94A3B8', probability: 20, position: 0, isDefault: true },
        { name: 'Discovery', color: '#60A5FA', probability: 40, position: 1 },
        { name: 'Proposal', color: '#F59E0B', probability: 60, position: 2 },
        { name: 'Negotiation', color: '#A78BFA', probability: 80, position: 3 },
        { name: 'Closed Won', color: '#10B981', probability: 100, position: 4, isClosed: true },
      ]
    })

    return NextResponse.json({ 
      message: 'CRM initialized successfully',
      stagesCreated: defaultStages.count 
    }, { status: 201 })
  } catch (error) {
    console.error('Error initializing CRM:', error)
    return NextResponse.json(
      { error: 'Failed to initialize CRM' },
      { status: 500 }
    )
  }
}
