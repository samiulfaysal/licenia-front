'use client'

import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { LogOut, Home, Package, Key } from 'lucide-react'

export default function Navbar() {
  const { user, logout } = useAuthStore()
  const router = useRouter()

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!user) return null

  return (
    <nav className="glass sticky top-0 z-50 mb-6">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <Link href="/dashboard" className="flex items-center space-x-2 text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            <Key className="w-6 h-6" />
            <span>LicenseSaaS</span>
          </Link>

          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="flex items-center space-x-2 text-slate-300 hover:text-white">
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
            <Link href="/products" className="flex items-center space-x-2 text-slate-300 hover:text-white">
              <Package className="w-4 h-4" />
              <span>Products</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-slate-400">{user.email}</span>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
