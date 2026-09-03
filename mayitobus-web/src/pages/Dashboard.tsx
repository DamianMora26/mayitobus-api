import { useNavigate } from 'react-router-dom'
import { BusFront, Map, CalendarClock, CircleDollarSign } from 'lucide-react'
import type { Bus, Route, Trip, Ticket as TicketType } from '../types'
import {
  isTripArchived,
  isTripSellable,
  isTicketFromToday,
  money,
  dateTime,
  tripStatusLabel,
  passengerTypeLabel,
  statusLabel
} from '../utils'
import { useList, PageTitle, Metric, DataPanel, QueryError, EmptyRow, PanelSummary, Badge } from '../ui'

export function Dashboard() {
  const navigate = useNavigate()
  const buses = useList<Bus[]>('buses', '/api/buses')
  const routes = useList<Route[]>('routes', '/api/routes')
  const trips = useList<Trip[]>('trips', '/api/trips')
  const tickets = useList<TicketType[]>('tickets', '/api/tickets')
  const operationalTrips = (trips.data ?? []).filter((trip) => !isTripArchived(trip))
  const upcomingTrips = (trips.data ?? []).filter(isTripSellable)
  const todayTickets = tickets.data?.filter(isTicketFromToday) ?? []
  const dashboardTrips = upcomingTrips.slice(0, 6)
  const dashboardTickets = todayTickets.slice(0, 6)
  const sold = todayTickets.filter((ticket) => ticket.status === 'SOLD')

  return (
    <section className="page">
      <PageTitle title="Panel" subtitle="Operacion actual de la terminal" />
      <section className="hero-panel">
        <div>
          <span className="eyebrow">Centro de Operaciones</span>
          <h2>Bienvenido al panel general</h2>
          <p>
            Hoy tienes <strong>{upcomingTrips.length}</strong> salidas programadas y has vendido <strong>{sold.length}</strong> boletos. Supervisa el estado de tu flota en tiempo real.
          </p>
        </div>
      </section>
      <div className="metric-grid">
        <Metric icon={BusFront} label="Autobuses" value={buses.data?.length ?? 0} />
        <Metric icon={Map} label="Rutas" value={routes.data?.length ?? 0} />
        <Metric icon={CalendarClock} label="Viajes activos" value={operationalTrips.length} />
        <Metric icon={CircleDollarSign} label="Venta de hoy" value={money(sold.reduce((sum, ticket) => sum + Number(ticket.price), 0))} />
      </div>
      <DataPanel title="Proximos viajes">
        <QueryError query={trips} />
        <table>
          <thead><tr><th>Ruta</th><th>Autobus</th><th>Salida</th><th>Estado</th></tr></thead>
          <tbody>
            {dashboardTrips.map((trip) => (
              <tr key={trip.id}>
                <td>{trip.origin} - {trip.destination}</td>
                <td>{trip.busNumber}</td>
                <td>{dateTime(trip.departureDateTime)}</td>
                <td><Badge>{tripStatusLabel(trip)}</Badge></td>
              </tr>
            ))}
            {!upcomingTrips.length && <EmptyRow colSpan={4}>No hay viajes proximos.</EmptyRow>}
          </tbody>
        </table>
        <PanelSummary current={dashboardTrips.length} total={upcomingTrips.length} label="viajes proximos" onClick={() => navigate('/trips')} action="Ver agenda" />
      </DataPanel>
      <DataPanel title="Boletos de hoy">
        <QueryError query={tickets} />
        <table>
          <thead><tr><th>Pasajero</th><th>Ruta</th><th>Categoria</th><th>Asiento</th><th>Total</th><th>Estado</th></tr></thead>
          <tbody>
            {dashboardTickets.map((ticket) => (
              <tr key={ticket.id}>
                <td>{ticket.passengerName}</td>
                <td>{ticket.origin} - {ticket.destination}</td>
                <td>{passengerTypeLabel(ticket.passengerType)}</td>
                <td>{ticket.seatNumber}</td>
                <td>{money(ticket.price)}</td>
                <td><Badge>{statusLabel(ticket.status)}</Badge></td>
              </tr>
            ))}
            {!todayTickets.length && <EmptyRow colSpan={6}>No hay boletos vendidos hoy.</EmptyRow>}
          </tbody>
        </table>
        <PanelSummary current={dashboardTickets.length} total={todayTickets.length} label="boletos de hoy" onClick={() => navigate('/tickets')} action="Ver boletos" />
      </DataPanel>
    </section>
  )
}
