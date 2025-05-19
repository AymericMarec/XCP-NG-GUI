'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { execScript } from '@/lib/ssh';

export default function CreateVM() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
      name: '',
      os: 'Debian_30GO_2CPU_4GO_RAM',
      description: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          const config = JSON.parse(localStorage.getItem('vmConfig') || '{}');
          await execScript("create_vm.sh", ["0", "eth0", formData.os, formData.name, formData.description], config);
          router.push('/');
      } catch (err) {
          console.error(err);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <div className="h-screen sticky top-0">
        <Sidebar currentPage="create-vm" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Créer une nouvelle machine virtuelle</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulaire */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* VM Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                      Nom de la VM
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="Entrez le nom de la VM"
                      required
                    />
                  </div>

                  {/* OS Selection */}
                  <div>
                    <label htmlFor="os" className="block text-sm font-medium text-gray-300 mb-2">
                      Système d'exploitation
                    </label>
                    <select
                      id="os"
                      value={formData.os}
                      onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white"
                    >
                      <option value="Debian_30GO_2CPU_4GO_RAM">Debian (2 CPU, 4GB RAM, 30GB)</option>
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      rows={4}
                      placeholder="Description de la VM (optionnel)"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Création en cours...' : 'Créer la VM'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Informations */}
            <div className="space-y-6">
              {/* Configuration Card */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Configuration</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">CPU</span>
                    <span className="text-white font-medium">2 vCPUs</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Mémoire</span>
                    <span className="text-white font-medium">4 GB</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Stockage</span>
                    <span className="text-white font-medium">30 GB</span>
                  </div>
                </div>
              </div>

              {/* Système Card */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Système</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">OS</span>
                    <span className="text-white font-medium">Debian</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Architecture</span>
                    <span className="text-white font-medium">x86_64</span>
                  </div>
                </div>
              </div>

              {/* Réseau Card */}
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Réseau</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Interface</span>
                    <span className="text-white font-medium">eth0</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Type</span>
                    <span className="text-white font-medium">Bridge</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 