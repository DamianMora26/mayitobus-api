import type { ReactNode } from 'react'
import { Plus, RefreshCcw, LayoutDashboard } from 'lucide-react'
import { getApiError } from './api'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from './api'

export function useList<T>(key: string, url: string) {
  return useQuery({
    queryKey: [key],
    queryFn: async () => (await api.get<T>(url)).data,
  })
}

export function useCreate(url: string, invalidateKeys: string[], onDone: () => void) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: unknown) => (await api.post(url, payload)).data,
    onSuccess: () => {
      invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: [key] }))
      onDone()
    },
  })
}

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return <div className="page-title"><h1>{title}</h1><p>{subtitle}</p></div>
}

export function DataPanel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="panel"><h2>{title}</h2><div className="panel-body">{children}</div></section>
}

export function PanelSummary({ current, total, label, action, onClick }: { current: number; total: number; label: string; action: string; onClick: () => void }) {
  return (
    <div className="panel-summary">
      <span>Mostrando {current} de {total} {label}</span>
      <button className="ghost small-button" type="button" onClick={onClick}>{action}</button>
    </div>
  )
}

export function Metric({ icon: Icon, label, value }: { icon: typeof LayoutDashboard; label: string; value: string | number }) {
  return <div className="metric"><Icon size={21} /><span>{label}</span><strong>{value}</strong></div>
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="badge">{children}</span>
}

export function SubmitButton({ loading, disabled = false, children }: { loading: boolean; disabled?: boolean; children: ReactNode }) {
  return <button className="primary-action" disabled={loading || disabled}><Plus size={17} />{loading ? 'Guardando...' : children}</button>
}

export function RefreshButton({ onClick }: { onClick: () => void }) {
  return <button className="ghost refresh" onClick={onClick}><RefreshCcw size={16} />Actualizar</button>
}

export function MutationError({ mutation }: { mutation: { error: unknown } }) {
  const error = mutation.error ? getApiError(mutation.error) : null
  return error ? <div className="alert">{error.message}</div> : null
}

export function QueryError({ query }: { query: { error: unknown } }) {
  const error = query.error ? getApiError(query.error) : null
  return error ? <div className="alert">{error.message}</div> : null
}

export function EmptyRow({ children, colSpan }: { children: ReactNode; colSpan: number }) {
  return (
    <tr>
      <td className="empty-cell" colSpan={colSpan}>{children}</td>
    </tr>
  )
}

export function EmptyPanel({ children }: { children: ReactNode }) {
  return <div className="empty-panel">{children}</div>
}
