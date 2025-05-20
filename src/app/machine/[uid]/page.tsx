'use client';
import { useState, useEffect } from 'react';
import { GetInfoVMs,getStats } from '@/lib/getinfo';
import { execScript } from '@/lib/ssh';
import type { VM,vmInfo } from '@/types/vm';
import Sidebar from '@/components/Sidebar';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';


export default function MachineDetail() {
  const params = useParams();
  const [vm, setVm] = useState<VM | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats,setStats] = useState<vmInfo | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  const router = useRouter();

  //on recupere les infos principales de la vm
  useEffect(() => {
    const config = localStorage.getItem('vmConfig');
    if (!config) {
      router.push('/config');
      return;
    }
    const fetchVM = async () => {
      const vms = await GetInfoVMs(JSON.parse(config));
      const currentVM = vms.find(v => v.uid === params.uid);
      setVm(currentVM || null);
      setLoading(false);
    };
    fetchVM();
  }, [params.uid]);

  // on recupere les stats de proc ram et storage toute les 5s
  useEffect(() => {
    const config = localStorage.getItem('vmConfig');
    if (!config) {
      router.push('/config');
      return;
    }
    const fetchStats = async () => {
      const getstats = await getStats(params.uid as string,JSON.parse(config))
      setStats(getstats)
      setLoadingStats(false)
    }
    fetchStats();
    const intervalId = setInterval(() => {
      fetchStats();
    }, 5000);

    return () => clearInterval(intervalId);
  },[])

  async function DeleteVM(uid:string){
      const config = JSON.parse(localStorage.getItem('vmConfig') || '{}');
      const { stdout, stderr } = await execScript("destroy_vm.sh",[uid],config)
      if (stdout) {
        router.push('/');
      }
  }


  //ecran de chargement
  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }
  //si la vm n'existe pas
  if (!vm) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar currentPage="dashboard" />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-xl text-gray-400">VM non trouvée</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <div className="h-screen sticky top-0">
        <Sidebar currentPage="dashboard" />
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* VM Header */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">{vm.name}</h1>
                <p className="text-gray-400 text-sm mt-1">ID: {vm.uid}</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full ${vm.status === 'running' ? 'bg-green-500' : 'bg-red-500'} mr-2`} />
                  <span className="text-sm font-medium text-gray-300">{vm.status}</span>
                </div>
                <button 
                  className={`px-4 py-2 rounded-md text-white transition-colors ${
                    vm.status === 'running' 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {vm.status === 'running' ? 'Éteindre' : 'Démarrer'}
                </button>
                <button 
                  className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                  onClick={() => {DeleteVM(params.uid as string)}}
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* Console */}
          <div className="bg-black rounded-lg shadow-lg p-4 h-96 border border-gray-700">

            <div className="font-mono text-green-400 text-sm">
              <div className="mb-2">[00:00   xcp ~]#</div>
            </div>
          </div>

          {/* Information Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* CPU Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">CPU</h2>
                <div className="p-2 bg-blue-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </div>
              </div>
              {loadingStats ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats?.cpu?.map((coreUsage, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Core {index + 1}</span>
                        <span className="text-white font-medium">{coreUsage}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${coreUsage}%` }}
                        ></div>
                      </div>
                    </div>
                  )) || (
                    <div className="text-sm text-gray-400">Aucune donnée CPU disponible</div>
                  )}
                </div>
              )}
            </div>

            {/* Memory Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Mémoire</h2>
                <div className="p-2 bg-purple-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              {loadingStats ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-white">{stats?.memoryMB?.total || 0} MB</div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Utilisé: {stats?.memoryMB?.used || 0} MB</span>
                      <span>{stats?.memoryMB ? Math.round((stats.memoryMB.used / stats.memoryMB.total) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-purple-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${stats?.memoryMB ? (stats.memoryMB.used / stats.memoryMB.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Storage Card */}
            <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Stockage</h2>
                <div className="p-2 bg-green-900/50 rounded-lg">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
              </div>
              {loadingStats ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-32"></div>
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-white">{stats?.stockage?.total || 0} GB</div>
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-gray-400 mb-1">
                      <span>Utilisé: {stats?.stockage?.used || 0} GB</span>
                      <span>{stats?.stockage ? Math.round((stats.stockage.used / stats.stockage.total) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${stats?.stockage ? (stats.stockage.used / stats.stockage.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Network Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Réseau</h2>
              <div className="p-2 bg-orange-900/50 rounded-lg">
                <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="text-sm text-gray-400">Adresse IP</div>
                <div className="text-lg font-semibold text-white">192.168.1.100</div>
              </div>
              <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                <div className="text-sm text-gray-400">État</div>
                <div className="text-lg font-semibold text-green-400">Connecté</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}