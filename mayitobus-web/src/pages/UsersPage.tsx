import { useState } from 'react'
import { useQueryClient, useMutation } from '@tanstack/react-query'
import { api } from '../api'
import type { User } from '../types'
import { roleLabel, statusLabel } from '../utils'
import { useList, useCreate, PageTitle, DataPanel, QueryError, Badge, MutationError, SubmitButton } from '../ui'

export function UsersPage() {
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
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {(users.data ?? []).map((item) => (
                <tr key={item.id}>
                  <td>{item.fullName}</td>
                  <td>{item.email}</td>
                  <td>{roleLabel(item.roleName)}</td>
                  <td><Badge>{statusLabel(item.active ? 'ACTIVE' : 'INACTIVE')}</Badge></td>
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