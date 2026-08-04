'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function GlobalAuthListener() {
  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const providerToken = session?.provider_token
        if (providerToken) {
          console.log('Provider token yakalandı ve kaydedildi.')
          localStorage.setItem('microsoft_provider_token', providerToken)
        }
      } else if (event === 'SIGNED_OUT') {
        localStorage.removeItem('microsoft_provider_token')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
