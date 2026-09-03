import type { Trip, Ticket as TicketType, TripSeats } from './types'

export type DurationUnit = 'MINUTES' | 'HOURS'
export type PassengerType = 'NORMAL' | 'ADULTO_MAYOR' | 'NINO' | 'ESTUDIANTE' | 'DISCAPACITADO'

export const passengerTypes: Array<{ value: PassengerType; label: string; discount: number }> = [
  { value: 'NORMAL', label: 'Normal', discount: 0 },
  { value: 'ADULTO_MAYOR', label: 'Adulto mayor', discount: 50 },
  { value: 'NINO', label: 'Niño', discount: 25 },
  { value: 'ESTUDIANTE', label: 'Estudiante', discount: 35 },
  { value: 'DISCAPACITADO', label: 'Persona discapacitada', discount: 50 },
]

export function money(value: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value))
}

export function roleLabel(role: string) {
  return role === 'TERMINAL_MANAGER' ? 'Gerente de terminal' : 'Vendedor de boletos'
}

export function passengerTypeLabel(type: string) {
  return passengerTypes.find((passengerType) => passengerType.value === type)?.label ?? type
}

export function statusLabel(status: string) {
  const labels: Record<string, string> = {
    ACTIVE: 'Activo',
    INACTIVE: 'Inactivo',
    SCHEDULED: 'Programado',
    IN_PROGRESS: 'En curso',
    FINISHED: 'Finalizado',
    CANCELLED: 'Cancelado',
    SOLD: 'Vendido',
    AVAILABLE: 'Disponible',
  }

  return labels[status] ?? status
}

export function durationLabel(minutes: number) {
  if (minutes < 60) {
    return `${minutes} min`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} h`
  }

  return `${hours} h ${remainingMinutes} min`
}

export function durationToMinutes(value: string, unit: DurationUnit) {
  const numericValue = Number(value)

  if (unit === 'HOURS') {
    return Math.round(numericValue * 60)
  }

  return Math.round(numericValue)
}

export function isTripSellable(trip: Trip) {
  return trip.status === 'SCHEDULED' && new Date(trip.departureDateTime).getTime() > Date.now()
}

export function getTicketSaleValidationMessage({ tripId, passengerName, seatNumber, seats }: { tripId: string; passengerName: string; seatNumber: string; seats?: TripSeats }) {
  const trimmedSeatNumber = seatNumber.trim()

  if (!tripId) {
    return 'Selecciona un viaje programado antes de vender el boleto.'
  }

  if (!passengerName.trim()) {
    return 'Escribe el nombre del pasajero antes de vender el boleto.'
  }

  if (!trimmedSeatNumber) {
    return 'Selecciona un asiento disponible en el mapa o escribe el numero de asiento.'
  }

  const numericSeatNumber = Number(trimmedSeatNumber)

  if (!Number.isInteger(numericSeatNumber) || numericSeatNumber < 1) {
    return 'Escribe un numero de asiento valido o elige uno en el mapa.'
  }

  if (seats && numericSeatNumber > seats.capacity) {
    return `El asiento ${numericSeatNumber} no esta disponible en este autobus. Elige del 1 al ${seats.capacity}.`
  }

  const selectedSeat = seats?.seats.find((seat) => seat.seatNumber === numericSeatNumber)

  if (selectedSeat?.status === 'SOLD') {
    return 'Ese asiento ya esta vendido. Elige un asiento disponible.'
  }

  return ''
}

export type TripWindow = {
  departure: Date
  arrival: Date
}

export function getRequestedTripWindow(departureDateTime: string, durationMinutes: number): TripWindow {
  const departure = new Date(departureDateTime)

  return {
    departure,
    arrival: new Date(departure.getTime() + durationMinutes * 60_000),
  }
}

export function findBusScheduleConflict(busId: number, requestedWindow: TripWindow, trips: Trip[]) {
  return trips.find((trip) => {
    if (trip.busId !== busId || trip.status === 'CANCELLED') {
      return false
    }

    const existingDeparture = new Date(trip.departureDateTime)
    const existingArrival = new Date(trip.estimatedArrivalDateTime)

    return requestedWindow.departure < existingArrival && requestedWindow.arrival > existingDeparture
  }) ?? null
}

export function isTicketFromToday(ticket: TicketType) {
  return isSameLocalDate(ticket.soldAt, new Date())
}

export function isTicketCancellable(ticket: TicketType) {
  return ticket.status === 'SOLD' && new Date(ticket.departureDateTime).getTime() > Date.now()
}

export function isSameLocalDate(value: string, date: Date) {
  const valueDate = new Date(value)

  return valueDate.getFullYear() === date.getFullYear()
    && valueDate.getMonth() === date.getMonth()
    && valueDate.getDate() === date.getDate()
}

export function isTripArchived(trip: Trip) {
  return trip.status === 'CANCELLED' || new Date(trip.estimatedArrivalDateTime).getTime() < Date.now()
}

export function tripStatusLabel(trip: Trip) {
  if (trip.status === 'CANCELLED') return statusLabel('CANCELLED')
  if (isTripArchived(trip)) return statusLabel('FINISHED')
  if (isTripInProgress(trip)) return statusLabel('IN_PROGRESS')

  return statusLabel(trip.status)
}

export function isTripInProgress(trip: Trip) {
  const now = Date.now()

  return trip.status === 'SCHEDULED'
    && new Date(trip.departureDateTime).getTime() <= now
    && new Date(trip.estimatedArrivalDateTime).getTime() >= now
}

export function seatSlotClass(seatNumber: number) {
  const position = (seatNumber - 1) % 4

  if (position === 0) return 'left-window'
  if (position === 1) return 'left-aisle'
  if (position === 2) return 'right-aisle'

  return 'right-window'
}

export function dateTime(value: string) {
  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function dateOnly(value: string) {
  const [year, month, day] = value.split('-').map(Number)

  if (!year || !month || !day) {
    return value
  }

  return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(year, month - 1, day))
}
