import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { 
  User, 
  Notification, 
  NavItem, 
  DashboardStats,
  Matter,
  Task,
  CalendarEvent,
  Message
} from '@/types'

// ============================================
// Auth Store
// ============================================

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// ============================================
// UI Store
// ============================================

interface UIState {
  sidebarCollapsed: boolean
  sidebarOpen: boolean
  theme: 'light' | 'dark' | 'system'
  isCommandPaletteOpen: boolean
  notificationsPanelOpen: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  setCommandPaletteOpen: (open: boolean) => void
  setNotificationsPanelOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarOpen: true,
      theme: 'system',
      isCommandPaletteOpen: false,
      notificationsPanelOpen: false,
      toggleSidebar: () => set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed,
        sidebarOpen: !state.sidebarCollapsed 
      })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => set({ theme }),
      setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        sidebarCollapsed: state.sidebarCollapsed, 
        theme: state.theme 
      }),
    }
  )
)

// ============================================
// Notifications Store
// ============================================

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  setNotifications: (notifications: Notification[]) => void
  addNotification: (notification: Notification) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
  setLoading: (loading: boolean) => void
}

export const useNotificationsStore = create<NotificationsState>()((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  setNotifications: (notifications) => set({ 
    notifications, 
    unreadCount: notifications.filter(n => !n.read).length 
  }),
  addNotification: (notification) => set((state) => ({
    notifications: [notification, ...state.notifications],
    unreadCount: state.unreadCount + (notification.read ? 0 : 1),
  })),
  markAsRead: (id) => set((state) => ({
    notifications: state.notifications.map(n => 
      n.id === id ? { ...n, read: true, readAt: new Date() } : n
    ),
    unreadCount: Math.max(0, state.unreadCount - 1),
  })),
  markAllAsRead: () => set((state) => ({
    notifications: state.notifications.map(n => ({ ...n, read: true, readAt: new Date() })),
    unreadCount: 0,
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id),
    unreadCount: state.unreadCount - (state.notifications.find(n => n.id === id)?.read ? 0 : 1),
  })),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
  setLoading: (isLoading) => set({ isLoading }),
}))

// ============================================
// Dashboard Store
// ============================================

interface DashboardState {
  stats: DashboardStats | null
  recentMatters: Matter[]
  upcomingEvents: CalendarEvent[]
  pendingTasks: Task[]
  recentMessages: Message[]
  isLoading: boolean
  setStats: (stats: DashboardStats) => void
  setRecentMatters: (matters: Matter[]) => void
  setUpcomingEvents: (events: CalendarEvent[]) => void
  setPendingTasks: (tasks: Task[]) => void
  setRecentMessages: (messages: Message[]) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useDashboardStore = create<DashboardState>()((set) => ({
  stats: null,
  recentMatters: [],
  upcomingEvents: [],
  pendingTasks: [],
  recentMessages: [],
  isLoading: false,
  setStats: (stats) => set({ stats }),
  setRecentMatters: (recentMatters) => set({ recentMatters }),
  setUpcomingEvents: (upcomingEvents) => set({ upcomingEvents }),
  setPendingTasks: (pendingTasks) => set({ pendingTasks }),
  setRecentMessages: (recentMessages) => set({ recentMessages }),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({
    stats: null,
    recentMatters: [],
    upcomingEvents: [],
    pendingTasks: [],
    recentMessages: [],
    isLoading: false,
  }),
}))

// ============================================
// Search Store
// ============================================

interface SearchState {
  query: string
  isOpen: boolean
  recentSearches: string[]
  setQuery: (query: string) => void
  setIsOpen: (open: boolean) => void
  addRecentSearch: (query: string) => void
  clearRecentSearches: () => void
}

export const useSearchStore = create<SearchState>()(
  persist(
    (set) => ({
      query: '',
      isOpen: false,
      recentSearches: [],
      setQuery: (query) => set({ query }),
      setIsOpen: (isOpen) => set({ isOpen }),
      addRecentSearch: (query) => set((state) => {
        const filtered = state.recentSearches.filter(s => s !== query)
        return {
          recentSearches: [query, ...filtered].slice(0, 10),
        }
      }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ recentSearches: state.recentSearches }),
    }
  )
)

// ============================================
// Navigation Store
// ============================================

interface NavigationState {
  activeNavId: string
  breadcrumbItems: { title: string; href?: string }[]
  setActiveNavId: (id: string) => void
  setBreadcrumbItems: (items: { title: string; href?: string }[]) => void
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  activeNavId: 'dashboard',
  breadcrumbItems: [],
  setActiveNavId: (activeNavId) => set({ activeNavId }),
  setBreadcrumbItems: (breadcrumbItems) => set({ breadcrumbItems }),
}))

