'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, PlusSquare, Calendar } from 'lucide-react';
import Image from 'next/image';

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Join', href: '/join', icon: PlusSquare },
  { name: 'Schedule', href: '/schedule', icon: Calendar },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="w-64 bg-zoom-dark text-white hidden md:flex flex-col h-full border-r border-gray-800">
        <div className="p-6 flex items-center justify-center">
          <Image src="/zoom-logo.svg" alt="Zoom Logo" width={120} height={36} className="mb-2" />
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-zoom-blue text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-zoom-blue flex items-center justify-center text-lg font-bold">
            J
          </div>
          <div>
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-gray-400">john@example.com</p>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-zoom-dark border-t border-gray-800 z-50 flex items-center justify-around py-2 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg transition-colors ${
                isActive ? 'text-zoom-blue' : 'text-gray-400'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
