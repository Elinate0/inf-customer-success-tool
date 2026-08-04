import { create } from 'zustand'

export type CustomerStatus = 'active' | 'at_risk' | 'churned'

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  health_score: number
  status: CustomerStatus
  last_contact_date: string
  open_tickets_count: number // for dynamic calculation
}

interface CustomerState {
  customers: Customer[]
  setCustomers: (customers: Customer[]) => void
  calculateHealthScore: (customerId: string) => void
}

// Temporary Mock Data
const mockCustomers: Customer[] = [
  { id: '1', name: 'Ahmet Yılmaz', company: 'Acme Corp', email: 'ahmet@acme.com', health_score: 95.5, status: 'active', last_contact_date: '2026-08-01', open_tickets_count: 0 },
  { id: '2', name: 'Ayşe Demir', company: 'XYZ Ltd', email: 'ayse@xyz.com', health_score: 82.0, status: 'active', last_contact_date: '2026-07-28', open_tickets_count: 1 },
  { id: '3', name: 'Mehmet Kaya', company: 'Global A.Ş.', email: 'mehmet@global.com', health_score: 45.0, status: 'at_risk', last_contact_date: '2026-07-10', open_tickets_count: 3 },
]

// Simple mock logic for Health Score based on MCDM concept
// A real MCDM (like SWARA/VIKOR) would use weighted sums and normalization matrices.
const weights = {
  last_contact: 0.6,
  open_tickets: 0.4,
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: mockCustomers,
  setCustomers: (customers) => set({ customers }),
  calculateHealthScore: (customerId) => {
    set((state) => {
      const customers = state.customers.map(c => {
        if (c.id === customerId) {
          // Mock calculation
          const daysSinceContact = Math.floor((new Date().getTime() - new Date(c.last_contact_date).getTime()) / (1000 * 3600 * 24))
          
          let contactScore = 100 - (daysSinceContact * 2) // decrease 2 points per day
          if (contactScore < 0) contactScore = 0
          
          let ticketScore = 100 - (c.open_tickets_count * 20) // decrease 20 points per ticket
          if (ticketScore < 0) ticketScore = 0

          const newScore = (contactScore * weights.last_contact) + (ticketScore * weights.open_tickets)
          
          return {
            ...c,
            health_score: Number(newScore.toFixed(2)),
            status: newScore < 50 ? 'at_risk' : (newScore < 20 ? 'churned' : 'active') as CustomerStatus
          }
        }
        return c
      })
      return { customers }
    })
  }
}))
