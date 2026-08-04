'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const router = useRouter()
  // Debug env vars
  const hasEnvUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasEnvKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log("Login attempt started...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log("Supabase response:", { data, error })

      if (error) {
        setError(error.message || 'Geçersiz e-posta veya şifre.')
        setLoading(false)
      } else {
        console.log("Login success! Checking cookies...")
        setSuccessMsg("Giriş Başarılı! Çerezler kontrol ediliyor...")
        
        setTimeout(() => {
          if (!document.cookie.includes('sb-')) {
            setError("Kritik Hata: Tarayıcı çerezleri kaydetmeyi reddetti! (Gizli sekme veya çerez engelleyici açık olabilir)")
            setSuccessMsg(null)
          } else {
            setSuccessMsg("Çerezler onaylandı! Yönlendiriliyorsunuz...")
            setTimeout(() => {
              window.location.href = '/dashboard'
            }, 1000)
          }
        }, 1500)
      }
    } catch (err: any) {
      console.error("Login Error: ", err)
      setError(err.message || 'Beklenmeyen bir bağlantı hatası oluştu.')
      setLoading(false)
    }
  }

  const handleMicrosoftLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          scopes: 'email offline_access User.Read Mail.Read',
          redirectTo: `${window.location.origin}/dashboard`
        }
      })
      if (error) throw error
    } catch (err: any) {
      console.error("Microsoft Login Error: ", err)
      setError(err.message || 'Microsoft ile giriş yapılamadı.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0A0A0B]">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />

      <div className="w-full max-w-md p-8 relative z-10">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 border border-blue-500/30">
              <Lock size={24} />
            </div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Komuta Merkezi</h1>
            
            {!hasEnvUrl && (
              <div className="mt-4 p-3 bg-red-500/20 text-red-400 text-xs rounded-xl text-center w-full border border-red-500/30">
                CRITICAL ERROR: Supabase URL Vercel'de eksik! Redeploy yapmalısınız.
              </div>
            )}
            
            <p className="text-sm text-gray-400 mt-2 text-center">
              Müşteri Başarı yönetimi paneline giriş yapın
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1">E-posta</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 transition-all outline-none"
                  placeholder="admin@sirket.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-400 ml-1">Şifre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={16} className="text-gray-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 transition-all outline-none"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                <p className="text-sm text-emerald-400 text-center font-medium">{successMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all focus:ring-2 focus:ring-blue-500/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-center space-x-4">
            <div className="h-px bg-white/10 flex-1"></div>
            <span className="text-xs text-gray-500 font-medium">VEYA</span>
            <div className="h-px bg-white/10 flex-1"></div>
          </div>

          <button
            type="button"
            onClick={handleMicrosoftLogin}
            disabled={loading}
            className="mt-6 w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-[#2F2F2F] hover:bg-[#3F3F3F] text-white border border-white/10 rounded-xl font-medium transition-all focus:ring-2 focus:ring-white/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
              <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
              <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
              <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
            </svg>
            Microsoft ile Giriş Yap (E-posta Eşitleme)
          </button>
        </div>
        
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} Komuta Merkezi. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </div>
  )
}
