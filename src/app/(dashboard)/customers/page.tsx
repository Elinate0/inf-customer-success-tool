'use client'

import { useEffect, useState } from 'react'
import { useCustomerStore } from '@/store/useCustomerStore'
import { Search, Plus, MoreHorizontal, Activity, AlertTriangle, Loader2 } from 'lucide-react'
import { NewCustomerModal } from '@/components/modals/NewCustomerModal'

export default function CustomersPage() {
  const { customers, loading, fetchCustomers, syncEmailsWithMicrosoft } = useCustomerStore()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleSync = async () => {
    setSyncing(true)
    try {
      await syncEmailsWithMicrosoft()
    } catch (err: any) {
      alert(err.message || 'Eşitleme sırasında bir hata oluştu.')
    } finally {
      setSyncing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20'
      case 'at_risk': return 'text-red-400 bg-red-400/10 border-red-500/20'
      case 'churned': return 'text-gray-400 bg-gray-400/10 border-gray-500/20'
      default: return 'text-blue-400 bg-blue-400/10 border-blue-500/20'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Müşteri Portföyü</h1>
          <p className="text-gray-400 mt-1">Müşterilerinizi ve dinamik sağlık skorlarını yönetin.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors text-sm font-medium"
        >
          <Plus size={16} />
          Yeni Müşteri
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-500" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-white placeholder-gray-500 outline-none text-sm"
            placeholder="İsim, şirket veya e-posta ara..."
          />
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 bg-[#2F2F2F] hover:bg-[#3F3F3F] border border-white/10 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {syncing ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
            {syncing ? 'Eşitleniyor...' : 'Mailleri Eşitle'}
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/40 border-b border-white/10 text-gray-400 uppercase text-xs tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Müşteri / Şirket</th>
                <th className="px-6 py-4 font-medium">Sağlık Skoru</th>
                <th className="px-6 py-4 font-medium">Durum</th>
                <th className="px-6 py-4 font-medium">Son İletişim</th>
                <th className="px-6 py-4 font-medium text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2" />
                    <p>Müşteriler yükleniyor...</p>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Henüz hiç müşteri eklenmemiş. "Yeni Müşteri" butonuna tıklayarak ilk müşterinizi ekleyin.
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center border border-white/10 text-white font-medium uppercase">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-200">{customer.name}</div>
                          <div className="text-gray-500 text-xs mt-0.5">{customer.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl font-semibold tracking-tight ${getHealthColor(customer.health_score)}`}>
                          {customer.health_score}
                        </span>
                        {customer.health_score < 50 && (
                          <AlertTriangle size={14} className="text-red-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-xs font-medium border ${getStatusColor(customer.status)}`}>
                        {customer.status === 'active' ? 'Aktif' : customer.status === 'at_risk' ? 'Riskli' : 'Kayıp'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {customer.last_contact_date ? new Date(customer.last_contact_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <NewCustomerModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
