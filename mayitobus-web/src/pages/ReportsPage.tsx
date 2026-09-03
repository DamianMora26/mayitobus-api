import { useState } from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../api'
import type { SalesReport } from '../types'
import { money, dateOnly, dateTime, durationLabel, statusLabel, passengerTypeLabel } from '../utils'
import { useList, PageTitle, DataPanel, QueryError, Badge, MutationError, SubmitButton, EmptyRow, EmptyPanel, Metric } from '../ui'
import { FileDown, Ticket, RefreshCcw, CircleDollarSign, BarChart3 } from 'lucide-react'

export function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10)
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const report = useQuery({
    queryKey: ['sales-report', from, to],
    queryFn: async () => (await api.get<SalesReport>(`/api/reports/sales?from=${from}&to=${to}`)).data,
  })
  const dailyReports = report.data?.dailyReports ?? []

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
      <ReportVisuals rows={dailyReports} />
      <DataPanel title="Desglose diario">
        <QueryError query={report} />
        <table>
          <thead><tr><th>Fecha</th><th>Vendidos</th><th>Cancelados</th><th>Bruto</th><th>Neto</th></tr></thead>
          <tbody>
            {dailyReports.map((row) => <tr key={row.date}><td>{dateOnly(row.date)}</td><td>{row.soldTickets}</td><td>{row.cancelledTickets}</td><td>{money(row.grossRevenue)}</td><td>{money(row.netRevenue)}</td></tr>)}
            {!dailyReports.length && <EmptyRow colSpan={5}>No hay movimientos en este rango.</EmptyRow>}
          </tbody>
        </table>
      </DataPanel>
    </section>
  )
}

function ReportVisuals({ rows }: { rows: SalesReport['dailyReports'] }) {
  const maxRevenue = Math.max(...rows.map((row) => Number(row.netRevenue)), 1)
  const maxTickets = Math.max(...rows.map((row) => row.soldTickets + row.cancelledTickets), 1)

  return (
    <div className="report-visual-grid">
      <DataPanel title="Venta neta por dia">
        {rows.length ? (
          <div className="report-chart">
            {rows.map((row) => {
              const width = Math.max((Number(row.netRevenue) / maxRevenue) * 100, Number(row.netRevenue) > 0 ? 4 : 0)

              return (
                <div className="report-bar-row" key={row.date}>
                  <span>{dateOnly(row.date)}</span>
                  <div className="report-bar-track"><i className="report-bar net" style={{ width: `${width}%` }} /></div>
                  <strong>{money(row.netRevenue)}</strong>
                </div>
              )
            })}
          </div>
        ) : <EmptyPanel>No hay ventas para graficar.</EmptyPanel>}
      </DataPanel>
      <DataPanel title="Boletos por dia">
        {rows.length ? (
          <div className="report-chart">
            {rows.map((row) => {
              const soldWidth = Math.max((row.soldTickets / maxTickets) * 100, row.soldTickets > 0 ? 4 : 0)
              const cancelledWidth = Math.max((row.cancelledTickets / maxTickets) * 100, row.cancelledTickets > 0 ? 4 : 0)

              return (
                <div className="ticket-bar-row" key={row.date}>
                  <div className="ticket-bar-label">
                    <span>{dateOnly(row.date)}</span>
                    <strong>{row.soldTickets} vendidos</strong>
                  </div>
                  <div className="ticket-bar-stack">
                    <i className="report-bar sold" style={{ width: `${soldWidth}%` }} />
                    <i className="report-bar cancelled" style={{ width: `${cancelledWidth}%` }} />
                  </div>
                  <small>{row.cancelledTickets} cancelados</small>
                </div>
              )
            })}
            <div className="report-legend">
              <span><i className="legend-dot sold" />Vendidos</span>
              <span><i className="legend-dot cancelled" />Cancelados</span>
            </div>
          </div>
        ) : <EmptyPanel>No hay boletos para graficar.</EmptyPanel>}
      </DataPanel>
    </div>
  )
}