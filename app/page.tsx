'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useEffect } from 'react'
import { Key, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            <Key className="w-6 h-6 text-blue-400" />
            <span>LicenseSaaS</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login" className="text-slate-300 hover:text-white">
              Login
            </Link>
            <Link href="/register" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-white mb-4">
            License Management Made Easy
          </h1>
          <p className="text-2xl text-slate-400 mb-8">
            Generate, manage, and validate licenses for your products instantly
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Link href="/register" className="flex items-center space-x-2 btn-primary text-lg px-8 py-3">
              <span>Get Started Free</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="glass p-8">
            <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
              <Key className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Instant License Generation</h3>
            <p className="text-slate-400">Generate unique, secure license keys instantly with customizable expiration dates</p>
          </div>

          <div className="glass p-8">
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Multiple Languages</h3>
            <p className="text-slate-400">Integration code snippets for PHP, JavaScript, Python, C#, and more</p>
          </div>

          <div className="glass p-8">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Real-time Validation</h3>
            <p className="text-slate-400">Validate licenses with domain binding and activation limits</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2m0 0l4-4m-5.586 3.586L9 13.828 6.586 11.414M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function Code(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  )
}
