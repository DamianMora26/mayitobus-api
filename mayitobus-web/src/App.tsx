import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import type { AuthUser, Bus, Route, SalesReport, Ticket as TicketType, Trip, TripSeats, User } from './types'

const queryClient = new QueryClient()

type Page = 'dashboard' | 'tickets' | 'trips' | 'buses' | 'routes' | 'reports' | 'users'
type PassengerType = 'NORMAL' | 'ADULTO_MAYOR' | 'NINO' | 'DISCAPACITADO'

const passengerTypes: Array<{ value: PassengerType; label: string; discount: number }> = [
  { value: 'NORMAL', label: 'Normal', discount: 0 },
  { value: 'ADULTO_MAYOR', label: 'Adulto mayor', discount: 50 },
  { value: 'NINO', label: 'Niño', discount: 25 },
  { value: 'DISCAPACITADO', label: 'Persona discapacitada', discount: 50 },
]

const navItems: Array<{ id: Page; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tickets', label: 'Venta', icon: Ticket },
  { id: 'trips', label: 'Viajes', icon: CalendarClock },
  { id: 'buses', label: 'Autobuses', icon: BusFront },
  { id: 'routes', label: 'Rutas', icon: RouteIcon },
  { id: 'reports', label: 'Reportes', icon: BarChart3 },
  { id: 'users', label: 'Usuarios', icon: Users },
]

export function App() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = readStoredUser()
    setAuthToken(stored?.token ?? null)
    return stored
  })

  return (
    <QueryClientProvider client={queryClient}>
      {user ? <Shell user={user} onLogout={() => { storeUser(null); setUser(null) }} /> : <LoginPage onLogin={setUser} />}
    </QueryClientProvider>
  )
}