// ============================================
// Mock Data for Development
// ============================================

// Mock current user for development
export const mockCurrentUser: User = {
  id: '1',
  email: 'john.doe@lawfirm.com',
  firstName: 'John',
  lastName: 'Doe',
  role: 'partner',
  department: 'Corporate Law',
  phone: '+1 (555) 123-4567',
  createdAt: new Date('2023-01-15'),
  updatedAt: new Date(),
}

// Mock notifications for development
export const mockNotifications: Notification[] = [
  {
    id: '1',
    userId: '1',
    type: 'task-assigned',
    title: 'New Task Assigned',
    message: 'You have been assigned a new task: "Review contract amendments"',
    read: false,
    actionUrl: '/tasks/123',
    actionText: 'View Task',
    entityId: '123',
    entityType: 'task',
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
  },
  {
    id: '2',
    userId: '1',
    type: 'deadline-reminder',
    title: 'Deadline Approaching',
    message: 'Matter "Smith v. Jones" has a filing deadline in 2 days',
    read: false,
    actionUrl: '/matters/456',
    actionText: 'View Matter',
    entityId: '456',
    entityType: 'matter',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
  },
  {
    id: '3',
    userId: '1',
    type: 'message-received',
    title: 'New Message',
    message: 'Sarah Johnson sent you a message regarding the merger case',
    read: true,
    actionUrl: '/messages/789',
    actionText: 'View Message',
    entityId: '789',
    entityType: 'message',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: '4',
    userId: '1',
    type: 'invoice-paid',
    title: 'Invoice Paid',
    message: 'Invoice #INV-2024-0123 has been paid by ABC Corporation',
    read: true,
    actionUrl: '/billing/123',
    actionText: 'View Invoice',
    entityId: '123',
    entityType: 'invoice',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
  },
]

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalMatters: 147,
  activeMatters: 42,
  pendingTasks: 18,
  upcomingEvents: 7,
  unreadMessages: 5,
  unbilledHours: 156.5,
  unbilledAmount: 31200,
  overdueInvoices: 3,
  overdueAmount: 15450,
}

// Navigation items for staff sidebar
export const staffNavItems: NavItem[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    href: '/',
  },
  {
    id: 'matters',
    title: 'Matters',
    href: '/matters',
    badge: 42,
  },
  {
    id: 'clients',
    title: 'Clients',
    href: '/clients',
  },
  {
    id: 'billing',
    title: 'Billing',
    href: '/billing',
    badge: 3,
  },
  {
    id: 'documents',
    title: 'Documents',
    href: '/documents',
  },
  {
    id: 'calendar',
    title: 'Calendar',
    href: '/calendar',
    badge: 7,
  },
  {
    id: 'tasks',
    title: 'Tasks',
    href: '/tasks',
    badge: 18,
  },
  {
    id: 'messages',
    title: 'Messages',
    href: '/messages',
    badge: 5,
  },
  {
    id: 'reports',
    title: 'Reports',
    href: '/reports',
  },
  {
    id: 'settings',
    title: 'Settings',
    href: '/settings',
  },
]
