'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';

export default function JoinMeetingPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!code.trim() || !displayName.trim()) {
      setError('Meeting code and display name are required');
      return;
    }

    // Extract code if it's a URL
    let finalCode = code;
    if (code.includes('/')) {
      const parts = code.split('/');
      finalCode = parts[parts.length - 1];
    }

    setLoading(true);
    try {
      // Just check if meeting exists
      await api.getMeeting(finalCode);
      
      // Store display name in sessionStorage to use in the meeting room
      sessionStorage.setItem(`zoom_name_${finalCode}`, displayName);
      
      router.push(`/meeting/${finalCode}`);
    } catch (err) {
      console.error(err);
      setError('Meeting not found. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Join Meeting" />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Join a Meeting</h2>
            
            {error && (
              <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meeting ID or Personal Link Name</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter Meeting ID or Link"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-zoom-blue focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-zoom-blue focus:border-transparent outline-none transition-all"
                  required
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zoom-blue hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center"
                >
                  {loading ? 'Joining...' : 'Join Meeting'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
