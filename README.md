# LawFirmEra

A modern law firm management application built with Next.js 16, Prisma, and NextAuth.js.

## Features

- **Dashboard** - Real-time statistics, active matters, revenue tracking
- **Client Management** - Full CRUD for clients with contact info
- **Matter Management** - Legal matters linked to clients
- **Task Management** - Tasks with priorities and due dates
- **Calendar** - Events tied to matters with reminders
- **Messaging** - Internal messaging between staff
- **Documents** - File upload and storage
- **Billing** - Invoices, time tracking, payment management
- **Search** - Global search across all entities
- **Authentication** - Role-based access (Admin, Attorney, Paralegal, Client)

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Prisma ORM (SQLite/PostgreSQL)
- NextAuth.js
- React Query
- Zustand
- shadcn/ui
- Tailwind CSS

## Getting Started

```bash
# Install dependencies
bun install

# Generate Prisma client
bun prisma generate

# Run database migrations
bun prisma db push

# Seed database with demo data
bun prisma db seed

# Start development server
bun run dev
```

## Environment Variables

```env
DATABASE_URL="file:./db/custom.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Demo Credentials

- Admin: admin@lawfirm.com / password
- Attorney: attorney@lawfirm.com / password
- Paralegal: paralegal@lawfirm.com / password

## Deployment

This app supports Next.js standalone output for deployment to Vercel, Railway, Render, or any Node.js hosting.
