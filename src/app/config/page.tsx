'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';

export default function Config() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
      host: '',
      username: '',
      password: '',
    });

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
          // on enregistre la conf ,puis renvoie vers la page principale
          localStorage.setItem('vmConfig', JSON.stringify(formData));
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
        <Sidebar currentPage="config" />
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-white">Configuration</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg shadow-lg p-8 border border-gray-700">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="host" className="block text-sm font-medium text-gray-300 mb-2">
                      Adresse IP
                    </label>
                    <input
                      type="text"
                      id="host"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="Entrez l'adresse IP du serveur"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                      Nom d'utilisateur
                    </label>
                    <input
                      type="text"
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="Entrez le nom d'utilisateur"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                      Mot de passe
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-700 text-white placeholder-gray-400"
                      placeholder="Entrez le mot de passe"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-6">

              <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Aide</h2>
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Entrez les informations de connexion de votre serveur XCP-NG pour commencer à gérer vos machines virtuelles.
                  </p>
                  <p className="text-gray-400 text-sm">
                    Assurez-vous que le serveur est accessible et que les informations de connexion sont correctes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 