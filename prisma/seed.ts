import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed data...')

  // Clean database by deleting and recreating
  await prisma.$executeRaw`DELETE FROM notifications`
  await prisma.$executeRaw`DELETE FROM activities`
  await prisma.$executeRaw`DELETE FROM messages`
  await prisma.$executeRaw`DELETE FROM message_threads`
  await prisma.$executeRaw`DELETE FROM trust_transactions`
  await prisma.$executeRaw`DELETE FROM trust_accounts`
  await prisma.$executeRaw`DELETE FROM payments`
  await prisma.$executeRaw`DELETE FROM invoice_line_items`
  await prisma.$executeRaw`DELETE FROM invoices`
  await prisma.$executeRaw`DELETE FROM time_entries`
  await prisma.$executeRaw`DELETE FROM documents`
  await prisma.$executeRaw`DELETE FROM tasks`
  await prisma.$executeRaw`DELETE FROM events`
  await prisma.$executeRaw`DELETE FROM matters`
  await prisma.$executeRaw`DELETE FROM contacts`
  await prisma.$executeRaw`DELETE FROM clients`
  await prisma.$executeRaw`DELETE FROM crm_notes`
  await prisma.$executeRaw`DELETE FROM crm_activities`
  await prisma.$executeRaw`DELETE FROM deals`
  await prisma.$executeRaw`DELETE FROM deal_stages`
  await prisma.$executeRaw`DELETE FROM crm_contacts`
  await prisma.$executeRaw`DELETE FROM crm_companies`
  await prisma.$executeRaw`DELETE FROM integrations`
  await prisma.$executeRaw`DELETE FROM users`

  console.log('Creating users...')

  const hashedPassword = await bcrypt.hash('password123', 10)

  const johnDoe = await prisma.user.create({
    data: {
      email: 'john.doe@lawfirm.com',
      password: hashedPassword,
      name: 'John Doe',
      role: 'PARTNER',
      department: 'Corporate Law',
      title: 'Managing Partner',
      barNumber: 'NY123456',
      hourlyRate: 550,
      phone: '+1 (555) 123-4567',
      isActive: true,
    },
  })

  const sarahJohnson = await prisma.user.create({
    data: {
      email: 'sarah.johnson@lawfirm.com',
      password: hashedPassword,
      name: 'Sarah Johnson',
      role: 'ASSOCIATE',
      department: 'Litigation',
      title: 'Senior Associate',
      barNumber: 'NY234567',
      hourlyRate: 425,
      phone: '+1 (555) 234-5678',
      isActive: true,
    },
  })

  const michaelChen = await prisma.user.create({
    data: {
      email: 'michael.chen@lawfirm.com',
      password: hashedPassword,
      name: 'Michael Chen',
      role: 'PARALEGAL',
      department: 'Corporate Law',
      title: 'Senior Paralegal',
      phone: '+1 (555) 345-6789',
      isActive: true,
    },
  })

  const emilyWilliams = await prisma.user.create({
    data: {
      email: 'emily.williams@lawfirm.com',
      password: hashedPassword,
      name: 'Emily Williams',
      role: 'ASSOCIATE',
      department: 'Estate Planning',
      title: 'Associate',
      barNumber: 'NY345678',
      hourlyRate: 350,
      phone: '+1 (555) 456-7890',
      isActive: true,
    },
  })

  const davidBrown = await prisma.user.create({
    data: {
      email: 'david.brown@lawfirm.com',
      password: hashedPassword,
      name: 'David Brown',
      role: 'ADMIN',
      department: 'Administration',
      title: 'System Administrator',
      phone: '+1 (555) 567-8901',
      isActive: true,
    },
  })

  console.log('Creating clients...')

  const smithHoldings = await prisma.client.create({
    data: {
      firstName: 'Robert',
      lastName: 'Smith',
      companyName: 'Smith Holdings LLC',
      email: 'robert.smith@smithholdings.com',
      phone: '+1 (555) 111-1111',
      address: '100 Business Ave',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      clientType: 'BUSINESS',
      industry: 'Real Estate',
      status: 'ACTIVE',
    },
  })

  const techStart = await prisma.client.create({
    data: {
      firstName: 'Jennifer',
      lastName: 'Martinez',
      companyName: 'TechStart Inc.',
      email: 'jennifer@techstart.io',
      phone: '+1 (555) 222-2222',
      address: '200 Innovation Way',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      clientType: 'BUSINESS',
      industry: 'Technology',
      status: 'ACTIVE',
    },
  })

  const williamsFamily = await prisma.client.create({
    data: {
      firstName: 'William',
      lastName: 'Williams',
      email: 'william.williams@email.com',
      phone: '+1 (555) 333-3333',
      address: '300 Family Lane',
      city: 'Boston',
      state: 'MA',
      zipCode: '02101',
      clientType: 'INDIVIDUAL',
      status: 'ACTIVE',
    },
  })

  const taylorInd = await prisma.client.create({
    data: {
      firstName: 'Elizabeth',
      lastName: 'Taylor',
      companyName: 'Taylor Industries',
      email: 'elizabeth@taylorind.com',
      phone: '+1 (555) 444-4444',
      address: '400 Industrial Blvd',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      clientType: 'BUSINESS',
      industry: 'Manufacturing',
      status: 'ACTIVE',
    },
  })

  console.log('Creating matters...')

  const smithLitigation = await prisma.matter.create({
    data: {
      matterNumber: '2024-001',
      clientId: smithHoldings.id,
      title: 'Smith v. Johnson Corp',
      description: 'Commercial litigation matter regarding breach of contract dispute',
      practiceArea: 'LITIGATION',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      leadAttorneyId: sarahJohnson.id,
      estimatedHours: 120,
      billingType: 'HOURLY',
      openDate: new Date('2024-01-15'),
      notes: 'Discovery phase underway',
    },
  })

  const techMerger = await prisma.matter.create({
    data: {
      matterNumber: '2024-002',
      clientId: techStart.id,
      title: 'Merger Agreement - TechStart Inc',
      description: 'Acquisition merger agreement and due diligence',
      practiceArea: 'CORPORATE',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      leadAttorneyId: johnDoe.id,
      estimatedHours: 80,
      billingType: 'HOURLY',
      openDate: new Date('2024-02-01'),
    },
  })

  const williamsTrust = await prisma.matter.create({
    data: {
      matterNumber: '2024-003',
      clientId: williamsFamily.id,
      title: 'Estate Planning - Williams Family Trust',
      description: 'Comprehensive estate planning including trust establishment',
      practiceArea: 'ESTATE_PLANNING',
      status: 'PENDING',
      priority: 'MEDIUM',
      leadAttorneyId: emilyWilliams.id,
      estimatedHours: 40,
      billingType: 'FIXED_FEE',
      fixedFeeAmount: 8500,
      openDate: new Date('2024-03-10'),
    },
  })

  const taylorIP = await prisma.matter.create({
    data: {
      matterNumber: '2024-004',
      clientId: taylorInd.id,
      title: 'Intellectual Property Portfolio',
      description: 'Trademark registration and IP protection strategy',
      practiceArea: 'INTELLECTUAL_PROPERTY',
      status: 'OPEN',
      priority: 'MEDIUM',
      leadAttorneyId: johnDoe.id,
      estimatedHours: 60,
      billingType: 'HOURLY',
      openDate: new Date('2024-04-05'),
    },
  })

  console.log('Creating tasks...')

  await prisma.task.create({
    data: {
      matterId: smithLitigation.id,
      title: 'Review discovery documents',
      description: 'Review all documents produced in discovery',
      assigneeId: michaelChen.id,
      createdById: sarahJohnson.id,
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date('2024-05-20'),
    },
  })

  await prisma.task.create({
    data: {
      matterId: techMerger.id,
      title: 'Draft merger amendments',
      description: 'Prepare amendments to merger agreement based on due diligence',
      assigneeId: johnDoe.id,
      createdById: johnDoe.id,
      status: 'PENDING',
      priority: 'URGENT',
      dueDate: new Date('2024-05-18'),
    },
  })

  console.log('Creating events...')

  const now = new Date()
  await prisma.event.create({
    data: {
      matterId: smithLitigation.id,
      userId: sarahJohnson.id,
      title: 'Deposition - Smith Case',
      description: 'Deposition of key witness',
      location: 'Conference Room A',
      startAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      eventType: 'DEPOSITION',
      status: 'SCHEDULED',
    },
  })

  await prisma.event.create({
    data: {
      matterId: techMerger.id,
      userId: johnDoe.id,
      title: 'Client Meeting - Merger Review',
      description: 'Review merger terms with TechStart leadership',
      location: 'Boardroom',
      startAt: new Date(now.getTime() + 24 * 60 * 60 * 1000),
      endAt: new Date(now.getTime() + 25 * 60 * 60 * 1000),
      eventType: 'MEETING',
      status: 'CONFIRMED',
    },
  })

  console.log('Creating invoices...')

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-001',
      clientId: techStart.id,
      matterId: techMerger.id,
      status: 'SENT',
      issueDate: new Date('2024-05-01'),
      dueDate: new Date('2024-05-31'),
      subtotal: 2750,
      totalAmount: 2750,
      paidAmount: 0,
      terms: 'Net 30',
    },
  })

  await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2024-002',
      clientId: smithHoldings.id,
      status: 'PAID',
      issueDate: new Date('2024-02-01'),
      dueDate: new Date('2024-03-03'),
      subtotal: 15000,
      totalAmount: 15000,
      paidAmount: 15000,
      terms: 'Net 30',
    },
  })

  console.log('Creating CRM stages...')

  await prisma.dealStage.create({ data: { name: 'Lead', color: '#6B7280', probability: 10, position: 0, isDefault: true } })
  await prisma.dealStage.create({ data: { name: 'Qualified', color: '#3B82F6', probability: 25, position: 1 } })
  await prisma.dealStage.create({ data: { name: 'Proposal', color: '#8B5CF6', probability: 50, position: 2 } })
  await prisma.dealStage.create({ data: { name: 'Negotiation', color: '#F59E0B', probability: 75, position: 3 } })

  console.log('Seed completed successfully!')
  console.log('')
  console.log('========================================')
  console.log('Login credentials:')
  console.log('========================================')
  console.log('Partner: john.doe@lawfirm.com / password123')
  console.log('Associate: sarah.johnson@lawfirm.com / password123')
  console.log('Paralegal: michael.chen@lawfirm.com / password123')
  console.log('Admin: david.brown@lawfirm.com / password123')
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
