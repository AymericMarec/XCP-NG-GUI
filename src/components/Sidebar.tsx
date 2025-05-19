'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusCircle, Settings, HardDrive } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white">XCP-NG</h1>
      </div>
      <nav className="mt-6">
        <div className="px-4 space-y-2">
          <Link
            href="/"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/') 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/create-vm"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/create-vm') 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <PlusCircle size={20} />
            <span>Créer une VM</span>
          </Link>
          <Link
            href="/storage"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/storage') 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <HardDrive size={20} />
            <span>Stockage</span>
          </Link>
          <Link
            href="/config"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              isActive('/config') 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
            }`}
          >
            <Settings size={20} />
            <span>Configuration</span>
          </Link>
        </div>
      </nav>
    </div>
  );
} 