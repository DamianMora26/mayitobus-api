import { useState, useMemo } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { api } from '../api'
import type { Trip, Route, Bus } from '../types'
import { dateTime, getRequestedTripWindow, findBusScheduleConflict, tripStatusLabel, isTripArchived, isTripSellable } from '../utils'
import { useList, useCreate, PageTitle, DataPanel, QueryError, Badge, MutationError, SubmitButton, EmptyRow, PanelSummary } from '../ui'

export function TripsPage() {
  const queryClient = useQueryClient()
  const trips = useList<Trip[]>('trips', '/api/trips')
  const routes = useList<Route[]>('routes', '/api/routes')
  const buses = useList<Bus[]>('buses', '/api/buses')
  const [view, setView] = useState<'agenda' | 'history'>('agenda')
  const [form, setForm] = useState({ routeId: '', busId: '', departureDateTime: '' })
  const create = useCreate('/api/trips', ['trips'], () => setForm({ routeId: '', busId: '', departureDateTime: '' }))
  const cancel = useMutation({
    mutationFn: async (tripId: number) => (await api.patch(`/api/trips/${tripId}/cancel`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['trips'] }),
  })
  const activeTrips = (trips.data ?? []).filter((trip) => !isTripArchived(trip))
  const historyTrips = [...(trips.data ?? []).filter(isTripArchived)].sort((left, right) => new Date(right.departureDateTime).getTime() - new Date(left.departureDateTime).getTime())
  const visibleTrips = view === 'agenda' ? activeTrips : historyTrips
  const selectedRoute = (routes.data ?? []).find((route) => route.id === Number(form.routeId))
  const tripWindow = selectedRoute && form.departureDateTime ? getRequestedTripWindow(form.departureDateTime, selectedRoute.estimatedDurationMinutes) : null
  const selectedBusConflict = form.busId && tripWindow ? findBusScheduleConflict(Number(form.busId), tripWindow, trips.data ?? []) : null

  return (
    <section className="page two-column">
      <div>
        <PageTitle title="Viajes" subtitle="La agenda muestra la operacion vigente; los viajes pasados quedan guardados en historial." />
        <DataPanel title="Agenda">
          <QueryError query={trips} />
          <div className="segmented-control" role="tablist" aria-label="Vista de viajes">
            <button className={view === 'agenda' ? 'active' : ''} onClick={() => setView('agenda')} type="button">
              Agenda ({activeTrips.length})
            </button>
            <button className={view === 'history' ? 'active' : ''} onClick={() => setView('history')} type="button">
              Historial ({historyTrips.length})
            </button>
          </div>
          <table>
            <thead><tr><th>Ruta</th><th>Autobus</th><th>Salida</th><th>Llegada</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {visibleTrips.map((trip) => <tr key={trip.id}><td>{trip.origin} - {trip.destination}</td><td>{trip.busNumber}</td><td>{dateTime(trip.departureDateTime)}</td><td>{dateTime(trip.estimatedArrivalDateTime)}</td><td><Badge>{tripStatusLabel(trip)}</Badge></td><td>{isTripSellable(trip) && <button className="ghost small-button" onClick={() => cancel.mutate(trip.id)}>Cancelar</button>}</td></tr>)}
              {!visibleTrips.length && <EmptyRow colSpan={6}>{view === 'agenda' ? 'No hay viajes vigentes.' : 'Todavia no hay viajes en historial.'}</EmptyRow>}
            </tbody>
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
            {(buses.data ?? []).map((bus) => {
              const conflict = tripWindow ? findBusScheduleConflict(bus.id, tripWindow, trips.data ?? []) : null

              return (
                <option key={bus.id} value={bus.id} disabled={Boolean(conflict)}>
                  {bus.busNumber} ({bus.capacity}){conflict ? ` - ocupado hasta ${dateTime(conflict.estimatedArrivalDateTime)}` : ''}
                </option>
              )
            })}
          </select>
          <input type="datetime-local" value={form.departureDateTime} onChange={(e) => setForm({ ...form, departureDateTime: e.target.value })} />
          {selectedBusConflict && <div className="info-message">Ese autobus ya tiene un viaje que se cruza con este horario. Selecciona otro autobus o programa la salida despues de {dateTime(selectedBusConflict.estimatedArrivalDateTime)}.</div>}
          <SubmitButton loading={create.isPending} disabled={Boolean(selectedBusConflict)}>Programar viaje</SubmitButton>
          <MutationError mutation={create} />
        </form>
      </DataPanel>
    </section>
  )
}
