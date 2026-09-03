import { useState, FormEvent } from 'react'
import { useQueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../api'
import type { AuthUser, Trip, TripSeats, Ticket as TicketType } from '../types'
import { type PassengerType, passengerTypes, isTripSellable, money, dateTime, getTicketSaleValidationMessage, seatSlotClass, passengerTypeLabel, isTicketCancellable, statusLabel, dateOnly, isTicketFromToday } from '../utils'
import { useList, PageTitle, DataPanel, QueryError, Badge, MutationError, SubmitButton, EmptyRow } from '../ui'
import { Armchair, BadgePercent, BusFront, Printer, Search, Map, TicketX, FileDown } from 'lucide-react'

export function TicketSale({ user }: { user: AuthUser }) {
  const queryClient = useQueryClient()
  const trips = useList<Trip[]>('trips', '/api/trips')
  const tickets = useList<TicketType[]>('tickets', '/api/tickets')
  const [tripId, setTripId] = useState('')
  const [passengerName, setPassengerName] = useState('')
  const [seatNumber, setSeatNumber] = useState('')
  const [passengerType, setPassengerType] = useState<PassengerType>('NORMAL')
  const [printTicket, setPrintTicket] = useState<TicketType | null>(null)
  const [ticketView, setTicketView] = useState<'today' | 'history'>('today')
  const [saleError, setSaleError] = useState('')
  const selectedTripId = Number(tripId)
  const scheduledTrips = (trips.data ?? []).filter(isTripSellable)
  const selectedTrip = (trips.data ?? []).find((trip) => trip.id === selectedTripId)
  const todayTickets = (tickets.data ?? []).filter(isTicketFromToday)
  const historyTickets = (tickets.data ?? []).filter((ticket) => !isTicketFromToday(ticket))
  const visibleTickets = ticketView === 'today' ? todayTickets : historyTickets
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
      setSaleError('')
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
  const handleTicketSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const validationMessage = getTicketSaleValidationMessage({
      tripId,
      passengerName,
      seatNumber,
      seats: seats.data,
    })

    if (validationMessage) {
      setSaleError(validationMessage)
      return
    }

    setSaleError('')
    create.mutate()
  }

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
          <form className="form sale-form" onSubmit={handleTicketSubmit}>
            <select value={tripId} onChange={(event) => { setTripId(event.target.value); setSeatNumber(''); setSaleError('') }}>
              <option value="">{scheduledTrips.length ? 'Viaje programado' : 'Primero programa un viaje'}</option>
              {scheduledTrips.map((trip) => <option key={trip.id} value={trip.id}>{trip.origin} - {trip.destination} / {dateTime(trip.departureDateTime)}</option>)}
            </select>
            <input placeholder="Pasajero" value={passengerName} onChange={(event) => { setPassengerName(event.target.value); setSaleError('') }} />
            <input placeholder="Asiento" inputMode="numeric" value={seatNumber} onChange={(event) => { setSeatNumber(event.target.value); setSaleError('') }} />
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
          {saleError && <div className="alert">{saleError}</div>}
          <MutationError mutation={create} />
        </section>
        <DataPanel title="Boletos">
          <QueryError query={tickets} />
          <div className="segmented-control" role="tablist" aria-label="Vista de boletos">
            <button className={ticketView === 'today' ? 'active' : ''} onClick={() => setTicketView('today')} type="button">
              Hoy ({todayTickets.length})
            </button>
            <button className={ticketView === 'history' ? 'active' : ''} onClick={() => setTicketView('history')} type="button">
              Historial ({historyTickets.length})
            </button>
          </div>
          <table>
            <thead><tr><th>Pasajero</th><th>Categoria</th><th>Ruta</th><th>Venta</th><th>Asiento</th><th>Precio</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {visibleTickets.map((ticket) => <tr key={ticket.id}><td>{ticket.passengerName}</td><td>{passengerTypeLabel(ticket.passengerType)}</td><td>{ticket.origin} - {ticket.destination}</td><td>{dateTime(ticket.soldAt)}</td><td>{ticket.seatNumber}</td><td>{money(ticket.price)}</td><td><Badge>{statusLabel(ticket.status)}</Badge></td><td className="row-actions"><button className="ghost small-button" onClick={() => setPrintTicket(ticket)}>Imprimir</button>{isTicketCancellable(ticket) && <button className="ghost small-button" onClick={() => cancel.mutate(ticket.id)}>Cancelar</button>}</td></tr>)}
              {!visibleTickets.length && <EmptyRow colSpan={8}>{ticketView === 'today' ? 'No hay boletos vendidos hoy.' : 'Todavia no hay boletos en historial.'}</EmptyRow>}
            </tbody>
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
                onClick={() => {
                  if (seat.status === 'AVAILABLE') {
                    setSeatNumber(String(seat.seatNumber))
                    setSaleError('')
                  }
                }}
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
            <strong>&rarr;</strong>
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
          <button className="primary-action" onClick={printTicketPaper}><Printer size={17} />Imprimir</button>
        </div>
      </section>
    </div>
  )
}

