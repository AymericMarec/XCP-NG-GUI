'use client';
import { useState, useEffect } from 'react';
import { GetInfoVMs } from '@/lib/getinfo';
import type { VM } from '@/types/vm';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { PlusCircle } from 'lucide-react';

export default function Home() {
  const [loadingVMs, setLoadingVMs] = useState(true);
  const [vms, setVms] = useState<VM[]>([]);
  const router = useRouter();

  //on recupere les infos de toute les vms
  useEffect(() => {
    const config = localStorage.getItem('vmConfig');
    if (!config) {
      router.push('/config');
      return;
    }

    const getvms = async () => {
      const result = await GetInfoVMs(JSON.parse(config));
      setVms(result);
      setLoadingVMs(false);
    };
    getvms();
  }, [router]);

  //si on clique sur une vm , ca nous renvoie vers sa page
  const handleVMClick = (uid: string) => {
    router.push(`/machine/${uid}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <div className="h-screen sticky top-0">
        <Sidebar currentPage="dashboard" />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {loadingVMs ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : vms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-6">
              <div className="bg-gray-800 rounded-lg shadow-lg p-8 text-center border border-gray-700">
                <h2 className="text-2xl font-semibold text-white mb-4">Aucune machine virtuelle trouvée</h2>
                <p className="text-gray-400 mb-6">Commencez par créer votre première machine virtuelle</p>
                <button
                  onClick={() => router.push('/create-vm')}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <PlusCircle size={24} />
                  <span>Créer une machine virtuelle</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Machines Virtuelles</h1>
                <button
                  onClick={() => router.push('/create-vm')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <PlusCircle size={20} />
                  <span>Nouvelle VM</span>
                </button>
              </div>
              
              <div className="space-y-4">
                {vms.map((vm) => (
                  <div 
                    key={vm.uid} 
                    className="bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6 cursor-pointer border border-gray-700"
                    onClick={() => handleVMClick(vm.uid)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="p-3 bg-blue-900/50 rounded-lg">
                          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">{vm.name}</h3>
                          <p className="text-gray-400 text-sm mt-1">ID: {vm.uid}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${vm.status === 'running' ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                          <span className="text-sm font-medium text-gray-300">{vm.status}</span>
                        </div>
                        <button 
                          className={`px-4 py-2 rounded-md text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                            vm.status === 'running' 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {vm.status === 'running' ? 'Éteindre' : 'Démarrer'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}