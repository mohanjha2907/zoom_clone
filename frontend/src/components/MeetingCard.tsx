'use client';

import { Meeting } from '@/types';
import { Calendar, Clock, Video, Copy, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function MeetingCard({ meeting }: { meeting: Meeting }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  const handleJoin = () => {
    sessionStorage.setItem(`zoom_name_${meeting.meeting_code}`, 'John Doe');
    router.push(`/meeting/${meeting.meeting_code}`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meeting.invite_link || meeting.meeting_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    ended: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-semibold text-gray-900 dark:text-white text-lg truncate pr-4">
          {meeting.title || 'Zoom Meeting'}
        </h4>
        <span
          className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap capitalize ${
            statusColors[meeting.status] || statusColors.scheduled
          }`}
        >
          {meeting.status}
        </span>
      </div>

      <div className="space-y-2 mt-auto">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Clock className="w-4 h-4 mr-2 shrink-0" />
          <span>
            {meeting.start_time
              ? new Date(meeting.start_time).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Instant'}{' '}
            • {meeting.duration} min
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
          <Video className="w-4 h-4 mr-2 shrink-0" />
          <span>
            ID: <span className="font-mono font-medium">{meeting.meeting_code}</span>
          </span>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <button
          onClick={handleJoin}
          disabled={meeting.status === 'ended'}
          className="flex-1 bg-zoom-blue hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2 rounded-lg text-sm font-medium transition-colors"
        >
          {meeting.status === 'ended' ? 'Ended' : 'Join'}
        </button>
        <button
          onClick={handleCopyLink}
          className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-500" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </>
          )}
        </button>
      </div>
    </div>
  );
}