function LoginPage({ onLogin }: { onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const login = useMutation({
    mutationFn: async () => {
      const { data } = await api.post<AuthUser>('/api/auth/login', { email, password })
      return data
    },
    onSuccess: (data) => {
      storeUser(data)
      onLogin(data)
    },
    onError: (err) => setError(getApiError(err).message),
  })

  function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    login.mutate()
  }

  return (
    <main className="login-page">
      <section className="login-panel">
        <div className="login-brand">
          <img className="login-logo" src="/brand/mayitos-logo.jpg" alt="Mayitos" />
          <div>
            <span>Acceso operativo</span>
            <h1>Autobuses Mayitos</h1>
          </div>
        </div>
        <form onSubmit={submit} className="form stack">
          <label>
            Correo
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" />
          </label>
          <label>
            Contraseña
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" />
          </label>
          {error && <div className="alert">{error}</div>}
          <button className="primary-action" disabled={login.isPending}>
            <ShieldCheck size={18} />
            {login.isPending ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </section>
    </main>
  )
}

function Shell({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [page, setPage] = useState<Page>('dashboard')
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
              <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
                <Icon size={18} />
                {item.label}
              </button>
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
          <span className="status-pill">API {user.token ? 'conectada' : 'pendiente'}</span>
        </header>
        {page === 'dashboard' && <Dashboard />}
        {page === 'tickets' && <TicketSale user={user} />}
        {page === 'trips' && <TripsPage />}
        {page === 'buses' && <BusesPage />}
        {page === 'routes' && <RoutesPage />}
        {page === 'reports' && <ReportsPage />}
        {page === 'users' && <UsersPage />}
      </main>
    </div>
  )
}

function Dashboard() {
  const buses = useList<Bus[]>('buses', '/api/buses')
  const routes = useList<Route[]>('routes', '/api/routes')
  const trips = useList<Trip[]>('trips', '/api/trips')
  const tickets = useList<TicketType[]>('tickets', '/api/tickets')
  const sold = tickets.data?.filter((ticket) => ticket.status === 'SOLD') ?? []

  return (
    <section className="page">
        <PageTitle title="Dashboard" subtitle="Operacion actual de la terminal" />
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Consola de terminal</span>
          <h2>Venta, salidas y asientos con identidad Mayitos.</h2>
          <p>Controla viajes, boletos, rutas y reportes desde un panel hecho para operacion diaria.</p>
        </div>
      </section>
      <div className="metric-grid">
        <Metric icon={BusFront} label="Autobuses" value={buses.data?.length ?? 0} />
        <Metric icon={Map} label="Rutas" value={routes.data?.length ?? 0} />
        <Metric icon={CalendarClock} label="Viajes" value={trips.data?.length ?? 0} />
        <Metric icon={CircleDollarSign} label="Venta activa" value={money(sold.reduce((sum, ticket) => sum + Number(ticket.price), 0))} />
      </div>
      <DataPanel title="Proximos viajes">
        <QueryError query={trips} />
        <table>
          <thead><tr><th>Ruta</th><th>Autobus</th><th>Salida</th><th>Estatus</th></tr></thead>
          <tbody>
            {(trips.data ?? []).slice(0, 6).map((trip) => (
              <tr key={trip.id}>
                <td>{trip.origin} - {trip.destination}</td>
                <td>{trip.busNumber}</td>
                <td>{dateTime(trip.departureDateTime)}</td>
                <td><Badge>{trip.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>
      <DataPanel title="Ultimos boletos">
        <QueryError query={tickets} />
        <table>
          <thead><tr><th>Pasajero</th><th>Ruta</th><th>Categoria</th><th>Asiento</th><th>Total</th><th>Estatus</th></tr></thead>
          <tbody>
            {(tickets.data ?? []).slice(0, 6).map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.passengerName}</td>
                <td>{ticket.origin} - {ticket.destination}</td>
                <td>{passengerTypeLabel(ticket.passengerType)}</td>
                <td>{ticket.seatNumber}</td>
                <td>{money(ticket.price)}</td>
                <td><Badge>{ticket.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataPanel>
    </section>
  )
}

function BusesPage() {
  const queryClient = useQueryClient()
  const buses = useList<Bus[]>('buses', '/api/buses')
  const [form, setForm] = useState({ busNumber: '', licensePlate: '', model: '', capacity: '42' })
  const create = useCreate('/api/buses', ['buses'], () => setForm({ busNumber: '', licensePlate: '', model: '', capacity: '42' }))
  const updateStatus = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'activate' | 'deactivate' }) => (await api.patch(`/api/buses/${id}/${action}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['buses'] }),
  })

  return (
    <section className="page two-column">
      <div>
        <PageTitle title="Autobuses" subtitle="Vehiculos registrados y activos" />
        <RefreshButton onClick={() => queryClient.invalidateQueries({ queryKey: ['buses'] })} />
        <DataPanel title="Flota">
          <QueryError query={buses} />
          <table>
            <thead><tr><th>Numero</th><th>Placas</th><th>Modelo</th><th>Capacidad</th><th>Estatus</th><th></th></tr></thead>
            <tbody>{(buses.data ?? []).map((bus) => <tr key={bus.id}><td>{bus.busNumber}</td><td>{bus.licensePlate}</td><td>{bus.model}</td><td>{bus.capacity}</td><td><Badge>{bus.status}</Badge></td><td><button className="ghost small-button" onClick={() => updateStatus.mutate({ id: bus.id, action: bus.status === 'ACTIVE' ? 'deactivate' : 'activate' })}>{bus.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}</button></td></tr>)}</tbody>
          </table>
          <MutationError mutation={updateStatus} />
        </DataPanel>
      </div>
      <DataPanel title="Nuevo autobus">
        <form className="form stack" onSubmit={(event) => { event.preventDefault(); create.mutate({ ...form, capacity: Number(form.capacity) }) }}>
          <label>Numero<input placeholder="BUS-001" value={form.busNumber} onChange={(e) => setForm({ ...form, busNumber: e.target.value })} /></label>
          <label>Placas<input placeholder="ABC-123" value={form.licensePlate} onChange={(e) => setForm({ ...form, licensePlate: e.target.value })} /></label>
          <label>Modelo<input placeholder="Volvo A2" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} /></label>
          <label>Capacidad<input inputMode="numeric" placeholder="42" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} /></label>
          <SubmitButton loading={create.isPending}>Crear autobus</SubmitButton>
          <MutationError mutation={create} />
        </form>
      </DataPanel>
    </section>
  )
}

function RoutesPage() {
  const queryClient = useQueryClient()
  const routes = useList<Route[]>('routes', '/api/routes')
  const [form, setForm] = useState({ origin: '', destination: '', basePrice: '', estimatedDurationHours: '2' })
  const create = useCreate('/api/routes', ['routes'], () => setForm({ origin: '', destination: '', basePrice: '', estimatedDurationHours: '2' }))
  const updateStatus = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'activate' | 'deactivate' }) => (await api.patch(`/api/routes/${id}/${action}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['routes'] }),
  })

  return (
    <section className="page two-column">
      <div>
        <PageTitle title="Rutas" subtitle="Origen, destino, precio y duracion" />
        <DataPanel title="Rutas activas">
          <QueryError query={routes} />
          <table>
            <thead><tr><th>Origen</th><th>Destino</th><th>Precio</th><th>Duracion</th><th>Estatus</th><th></th></tr></thead>
            <tbody>{(routes.data ?? []).map((route) => <tr key={route.id}><td>{route.origin}</td><td>{route.destination}</td><td>{money(route.basePrice)}</td><td>{durationLabel(route.estimatedDurationMinutes)}</td><td><Badge>{route.active ? 'ACTIVE' : 'INACTIVE'}</Badge></td><td><button className="ghost small-button" onClick={() => updateStatus.mutate({ id: route.id, action: route.active ? 'deactivate' : 'activate' })}>{route.active ? 'Desactivar' : 'Activar'}</button></td></tr>)}</tbody>
          </table>
          <MutationError mutation={updateStatus} />
        </DataPanel>
      </div>
      <DataPanel title="Nueva ruta">
        <form className="form stack" onSubmit={(event) => { event.preventDefault(); create.mutate({ origin: form.origin, destination: form.destination, basePrice: Number(form.basePrice), estimatedDurationMinutes: Math.round(Number(form.estimatedDurationHours) * 60) }) }}>
          <label>Origen<input placeholder="Navojoa" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></label>
          <label>Destino<input placeholder="Huatabampo" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></label>
          <label>Precio base<input inputMode="decimal" placeholder="70.00" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} /></label>
          <label>Duracion estimada<input inputMode="decimal" placeholder="2" value={form.estimatedDurationHours} onChange={(e) => setForm({ ...form, estimatedDurationHours: e.target.value })} /></label>
          <p className="form-hint">Captura horas. Por ejemplo: 2 equivale a 120 minutos.</p>
          <SubmitButton loading={create.isPending}>Crear ruta</SubmitButton>
          <MutationError mutation={create} />
        </form>
      </DataPanel>
    </section>
  )
}

function TripsPage() {
  const queryClient = useQueryClient()
  const trips = useList<Trip[]>('trips', '/api/trips')
  const routes = useList<Route[]>('routes', '/api/routes')
  const buses = useList<Bus[]>('buses', '/api/buses')
  const [form, setForm] = useState({ routeId: '', busId: '', departureDateTime: '' })
  const create = useCreate('/api/trips', ['trips'], () => setForm({ routeId: '', busId: '', departureDateTime: '' }))
  const cancel = useMutation({
    mutationFn: async (tripId: number) => (await api.patch(`/api/trips/${tripId}/cancel`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  })

  return (
    <section className="page two-column">
      <div>
        <PageTitle title="Viajes" subtitle="Primero crea una ruta y un autobus; luego programa la salida aqui." />
        <DataPanel title="Agenda">
          <QueryError query={trips} />
          <table>
            <thead><tr><th>Ruta</th><th>Autobus</th><th>Salida</th><th>Llegada</th><th>Estatus</th><th></th></tr></thead>
            <tbody>{(trips.data ?? []).map((trip) => <tr key={trip.id}><td>{trip.origin} - {trip.destination}</td><td>{trip.busNumber}</td><td>{dateTime(trip.departureDateTime)}</td><td>{dateTime(trip.estimatedArrivalDateTime)}</td><td><Badge>{trip.status}</Badge></td><td>{trip.status === 'SCHEDULED' && <button className="ghost small-button" onClick={() => cancel.mutate(trip.id)}>Cancelar</button>}</td></tr>)}</tbody>
          </table>
          <MutationError mutation={cancel} />
        </DataPanel>
      </div>
      <DataPanel title="Nuevo viaje">
        <form className="form stack" onSubmit={(event) => { event.preventDefault(); create.mutate({ routeId: Number(form.routeId), busId: Number(form.busId), departureDateTime: form.departureDateTime }) }}>
          <select value={form.routeId} onChange={(e) => setForm({ ...form, routeId: e.target.value })}>
            <option value="">{(routes.data ?? []).length ? 'Ruta' : 'Primero registra una ruta'}</option>
            {(routes.data ?? []).map((route) => <option key={route.id} value={route.id}>{route.origin} - {route.destination}</option>)}
          </select>
          <select value={form.busId} onChange={(e) => setForm({ ...form, busId: e.target.value })}>
            <option value="">{(buses.data ?? []).length ? 'Autobus' : 'Primero registra un autobus'}</option>
            {(buses.data ?? []).map((bus) => <option key={bus.id} value={bus.id}>{bus.busNumber} ({bus.capacity})</option>)}
          </select>
          <input type="datetime-local" value={form.departureDateTime} onChange={(e) => setForm({ ...form, departureDateTime: e.target.value })} />
          <SubmitButton loading={create.isPending}>Programar viaje</SubmitButton>
          <MutationError mutation={create} />
        </form>
      </DataPanel>
    </section>
  )
}

function TicketSale({ user }: { user: AuthUser }) {
  const queryClient = useQueryClient()
  const trips = useList<Trip[]>('trips', '/api/trips')
  const tickets = useList<TicketType[]>('tickets', '/api/tickets')
  const [tripId, setTripId] = useState('')
  const [passengerName, setPassengerName] = useState('')
  const [seatNumber, setSeatNumber] = useState('')
  const [passengerType, setPassengerType] = useState<PassengerType>('NORMAL')
  const [printTicket, setPrintTicket] = useState<TicketType | null>(null)
  const selectedTripId = Number(tripId)
  const scheduledTrips = (trips.data ?? []).filter((trip) => trip.status === 'SCHEDULED')
  const selectedTrip = (trips.data ?? []).find((trip) => trip.id === selectedTripId)
  const selectedPassengerType = passengerTypes.find((type) => type.value === passengerType) ?? passengerTypes[0]
  const finalPrice = selectedTrip ? selectedTrip.basePrice * (1 - selectedPassengerType.discount / 100) : 0
  const seats = useQuery({
    queryKey: ['seats', selectedTripId],
    queryFn: async () => (await api.get<TripSeats>(`/api/trips/${selectedTripId}/seats`)).data,
    enabled: Boolean(selectedTripId),
  })
  const create = useMutation({
    mutationFn: async () => (await api.post('/api/tickets', { tripId: selectedTripId, sellerUserId: user.userId, passengerName, seatNumber: Number(seatNumber), passengerType })).data,
    onSuccess: (ticket: TicketType) => {
      setPassengerName('')
      setSeatNumber('')
      setPassengerType('NORMAL')
      setPrintTicket(ticket)
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['seats', selectedTripId] })
    },
  })
  const cancel = useMutation({
    mutationFn: async (ticketId: number) => (await api.patch(`/api/tickets/${ticketId}/cancel`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['seats', selectedTripId] })
    },
  })

  return (
    <section className="page ticket-layout">
      <div>
        <PageTitle title="Venta de boletos" subtitle="Selecciona viaje, categoria de pasajero y asiento" />
        {!scheduledTrips.length && (
          <div className="info-message">Para vender un boleto primero programa un viaje en la seccion Viajes. La venta usa viajes, no rutas sueltas.</div>
        )}
        <section className="ticket-counter">
          <div className="ticket-counter-header">
            <div>
              <span className="eyebrow">Ventanilla</span>
              <h2>Nueva venta</h2>
            </div>
            <strong>{money(finalPrice)}</strong>
          </div>
          <form className="form sale-form" onSubmit={(event) => { event.preventDefault(); create.mutate() }}>
            <select value={tripId} onChange={(event) => setTripId(event.target.value)}>
              <option value="">{scheduledTrips.length ? 'Viaje programado' : 'Primero programa un viaje'}</option>
              {scheduledTrips.map((trip) => <option key={trip.id} value={trip.id}>{trip.origin} - {trip.destination} / {dateTime(trip.departureDateTime)}</option>)}
            </select>
            <input placeholder="Pasajero" value={passengerName} onChange={(event) => setPassengerName(event.target.value)} />
            <input placeholder="Asiento" inputMode="numeric" value={seatNumber} onChange={(event) => setSeatNumber(event.target.value)} />
            <select value={passengerType} onChange={(event) => setPassengerType(event.target.value as PassengerType)}>
              {passengerTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
            <SubmitButton loading={create.isPending}>Vender</SubmitButton>
          </form>
          <div className="fare-grid">
            {passengerTypes.map((type) => (
              <button key={type.value} className={`fare-card ${type.value === passengerType ? 'active' : ''}`} onClick={() => setPassengerType(type.value)}>
                <BadgePercent size={18} />
                <span>{type.label}</span>
                <strong>{type.discount}%</strong>
              </button>
            ))}
          </div>
          {selectedTrip && (
            <div className="fare-summary">
              <span>Tarifa base {money(selectedTrip.basePrice)}</span>
              <span>Descuento {selectedPassengerType.discount}%</span>
              <strong>Total {money(finalPrice)}</strong>
            </div>
          )}
          <MutationError mutation={create} />
        </section>
        <DataPanel title="Boletos recientes">
          <QueryError query={tickets} />
          <table>
            <thead><tr><th>Pasajero</th><th>Categoria</th><th>Ruta</th><th>Asiento</th><th>Precio</th><th>Estatus</th><th></th></tr></thead>
            <tbody>{(tickets.data ?? []).slice(0, 10).map((ticket) => <tr key={ticket.id}><td>{ticket.passengerName}</td><td>{passengerTypeLabel(ticket.passengerType)}</td><td>{ticket.origin} - {ticket.destination}</td><td>{ticket.seatNumber}</td><td>{money(ticket.price)}</td><td><Badge>{ticket.status}</Badge></td><td className="row-actions"><button className="ghost small-button" onClick={() => setPrintTicket(ticket)}>Imprimir</button>{ticket.status === 'SOLD' && <button className="ghost small-button" onClick={() => cancel.mutate(ticket.id)}>Cancelar</button>}</td></tr>)}</tbody>
          </table>
          <MutationError mutation={cancel} />
        </DataPanel>
      </div>
      <DataPanel title="Mapa de asientos">
        <QueryError query={seats} />
        <div className="seat-summary">
          <span>{seats.data?.soldSeats ?? 0} vendidos</span>
          <span>{seats.data?.availableSeats ?? 0} disponibles</span>
        </div>
        <div className="bus-seat-layout">
          <div className="bus-front-marker">
            <BusFront size={19} />
            <span>Frente</span>
          </div>
          <div className="seat-map">
            {(seats.data?.seats ?? []).map((seat) => (
              <button
                key={seat.seatNumber}
                className={`seat ${seatSlotClass(seat.seatNumber)} ${seat.status === 'SOLD' ? 'sold' : ''} ${seatNumber === String(seat.seatNumber) ? 'selected' : ''}`}
                title={seat.passengerName ?? 'Disponible'}
                onClick={() => seat.status === 'AVAILABLE' && setSeatNumber(String(seat.seatNumber))}
              >
                <Armchair size={15} />
                <span>{seat.seatNumber}</span>
              </button>
            ))}
          </div>
          <div className="seat-legend">
            <span><i className="legend-dot available" />Disponible</span>
            <span><i className="legend-dot selected" />Seleccionado</span>
            <span><i className="legend-dot sold" />Vendido</span>
          </div>
        </div>
      </DataPanel>
      {printTicket && <PrintableTicket ticket={printTicket} onClose={() => setPrintTicket(null)} />}
    </section>
  )
}

function PrintableTicket({ ticket, onClose }: { ticket: TicketType; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="ticket-modal">
        <div className="ticket-paper" id="printable-ticket">
          <div className="ticket-brand">
            <img src="/brand/mayitos-logo.jpg" alt="Mayitos" />
            <div>
              <strong>Autobuses Mayitos</strong>
              <span>Boleto de pasajero</span>
            </div>
          </div>
          <div className="ticket-route">
            <span>{ticket.origin}</span>
            <strong>→</strong>
            <span>{ticket.destination}</span>
          </div>
          <div className="ticket-details">
            <span>Folio</span><strong>#{ticket.id}</strong>
            <span>Pasajero</span><strong>{ticket.passengerName}</strong>
            <span>Categoria</span><strong>{passengerTypeLabel(ticket.passengerType)}</strong>
            <span>Descuento</span><strong>{Number(ticket.discountPercentage)}%</strong>
            <span>Asiento</span><strong>{ticket.seatNumber}</strong>
            <span>Salida</span><strong>{dateTime(ticket.departureDateTime)}</strong>
            <span>Autobus</span><strong>{ticket.busNumber}</strong>
            <span>Vendedor</span><strong>{ticket.sellerName}</strong>
          </div>
          <div className="ticket-total">
            <span>Total pagado</span>
            <strong>{money(ticket.price)}</strong>
          </div>
        </div>
        <div className="modal-actions">
          <button className="ghost" onClick={onClose}>Cerrar</button>
          <button className="primary-action" onClick={() => window.print()}><Printer size={17} />Imprimir</button>
        </div>
      </section>
    </div>
  )
}

function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const report = useQuery({
    queryKey: ['sales-report', from, to],
    queryFn: async () => (await api.get<SalesReport>(`/api/reports/sales?from=${from}&to=${to}`)).data,
  })

  return (
    <section className="page">
      <PageTitle title="Reportes" subtitle="Ventas, cancelaciones y venta neta" />
      <DataPanel title="Rango">
        <div className="date-filter">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </DataPanel>
      <div className="metric-grid">
        <Metric icon={Ticket} label="Vendidos" value={report.data?.soldTickets ?? 0} />
        <Metric icon={RefreshCcw} label="Cancelados" value={report.data?.cancelledTickets ?? 0} />
        <Metric icon={CircleDollarSign} label="Bruto" value={money(report.data?.grossRevenue ?? 0)} />
        <Metric icon={BarChart3} label="Neto" value={money(report.data?.netRevenue ?? 0)} />
      </div>
      <DataPanel title="Desglose diario">
        <QueryError query={report} />
        <table>
          <thead><tr><th>Fecha</th><th>Vendidos</th><th>Cancelados</th><th>Bruto</th><th>Neto</th></tr></thead>
          <tbody>{(report.data?.dailyReports ?? []).map((row) => <tr key={row.date}><td>{row.date}</td><td>{row.soldTickets}</td><td>{row.cancelledTickets}</td><td>{money(row.grossRevenue)}</td><td>{money(row.netRevenue)}</td></tr>)}</tbody>
        </table>
      </DataPanel>
    </section>
  )
}

