import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom'
import { useList, useCreate, PageTitle, DataPanel, PanelSummary, Metric, Badge, SubmitButton, RefreshButton, MutationError, QueryError, EmptyRow, EmptyPanel } from './ui'
import {
  Armchair,
  BarChart3,
  BadgePercent,
  BusFront,
  CalendarClock,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  Map,
  Plus,
  Printer,
  RefreshCcw,
  Route as RouteIcon,
  ShieldCheck,
  Ticket,
  Users,
} from 'lucide-react'
import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { api, getApiError, readStoredUser, setAuthToken, storeUser } from './api'
import type { AuthUser } from './types'

const queryClient = new QueryClient()

import {
  type DurationUnit,
  type PassengerType,
  passengerTypes,
  money,
  roleLabel,
  passengerTypeLabel,
  statusLabel,
  durationLabel,
  durationToMinutes,
  isTripSellable,
  getTicketSaleValidationMessage,
  getRequestedTripWindow,
  findBusScheduleConflict,
  isTicketFromToday,
  isTicketCancellable,
  isTripArchived,
  tripStatusLabel,
  isTripInProgress,
  seatSlotClass,
  dateTime,
  dateOnly,
} from './utils'

type Page = 'dashboard' | 'tickets' | 'trips' | 'buses' | 'routes' | 'reports' | 'users'

const navItems = [
  { id: 'dashboard', path: '/', label: 'Panel', icon: LayoutDashboard },
  { id: 'tickets', path: '/tickets', label: 'Venta', icon: Ticket },
  { id: 'trips', path: '/trips', label: 'Viajes', icon: CalendarClock },
  { id: 'buses', path: '/buses', label: 'Autobuses', icon: BusFront },
  { id: 'routes', path: '/routes', label: 'Rutas', icon: RouteIcon },
  { id: 'reports', path: '/reports', label: 'Reportes', icon: BarChart3 },
  { id: 'users', path: '/users', label: 'Usuarios', icon: Users },
]

export function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = readStoredUser()
    setAuthToken(stored?.token ?? null)
    return stored
  })

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {user ? <Shell user={user} onLogout={() => { storeUser(null); setUser(null) }} /> : (
          <Routes>
            <Route path="*" element={<LoginPage onLogin={setUser} />} />
          </Routes>
        )}
      </BrowserRouter>
    </QueryClientProvider>
  )
}

import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { BusesPage } from './pages/BusesPage'
import { RoutesPage } from './pages/RoutesPage'
import { UsersPage } from './pages/UsersPage'
import { TripsPage } from './pages/TripsPage'
import { ReportsPage } from './pages/ReportsPage'
import { TicketSale } from './pages/TicketSale'

function Shell({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const visibleNavItems = navItems.filter((item) => user.roleName === 'TERMINAL_MANAGER' || ['dashboard', 'tickets', 'trips'].includes(item.id))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/brand/mayitos-logo.jpg" alt="Mayitos" />
          <div>
            <strong>Autobuses Mayitos</strong>
            <span>{roleLabel(user.roleName)}</span>
          </div>
        </div>
        <nav>
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.id} to={item.path} className={({ isActive }) => (isActive ? 'active' : '')}>
                <Icon size={18} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
        <button className="logout" onClick={onLogout}>
          <LogOut size={18} />
          Salir
        </button>
      </aside>
      <main className="workspace">
        <div className="route-ribbon" />
        <header className="topbar">
          <div>
            <span>Sesion activa</span>
            <strong>{user.fullName}</strong>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tickets" element={<TicketSale user={user} />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/buses" element={<BusesPage />} />
          <Route path="/routes" element={<RoutesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
