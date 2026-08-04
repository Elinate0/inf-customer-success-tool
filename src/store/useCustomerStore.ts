import { create } from 'zustand'
import { createClient } from '@/lib/supabase/client'

export type CustomerStatus = 'active' | 'at_risk' | 'churned'

export interface Customer {
  id: string
  name: string
  company: string
  email: string
  health_score: number
  status: CustomerStatus
  last_contact_date: string
  created_at?: string
  updated_at?: string
}

interface CustomerState {
  customers: Customer[]
  loading: boolean
  error: string | null
  fetchCustomers: () => Promise<void>
  addCustomer: (customer: Omit<Customer, 'id' | 'health_score' | 'status' | 'created_at' | 'updated_at'>) => Promise<void>
  syncEmailsWithMicrosoft: () => Promise<void>
}

const supabase = createClient()

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  loading: false,
  error: null,
  
  fetchCustomers: async () => {
    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      set({ customers: data || [], loading: false })
    } catch (err: any) {
      set({ error: err.message, loading: false })
      console.error('Fetch customers error:', err)
    }
  },

  addCustomer: async (newCustomer) => {
    set({ loading: true, error: null })
    try {
      const customerToInsert = {
        ...newCustomer,
        health_score: 100,
        status: 'active' as CustomerStatus,
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([customerToInsert])
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        customers: [data, ...state.customers],
        loading: false
      }))
    } catch (err: any) {
      set({ error: err.message, loading: false })
      console.error('Add customer error:', err)
      throw err 
    }
  },

  syncEmailsWithMicrosoft: async () => {
    set({ loading: true, error: null })
    try {
      const providerToken = localStorage.getItem('microsoft_provider_token')
      if (!providerToken) {
        throw new Error('Microsoft bağlantısı bulunamadı. Lütfen sistemden çıkış yapıp "Microsoft ile Giriş Yap" butonunu kullanarak tekrar giriş yapın.')
      }

      // Fetch last 50 emails from Outlook
      const response = await fetch('https://graph.microsoft.com/v1.0/me/messages?$select=sender,receivedDateTime&$top=50', {
        headers: {
          'Authorization': `Bearer ${providerToken}`
        }
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error?.message || 'Microsoft Graph API ye bağlanılamadı.')
      }

      const data = await response.json()
      const messages = data.value || []

      // Group latest dates by email address
      const latestContactByEmail: Record<string, string> = {}
      
      messages.forEach((msg: any) => {
        const emailAddress = msg.sender?.emailAddress?.address?.toLowerCase()
        const receivedDate = msg.receivedDateTime

        if (emailAddress && receivedDate) {
          if (!latestContactByEmail[emailAddress] || new Date(receivedDate) > new Date(latestContactByEmail[emailAddress])) {
            latestContactByEmail[emailAddress] = receivedDate
          }
        }
      })

      const currentCustomers = get().customers
      let updatedCount = 0

      // Update Supabase and local state for matching customers
      for (const customer of currentCustomers) {
        const customerEmail = customer.email.toLowerCase()
        const latestContact = latestContactByEmail[customerEmail]
        
        if (latestContact) {
          const latestContactDate = new Date(latestContact)
          const currentContactDate = new Date(customer.last_contact_date)

          // Only update if the email is newer than current record
          if (latestContactDate > currentContactDate) {
            const { error } = await supabase
              .from('customers')
              .update({ last_contact_date: latestContactDate.toISOString() })
              .eq('id', customer.id)

            if (error) {
              console.error(`Failed to update customer ${customer.email}:`, error)
            } else {
              updatedCount++
            }
          }
        }
      }

      // Refresh customers state from database to ensure consistency
      await get().fetchCustomers()
      
      if (updatedCount > 0) {
        alert(`${updatedCount} müşterinin son iletişim tarihi başarıyla güncellendi!`)
      } else {
        alert('Yeni bir e-posta eşleşmesi bulunamadı.')
      }

    } catch (err: any) {
      set({ error: err.message, loading: false })
      console.error('Email sync error:', err)
      throw err
    }
  }
}))
