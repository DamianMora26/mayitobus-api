export type RoleName = 'TERMINAL_MANAGER' | 'TICKET_SELLER'

export type AuthUser = {
  token: string
  tokenType: string
  userId: number
  fullName: string
  email: string
  roleName: RoleName
}

export type ApiError = {
  message: string
  status?: number
  fields?: Record<string, string>
}

export type Bus = {
  id: number
  busNumber: string
  licensePlate: string
  model: string
  capacity: number
  status: string
  createdAt: string
}

export type User = {
  id: number
  fullName: string
  email: string
  phone: string | null
  roleName: RoleName
  active: boolean
  createdAt: string
}

export type Route = {
  id: number
  origin: string
  destination: string
  basePrice: number
  estimatedDurationMinutes: number
  active: boolean
  createdAt: string
}

export type Trip = {
  id: number
  routeId: number
  origin: string
  destination: string
  basePrice: number
  busId: number
  busNumber: string
  departureDateTime: string
  estimatedArrivalDateTime: string
  status: string
  createdAt: string
}

export type Ticket = {
  id: number
  tripId: number
  origin: string
  destination: string
  departureDateTime: string
  busId: number
  busNumber: string
  sellerUserId: number
  sellerName: string
  passengerName: string
  seatNumber: number
  price: number
  passengerType: string
  discountPercentage: number
  status: string
  soldAt: string
  cancelledAt: string | null
}

export type Seat = {
  seatNumber: number
  status: 'AVAILABLE' | 'SOLD'
  ticketId: number | null
  passengerName: string | null
}

export type TripSeats = {
  tripId: number
  capacity: number
  soldSeats: number
  availableSeats: number
  seats: Seat[]
}

export type SalesReport = {
  fromDate: string
  toDate: string
  soldTickets: number
  cancelledTickets: number
  grossRevenue: number
  cancelledRevenue: number
  netRevenue: number
  dailyReports: Array<{
    date: string
    soldTickets: number
    cancelledTickets: number
    grossRevenue: number
    cancelledRevenue: number
    netRevenue: number
  }>
}
