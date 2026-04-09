'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import apiClient from '@/lib/api'
import toast from 'react-hot-toast'
import { Plus, Code, Copy, Trash2, Check } from 'lucide-react' // Added Check
import Link from 'next/link'

interface License {
  id: number
  keyPreview: string
  status: string
  expiresAt?: string
  activationLimit: number
  activationCount: number
  activations: any[]
  product: { id: number | string; name: string }
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
  
  // Modal States
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  
  // Action States
  const [expirationDays, setExpirationDays] = useState(30)
  const [generating, setGenerating] = useState(false)
  const [generatedKey, setGeneratedKey] = useState('')
  const [copiedCode, setCopiedCode] = useState(false)

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

      setGeneratedKey(response.data.licenseKey)
      toast.success('License generated!')
      
      setExpirationDays(30)
      setShowGenerateModal(false)
      fetchData()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate license')
    } finally {
      setGenerating(false)
    }
  }
  
  const handleDeleteLicense = async (licenseId: number) => {
    if (!window.confirm('Are you sure you want to revoke this license?')) return;

    try {
      await apiClient.delete(`/licenses/${licenseId}`);
      toast.success('License revoked successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to revoke license');
    }
  }
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  // --- NEW: Dynamic Integration Code Template ---
  const integrationCode = `<?php
/**
 * Licenia SaaS - WordPress Client Integration
 * Automatically generated for Product ID: ${productId}
 */

define('LICENIA_API_URL', 'https://licenia-back.onrender.com/api/licenses/validate');
define('LICENIA_PRODUCT_ID', '${productId}'); 

// 1. Create the Settings Menu
add_action('admin_menu', 'licenia_register_settings_page');
function licenia_register_settings_page() {
    add_options_page(
        'Product License', 
        'Product License', 
        'manage_options', 
        'licenia-license-settings', 
        'licenia_render_settings_page'
    );
}

// 2. Render the Settings Page UI
function licenia_render_settings_page() {
    if (isset($_POST['licenia_license_key']) && check_admin_referer('licenia_save_license')) {
        $new_key = sanitize_text_field($_POST['licenia_license_key']);
        update_option('licenia_saved_license_key', $new_key);
        delete_transient('licenia_license_status');
        echo '<div class="notice notice-success is-dismissible"><p>License key saved and checked!</p></div>';
    }

    $current_key = get_option('licenia_saved_license_key', '');
    $status = licenia_check_license_status();
    ?>
    <div class="wrap">
        <h2>Activate Your Product</h2>
        <?php if ($status === true): ?>
            <div class="notice notice-success inline"><p>✅ <strong>Active:</strong> Your product is fully licensed.</p></div>
        <?php else: ?>
            <div class="notice notice-error inline"><p>❌ <strong>Inactive:</strong> Please enter a valid license key.</p></div>
        <?php endif; ?>

        <form method="POST" action="">
            <?php wp_nonce_field('licenia_save_license'); ?>
            <table class="form-table">
                <tr>
                    <th scope="row"><label for="licenia_license_key">License Key</label></th>
                    <td>
                        <input type="text" name="licenia_license_key" id="licenia_license_key" 
                               value="<?php echo esc_attr($current_key); ?>" class="regular-text">
                        <p class="description">Enter the license key provided in your dashboard.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button('Activate License'); ?>
        </form>
    </div>
    <?php
}

// 3. The Core API Communicator
function licenia_check_license_status() {
    $license_key = get_option('licenia_saved_license_key');
    if (empty($license_key)) return false;

    $cached_status = get_transient('licenia_license_status');
    if ($cached_status !== false) return $cached_status === 'valid';

    $domain = isset($_SERVER['SERVER_NAME']) ? $_SERVER['SERVER_NAME'] : site_url();
    $body = json_encode([
        'licenseKey' => $license_key,
        'productId' => intval(LICENIA_PRODUCT_ID),
        'domain' => str_replace(['http://', 'https://', 'www.'], '', $domain)
    ]);

    $response = wp_remote_post(LICENIA_API_URL, [
        'headers' => ['Content-Type' => 'application/json', 'Accept' => 'application/json'],
        'body' => $body,
        'timeout' => 15
    ]);

    if (is_wp_error($response)) return false;

    $http_code = wp_remote_retrieve_response_code($response);
    $data = json_decode(wp_remote_retrieve_body($response), true);

    if ($http_code === 200 && isset($data['valid']) && $data['valid'] === true) {
        set_transient('licenia_license_status', 'valid', 12 * HOUR_IN_SECONDS);
        return true;
    } else {
        set_transient('licenia_license_status', 'invalid', 1 * HOUR_IN_SECONDS);
        return false;
    }
}
?>`;

  const copyIntegrationCode = () => {
    navigator.clipboard.writeText(integrationCode);
    setCopiedCode(true);
    toast.success('Integration code copied!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  if (loading) return <ProtectedRoute><Navbar /><div className="text-center py-12">Loading...</div></ProtectedRoute>

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Back Link */}
        <Link href="/dashboard" className="text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Back to Dashboard
        </Link>

        {/* Product Header & Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{product?.name}</h1>
            <p className="text-slate-400">{product?.description || 'No description'}</p>
          </div>
          
          <div className="flex gap-3">
            {/* NEW: Integration Button */}
            <button
              onClick={() => setShowIntegrationModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white border border-slate-700 rounded hover:bg-slate-700 transition-colors"
            >
              <Code className="w-4 h-4" />
              <span>WordPress Code</span>
            </button>

            <button
              onClick={() => setShowGenerateModal(true)}
              className="flex items-center space-x-2 btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span>Generate License</span>
            </button>
          </div>
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
            <div className="glass p-8 max-w-md w-full mx-4 relative">
              <button 
                onClick={() => setShowGenerateModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >✕</button>
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
                </div>
              </form>
            </div>
          </div>
        )}

        {/* NEW: Integration Code Modal */}
        {showIntegrationModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="glass w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/50">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    WordPress Integration Code
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Copy this code into your plugin or theme's <code className="bg-slate-800 px-1 rounded text-blue-300">functions.php</code> file.
                  </p>
                </div>
                <button
                  onClick={() => setShowIntegrationModal(false)}
                  className="text-slate-400 hover:text-white transition-colors text-xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 bg-[#0d1117]">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap break-all">
                  <code>{integrationCode}</code>
                </pre>
              </div>

              <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-3">
                <button
                  onClick={() => setShowIntegrationModal(false)}
                  className="px-4 py-2 text-slate-300 hover:bg-slate-800 rounded transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={copyIntegrationCode}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors flex items-center gap-2"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </ProtectedRoute>
  )
}
