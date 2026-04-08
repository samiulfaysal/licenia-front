'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import apiClient from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { Plus, Package, Code, Download } from 'lucide-react'
import Link from 'next/link'

interface License {
  id: number
  product: { name: string }
  status: string
  expiresAt?: string
  activationCount: number
  createdAt: string
}

interface Product {
  id: number
  name: string
  description?: string
  licenseCount: number
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [products, setProducts] = useState<Product[]>([])
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewProductModal, setShowNewProductModal] = useState(false)
  const [newProductName, setNewProductName] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productsRes, licensesRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/licenses'),
      ])
      setProducts(productsRes.data)
      setLicenses(licensesRes.data)
    } catch (error: any) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductName.trim()) return

    try {
      await apiClient.post('/products', { name: newProductName })
      toast.success('Product created!')
      setNewProductName('')
      setShowNewProductModal(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create product')
    }
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {user?.name || user?.email}</h1>
          <p className="text-slate-400">Manage your products and generate license keys</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="glass p-6">
            <div className="text-slate-400 text-sm mb-2">Total Products</div>
            <div className="text-3xl font-bold text-blue-400">{products.length}</div>
          </div>
          <div className="glass p-6">
            <div className="text-slate-400 text-sm mb-2">Total Licenses</div>
            <div className="text-3xl font-bold text-purple-400">{licenses.length}</div>
          </div>
          <div className="glass p-6">
            <div className="text-slate-400 text-sm mb-2">Active Licenses</div>
            <div className="text-3xl font-bold text-green-400">{licenses.filter(l => l.status === 'ACTIVE').length}</div>
          </div>
        </div>

        {/* Create Product Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowNewProductModal(true)}
            className="flex items-center space-x-2 btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>New Product</span>
          </button>
        </div>

        {/* Products Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Your Products</h2>
          {products.length === 0 ? (
            <div className="glass p-8 text-center text-slate-400">
              No products yet. Create one to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <Link key={product.id} href={`/products/${product.id}`}>
                  <div className="glass p-6 hover:bg-white/15 cursor-pointer">
                    <div className="flex items-center space-x-2 mb-4">
                      <Package className="w-5 h-5 text-blue-400" />
                      <h3 className="font-bold text-lg text-white">{product.name}</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{product.description || 'No description'}</p>
                    <div className="text-blue-400 text-sm font-medium">{product.licenseCount} licenses</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent Licenses */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Recent Licenses</h2>
          {licenses.length === 0 ? (
            <div className="glass p-8 text-center text-slate-400">
              No licenses generated yet.
            </div>
          ) : (
            <div className="glass overflow-hidden">
              <table className="w-full">
                <thead className="bg-black/20 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Product</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Activations</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.slice(0, 5).map(license => (
                    <tr key={license.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 text-slate-300">{license.product.name}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          license.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {license.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{license.activationCount}</td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{new Date(license.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New Product Modal */}
        {showNewProductModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-6">Create New Product</h2>
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <input
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  className="w-full px-4 py-2 glass-sm bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none text-white"
                  placeholder="Product name"
                  autoFocus
                />
                <div className="flex space-x-3">
                  <button type="submit" className="flex-1 btn-primary">
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewProductModal(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
