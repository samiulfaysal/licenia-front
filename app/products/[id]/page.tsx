'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import apiClient from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Code, Copy, Download, Trash2, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

interface License {
  id: number
  keyPreview: string
  status: string
  expiresAt?: string
  activationLimit: number
  activationCount: number
  activations: any[]
  product: { id: number | string; name: string } // <-- Add this line!
}

interface Product {
  id: number
  name: string
  description?: string
}

export default function ProductPage() {
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<Product | null>(null)
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [expirationDays, setExpirationDays] = useState(30)
  const [generating, setGenerating] = useState(false)
  const [generatedKey, setGeneratedKey] = useState('')
  const [showKey, setShowKey] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [productRes, licensesRes] = await Promise.all([
        apiClient.get(`/products/${productId}`),
        apiClient.get('/licenses'),
      ])
      setProduct(productRes.data)
      setLicenses(licensesRes.data.filter((l: License) => l.product.id == productId))
    } catch (error: any) {
      toast.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }

 const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault()
    setGenerating(true)

    try {
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expirationDays)

      const response = await apiClient.post('/licenses/generate', {
        productId: parseInt(productId),
        expiresAt: expiresAt.toISOString(),
        activationLimit: 1,
      })

      // 1. Save the key to state so it appears on screen
      setGeneratedKey(response.data.licenseKey)
      toast.success('License generated!')
      
      // 2. Close the modal and reset the form immediately
      setExpirationDays(30)
      setShowGenerateModal(false)

      // 3. Update the table list in the background
      fetchData()

      // (Notice we removed the setTimeout that was deleting the key!)

    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate license')
    } finally {
      setGenerating(false)
    }
  }
  
  const handleDeleteLicense = async (licenseId: number) => {
    // 1. Ask for confirmation so you don't accidentally click it
    if (!window.confirm('Are you sure you want to revoke this license?')) return;

    try {
      // 2. Call your backend DELETE route
      await apiClient.delete(`/licenses/${licenseId}`);
      toast.success('License revoked successfully!');
      
      // 3. Refresh the table to show the updated status
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to revoke license');
    }
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  if (loading) return <ProtectedRoute><Navbar /><div className="text-center py-12">Loading...</div></ProtectedRoute>

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Back Link */}
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Product Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{product?.name}</h1>
          <p className="text-slate-400">{product?.description || 'No description'}</p>
        </div>

        {/* Generate Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center space-x-2 btn-primary"
          >
            <Plus className="w-4 h-4" />
            <span>Generate License</span>
          </button>
        </div>

        {/* Generated Key Display */}
        {generatedKey && (
          <div className="glass p-6 mb-8 border-2 border-green-500/50 bg-green-500/10">
            <h3 className="text-green-400 font-bold mb-2">✓ License Generated!</h3>
            <div className="flex items-center space-x-2 mb-4 p-3 bg-black/30 rounded font-mono text-sm">
              <span className="flex-1 break-all text-slate-300">{generatedKey}</span>
              <button
                onClick={() => copyToClipboard(generatedKey)}
                className="btn-secondary px-3 py-1"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-slate-400">Copy this key now. It won't be shown again!</p>
          </div>
        )}

        {/* Licenses Table */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">Licenses ({licenses.length})</h2>
          {licenses.length === 0 ? (
            <div className="glass p-8 text-center text-slate-400">
              No licenses generated yet. Create one to get started!
            </div>
          ) : (
            <div className="glass overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/20 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">License Key</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Activations</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Expires</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-slate-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {licenses.map(license => (
                    <tr key={license.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-6 py-4 text-slate-300 font-mono text-sm">{license.keyPreview}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          license.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {license.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        {license.activationCount} / {license.activationLimit}
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">
                        {license.expiresAt ? new Date(license.expiresAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                      <button 
                        onClick={() => handleDeleteLicense(license.id)}
                        title="Revoke License"
                        className="text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Generate Modal */}
        {showGenerateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="glass p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-white mb-6">Generate License</h2>
              <form onSubmit={handleGenerateLicense} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Expiration (days)
                  </label>
                  <input
                    type="number"
                    value={expirationDays}
                    onChange={(e) => setExpirationDays(parseInt(e.target.value))}
                    className="w-full px-4 py-2 glass-sm bg-slate-800 border border-slate-700 focus:border-blue-500 outline-none text-white"
                    min="1"
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" disabled={generating} className="flex-1 btn-primary disabled:opacity-50">
                    {generating ? 'Generating...' : 'Generate'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
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