function UsersPage() {
  const queryClient = useQueryClient()
  const users = useList<User[]>('users', '/api/users')
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    roleName: 'TICKET_SELLER',
  })
  const create = useCreate('/api/users', ['users'], () => setForm({ fullName: '', email: '', phone: '', password: '', roleName: 'TICKET_SELLER' }))
  const updateStatus = useMutation({
    mutationFn: async ({ id, action }: { id: number; action: 'activate' | 'deactivate' }) => (await api.patch(`/api/users/${id}/${action}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  })

  return (
    <section className="page two-column">
      <div>
        <PageTitle title="Usuarios" subtitle="Accesos para gerencia y venta en ventanilla" />
        <DataPanel title="Equipo">
          <QueryError query={users} />
          <table>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estatus</th><th></th></tr></thead>
            <tbody>
              {(users.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.fullName}</td>
                  <td>{item.email}</td>
                  <td>{roleLabel(item.roleName)}</td>
                  <td><Badge>{item.active ? 'ACTIVE' : 'INACTIVE'}</Badge></td>
                  <td><button className="ghost small-button" onClick={() => updateStatus.mutate({ id: item.id, action: item.active ? 'deactivate' : 'activate' })}>{item.active ? 'Desactivar' : 'Activar'}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <MutationError mutation={updateStatus} />
        </DataPanel>
      </div>
      <DataPanel title="Nuevo usuario">
        <form className="form stack" onSubmit={(event) => { event.preventDefault(); create.mutate(form) }}>
          <input placeholder="Nombre completo" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
          <input placeholder="Correo" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input placeholder="Telefono" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input placeholder="Password inicial" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          <select value={form.roleName} onChange={(e) => setForm({ ...form, roleName: e.target.value })}>
            <option value="TICKET_SELLER">Vendedor de boletos</option>
            <option value="TERMINAL_MANAGER">Gerente de terminal</option>
          </select>
          <SubmitButton loading={create.isPending}>Crear usuario</SubmitButton>
          <MutationError mutation={create} />
        </form>
      </DataPanel>
    </section>
  )
}

function useList<T>(key: string, url: string) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => (await api.get<T>(url)).data,
  })
}

function useCreate(url: string, invalidateKeys: string[], onDone: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: unknown) => (await api.post(url, payload)).data,
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
      onDone()
    },
  })
}

function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="page-title"><h1>{title}</h1><p>{subtitle}</p></div>
}

function DataPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="panel"><h2>{title}</h2><div className="panel-body">{children}</div></section>
}

function Metric({ icon: Icon, label, value }: { icon: typeof LayoutDashboard; label: string; value: string | number }) {
  return <div className="metric"><Icon size={21} /><span>{label}</span><strong>{value}</strong></div>
}

function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>
}

function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return <button className="primary-action" disabled={loading}><Plus size={17} />{loading ? 'Guardando...' : children}</button>
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  return <button className="ghost refresh" onClick={onClick}><RefreshCcw size={16} />Actualizar</button>
}

function MutationError({ mutation }: { mutation: { error: unknown } }) {
  const error = mutation.error ? getApiError(mutation.error) : null
  return error ? <div className="alert">{error.message}</div> : null
}

function QueryError({ query }: { query: { error: unknown } }) {
  const error = query.error ? getApiError(query.error) : null
  return error ? <div className="alert">{error.message}</div> : null
}

function money(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value))
}

function roleLabel(role: string) {
  return role === 'TERMINAL_MANAGER' ? 'Gerente de terminal' : 'Vendedor de boletos'
}

function passengerTypeLabel(type: string) {
  return passengerTypes.find((passengerType) => passengerType.value === type)?.label ?? type
}

function durationLabel(minutes: number) {
  const hours = minutes / 60

  if (Number.isInteger(hours)) {
    return `${hours} h`
  }

  return `${hours.toFixed(1)} h`
}

function seatSlotClass(seatNumber: number) {
  const position = (seatNumber - 1) % 4

  if (position === 0) return 'left-window'
  if (position === 1) return 'left-aisle'
  if (position === 2) return 'right-aisle'

  return 'right-window'
}

function dateTime(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}