function printTicketPaper() {
  const ticket = document.getElementById('printable-ticket')

  if (!ticket) return

  const frame = document.createElement('iframe')
  frame.title = 'Impresion de boleto'
  frame.style.position = 'fixed'
  frame.style.right = '0'
  frame.style.bottom = '0'
  frame.style.width = '1px'
  frame.style.height = '1px'
  frame.style.border = '0'
  frame.style.opacity = '0'
  document.body.appendChild(frame)

  const frameWindow = frame.contentWindow
  const frameDocument = frameWindow?.document

  if (!frameWindow || !frameDocument) {
    frame.remove()
    return
  }

  frameWindow.onafterprint = () => frame.remove()
  frameDocument.open()
  frameDocument.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <base href="${window.location.origin}" />
        <title>Boleto MayitoBus</title>
        <style>
          @page { margin: 12mm; size: auto; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            background: #fff;
            color: #182227;
            font-family: Inter, ui-sans-serif, system-ui, "Segoe UI", sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .ticket-paper {
            width: 420px;
            background: #fff;
            border: 1px dashed #b8c5cc;
            border-radius: 16px;
            padding: 22px;
            box-shadow: none;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .ticket-brand {
            display: flex;
            align-items: center;
            gap: 12px;
            padding-bottom: 16px;
            border-bottom: 3px solid #ffc928;
          }
          .ticket-brand img {
            width: 58px;
            height: 58px;
            object-fit: cover;
            border-radius: 12px;
          }
          .ticket-brand strong,
          .ticket-brand span {
            display: block;
          }
          .ticket-brand strong {
            font-size: 20px;
          }
          .ticket-brand span,
          .ticket-details span,
          .ticket-total span {
            color: #66727a;
          }
          .ticket-brand span,
          .ticket-details span {
            font-size: 13px;
          }
          .ticket-route {
            min-height: 78px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
            color: #c7192f;
            font-size: 19px;
            font-weight: 900;
          }
          .ticket-route strong {
            color: #1e6fb6;
          }
          .ticket-details {
            display: grid;
            grid-template-columns: 110px 1fr;
            gap: 10px 14px;
            padding: 16px 0;
            border-top: 1px solid #edf1f3;
            border-bottom: 1px solid #edf1f3;
          }
          .ticket-details strong {
            color: #182227;
          }
          .ticket-total {
            margin-top: 16px;
            display: flex;
            align-items: end;
            justify-content: space-between;
          }
          .ticket-total strong {
            color: #c7192f;
            font-size: 30px;
          }
        </style>
      </head>
      <body>${ticket.outerHTML}</body>
    </html>
  `)
  frameDocument.close()

  const images = Array.from(frameDocument.images)
  const imageLoad = images.map((image) => {
    if (image.complete) return Promise.resolve()

    return new Promise<void>((resolve) => {
      image.onload = () => resolve()
      image.onerror = () => resolve()
    })
  })

  Promise.all(imageLoad).then(() => {
    frameWindow.focus()
    frameWindow.print()
    window.setTimeout(() => {
      if (document.body.contains(frame)) frame.remove()
    }, 1000)
  })
}
