import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

// Demo users - these work without a database
const DEMO_USERS = [
  {
    id: '1',
    email: 'john.doe@lawfirm.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'John Doe',
    role: 'PARTNER',
    department: 'Corporate Law',
    title: 'Managing Partner',
    hourlyRate: 550,
  },
  {
    id: '2',
    email: 'sarah.johnson@lawfirm.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'Sarah Johnson',
    role: 'ASSOCIATE',
    department: 'Litigation',
    title: 'Senior Associate',
    hourlyRate: 425,
  },
  {
    id: '3',
    email: 'michael.chen@lawfirm.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'Michael Chen',
    role: 'PARALEGAL',
    department: 'Corporate Law',
    title: 'Senior Paralegal',
  },
  {
    id: '4',
    email: 'emily.williams@lawfirm.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'Emily Williams',
    role: 'ASSOCIATE',
    department: 'Estate Planning',
    title: 'Associate',
    hourlyRate: 350,
  },
  {
    id: '5',
    email: 'david.brown@lawfirm.com',
    password: bcrypt.hashSync('password123', 10),
    name: 'David Brown',
    role: 'ADMIN',
    department: 'Administration',
    title: 'System Administrator',
  },
]

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Find user in demo users
        const user = DEMO_USERS.find(u => u.email === credentials.email)

        if (!user) {
          return null
        }

        const isPasswordValid = bcrypt.compareSync(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'law-firm-secret-key-change-in-production-2024',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
