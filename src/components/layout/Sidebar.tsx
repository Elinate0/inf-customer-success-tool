'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, KanbanSquare, Users, Inbox, Settings, LogOut } from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Kanban', href: '/kanban', icon: KanbanSquare },
  { name: 'Müşteriler', href: '/customers', icon: Users },
  { name: 'Gelen Kutusu', href: '/inbox', icon: Inbox },
  { name: 'Ayarlar', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-[#0A0A0B] border-r border-white/10 min-h-screen text-gray-300">
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <h1 className="text-lg font-semibold text-white tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <LayoutDashboard size={18} className="text-white" />
          </div>
          Komuta Merkezi
        </h1>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20'
                  : 'hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-blue-400' : 'text-gray-400'} />
              {item.name}
            </Link>
          )
        })}
      </div>
      
      <div className="p-4 border-t border-white/10">
        <form action="/auth/signout" method="post">
          <button className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-xl hover:bg-red-500/10 hover:text-red-400 transition-all group border border-transparent hover:border-red-500/20">
            <LogOut size={18} className="text-gray-400 group-hover:text-red-400 transition-colors" />
            Çıkış Yap
          </button>
        </form>
      </div>
    </div>
  )
}
