'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';

export default function NewMeetingModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [meetingInfo, setMeetingInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      // Call API to create meeting
      const data = await api.createInstantMeeting();
      setMeetingInfo(data);
    } catch (error) {
      console.error(error);
      alert('Failed to create meeting');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (meetingInfo) {
      router.push(`/meeting/${meetingInfo.meeting_code}`);
    }
  };

  const copyToClipboard = () => {
    if (meetingInfo) {
      navigator.clipboard.writeText(meetingInfo.invite_link || meetingInfo.meeting_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">New Meeting</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!meetingInfo ? (
            <div className="text-center py-4">
              <p className="text-gray-600 dark:text-gray-300 mb-6">Start an instant meeting now.</p>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="w-full bg-zoom-blue hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-70 flex justify-center items-center"
              >
                {loading ? 'Creating...' : 'Start a Meeting'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Meeting Code</p>
                <p className="text-xl font-bold tracking-wider text-gray-900 dark:text-white">{meetingInfo.meeting_code}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy Link'}
                </button>
                <button
                  onClick={handleStart}
                  className="flex-1 bg-zoom-blue hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex justify-center items-center"
                >
                  Join Meeting
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
