'use client';
import { useState, useEffect } from 'react';
import { getStockageTotal } from '@/lib/stockage';
import Sidebar from '@/components/Sidebar';
import { useRouter } from 'next/navigation';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function StoragePage() {
  const [storageInfo, setStorageInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const config = localStorage.getItem('vmConfig');
    if (!config) {
      router.push('/config');
      return;
    }

    const fetchStorageInfo = async () => {
      try {
        const info = await getStockageTotal(JSON.parse(config));
        setStorageInfo(info);
      } catch (error) {
        console.error('Error fetching storage info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStorageInfo();
    const intervalId = setInterval(fetchStorageInfo, 30000);

    return () => clearInterval(intervalId);
  }, []);

  const formatSize = (size: number) => {
    if (size >= 1024) {
      return `${(size / 1024).toFixed(2)} TB`;
    }
    return `${size.toFixed(2)} GB`;
  };

  const pieData = storageInfo ? [
    ...storageInfo.vms.map((vm: any) => ({
      name: vm.name,
      value: vm.size,
    })),
    {
      name: 'Espace libre',
      value: storageInfo.total - storageInfo.used,
    },
  ] : [];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900">
        <Sidebar currentPage="storage" />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-900">
      <div className="h-screen sticky top-0">
        <Sidebar currentPage="storage" />
      </div>

      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Storage Overview Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">Vue d'ensemble du stockage</h1>
              <div className="p-2 bg-blue-900/50 rounded-lg">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-400">Espace total</div>
                <div className="text-2xl font-bold text-white">{formatSize(storageInfo.total)}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-400">Espace utilisé</div>
                <div className="text-2xl font-bold text-white">{formatSize(storageInfo.used)}</div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <div className="text-sm text-gray-400">Espace libre</div>
                <div className="text-2xl font-bold text-white">{formatSize(storageInfo.total - storageInfo.used)}</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Utilisation du stockage</span>
                <span>{Math.round((storageInfo.used / storageInfo.total) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4">
                <div
                  className="bg-blue-500 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${(storageInfo.used / storageInfo.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Storage Distribution Card */}
          <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-6">Distribution du stockage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => formatSize(value as number)}
                      contentStyle={{ 
                        backgroundColor: '#1F2937',
                        border: '1px solid #374151',
                        borderRadius: '0.5rem',
                        color: '#fff'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white mb-4">Détails par VM</h3>
                {storageInfo.vms.map((vm: any, index: number) => (
                  <div key={vm.name} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium text-white">{vm.name}</div>
                        <div className="text-sm text-gray-400">{formatSize(vm.size)}</div>
                      </div>
                      <div className="w-24 bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${(vm.size / storageInfo.total) * 100}%`,
                            backgroundColor: COLORS[index % COLORS.length],
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 