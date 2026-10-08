import HomeContent from '@/components/HomeContent';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Dashboard" />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <HomeContent />
        </main>
      </div>
    </div>
  );
}
