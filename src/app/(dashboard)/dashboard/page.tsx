import { createClient } from '@/lib/supabase/server'
import { Activity, AlertTriangle, Users, CheckCircle2 } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = createClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // MOCK DATA for Dashboard
  const stats = [
    { title: 'Aktif Müşteriler', value: '24', icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'Riskli Müşteriler (Red Flag)', value: '3', icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-400/10' },
    { title: 'Ort. Sağlık Skoru', value: '86', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'Tamamlanan Görevler', value: '12', icon: CheckCircle2, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  ]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Hoş Geldiniz, {user?.email?.split('@')[0]}</h1>
          <p className="text-gray-400 mt-1">İşte bugünkü müşteri başarı özetiniz.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden group hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start relative z-10">
                <div>
                  <p className="text-sm font-medium text-gray-400">{stat.title}</p>
                  <p className="text-3xl font-semibold text-white mt-2 tracking-tight">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
              {/* Subtle hover gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          )
        })}
      </div>
      
      {/* İleride grafikleri ekleyeceğimiz alan */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-2xl bg-white/5 border border-white/10 h-80 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Sağlık Skoru Trend Grafiği (Çok Yakında)</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 h-80 flex items-center justify-center">
          <p className="text-gray-500 text-sm">Yaklaşan Görevler</p>
        </div>
      </div>
    </div>
  )
}
