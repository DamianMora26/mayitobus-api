import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { api } from '../api'
import type { Route } from '../types'
import { type DurationUnit, money, durationLabel, statusLabel, durationToMinutes } from '../utils'
import { useList, useCreate, PageTitle, DataPanel, QueryError, Badge, MutationError, SubmitButton } from '../ui'

export function RoutesPage() {
  const queryClient = useQueryClient()
  const routes = useList<Route[]>('routes', '/api/routes')
  const [form, setForm] = useState({ origin: '', destination: '', basePrice: '', estimatedDurationValue: '40', estimatedDurationUnit: 'MINUTES' as DurationUnit })
  const create = useCreate('/api/routes', ['routes'], () => setForm({ origin: '', destination: '', basePrice: '', estimatedDurationValue: '40', estimatedDurationUnit: 'MINUTES' }))
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
            <thead><tr><th>Origen</th><th>Destino</th><th>Precio</th><th>Duracion</th><th>Estado</th><th></th></tr></thead>
            <tbody>{(routes.data ?? []).map((route) => <tr key={route.id}><td>{route.origin}</td><td>{route.destination}</td><td>{money(route.basePrice)}</td><td>{durationLabel(route.estimatedDurationMinutes)}</td><td><Badge>{statusLabel(route.active ? 'ACTIVE' : 'INACTIVE')}</Badge></td><td><button className="ghost small-button" onClick={() => updateStatus.mutate({ id: route.id, action: route.active ? 'deactivate' : 'activate' })}>{route.active ? 'Desactivar' : 'Activar'}</button></td></tr>)}</tbody>
          </table>
          <MutationError mutation={updateStatus} />
        </DataPanel>
      </div>
      <DataPanel title="Nueva ruta">
        <form className="form stack" onSubmit={(event) => { event.preventDefault(); create.mutate({ origin: form.origin, destination: form.destination, basePrice: Number(form.basePrice), estimatedDurationMinutes: durationToMinutes(form.estimatedDurationValue, form.estimatedDurationUnit) }) }}>
          <label>Origen<input placeholder="Navojoa" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} /></label>
          <label>Destino<input placeholder="Huatabampo" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} /></label>
          <label>Precio base<input inputMode="decimal" placeholder="70.00" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} /></label>
          <label>
            Duracion estimada
            <div className="duration-field">
              <input inputMode="decimal" placeholder="40" value={form.estimatedDurationValue} onChange={(e) => setForm({ ...form, estimatedDurationValue: e.target.value })} />
              <select value={form.estimatedDurationUnit} onChange={(e) => setForm({ ...form, estimatedDurationUnit: e.target.value as DurationUnit })}>
                <option value="MINUTES">minutos</option>
                <option value="HOURS">horas</option>
              </select>
            </div>
          </label>
          <p className="form-hint">Selecciona la unidad: por ejemplo 40 minutos o 2 horas.</p>
          <SubmitButton loading={create.isPending}>Crear ruta</SubmitButton>
          <MutationError mutation={create} />
        </form>
      </DataPanel>
    </section>
  )
}