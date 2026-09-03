import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { api } from '../api'
import type { Bus } from '../types'
import { statusLabel } from '../utils'
import { useList, useCreate, PageTitle, RefreshButton, DataPanel, QueryError, Badge, MutationError, SubmitButton } from '../ui'

export function BusesPage() {
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
            <thead><tr><th>Numero</th><th>Placas</th><th>Modelo</th><th>Capacidad</th><th>Estado</th><th></th></tr></thead>
            <tbody>{(buses.data ?? []).map((bus) => <tr key={bus.id}><td>{bus.busNumber}</td><td>{bus.licensePlate}</td><td>{bus.model}</td><td>{bus.capacity}</td><td><Badge>{statusLabel(bus.status)}</Badge></td><td><button className="ghost small-button" onClick={() => updateStatus.mutate({ id: bus.id, action: bus.status === 'ACTIVE' ? 'deactivate' : 'activate' })}>{bus.status === 'ACTIVE' ? 'Desactivar' : 'Activar'}</button></td></tr>)}</tbody>
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