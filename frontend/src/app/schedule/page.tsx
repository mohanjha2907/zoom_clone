'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { Copy, Check } from 'lucide-react';

export default function SchedulePage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    duration: 30,
  });
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let start_time = undefined;
      if (formData.date && formData.time) {
        start_time = new Date(`${formData.date}T${formData.time}`).toISOString();
      }

      const res = await api.scheduleMeeting({
        title: formData.title || 'Scheduled Meeting',
        description: formData.description,
        duration: Number(formData.duration),
        start_time,
      });
      
      setSuccessData(res);
    } catch (err) {
      console.error(err);
      alert('Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (successData) {
      navigator.clipboard.writeText(successData.invite_link || successData.meeting_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Schedule Meeting" />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
            {successData ? (
              <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Meeting Scheduled!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8">{successData.title}</p>
                
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-left mb-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Meeting Code</p>
                  <p className="font-mono text-lg font-medium text-gray-900 dark:text-white mb-4">{successData.meeting_code}</p>
                  
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Invite Link</p>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={successData.invite_link || successData.meeting_code}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white text-sm"
                    />
                    <button 
                      onClick={copyLink}
                      className="p-2 text-zoom-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    >
                      {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                
                <button 
                  onClick={() => setSuccessData(null)}
                  className="w-full bg-zoom-blue hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
                >
                  Schedule Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Topic</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter meeting topic"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-zoom-blue focus:border-transparent outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-zoom-blue focus:border-transparent outline-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-zoom-blue focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-zoom-blue focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duration</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-zoom-blue focus:border-transparent outline-none"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>1 Hour</option>
                    <option value={90}>1 Hour 30 Minutes</option>
                    <option value={120}>2 Hours</option>
                  </select>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 bg-zoom-blue hover:bg-blue-700 text-white font-medium rounded-xl transition-colors disabled:opacity-70"
                  >
                    {loading ? 'Scheduling...' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
