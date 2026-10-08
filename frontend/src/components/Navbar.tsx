import { Bell, Settings, Search } from 'lucide-react';

export default function Navbar({ title }: { title: string }) {
  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>
      
      <div className="flex-1 max-w-md mx-8 hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-full py-1.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-zoom-blue text-sm"
          />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white">
          <Settings className="w-5 h-5" />
        </button>
        <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="w-8 h-8 rounded-full bg-zoom-blue flex items-center justify-center text-white font-medium cursor-pointer">
          U
        </div>
      </div>
    </header>
  );
}
