'use client';

import { Participant } from '@/types';
import { Mic, MicOff, Video, VideoOff, X, UserMinus, Search } from 'lucide-react';
import { useState } from 'react';

interface ParticipantPanelProps {
  participants: Participant[];
  onClose: () => void;
  isHost?: boolean;
  onMuteAll?: () => void;
  onRemoveParticipant?: (id: number) => void;
}

export default function ParticipantPanel({
  participants,
  onClose,
  isHost = false,
  onMuteAll,
  onRemoveParticipant,
}: ParticipantPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = participants.filter((p) =>
    p.display_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-full bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-800 flex flex-col shadow-xl flex-shrink-0 animate-in slide-in-from-right">
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800 shrink-0">
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Participants ({participants.length})
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search participants"
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-[#2a2a2a] border-none text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-zoom-blue outline-none"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.map((p) => (
          <div
            key={p.id}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-[#2a2a2a] group"
          >
            <div className="flex items-center space-x-3 min-w-0">
              <div className="w-8 h-8 rounded-full bg-zoom-blue flex items-center justify-center text-white text-xs font-bold shrink-0">
                {p.display_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-200 truncate">
                  {p.display_name}
                  {p.role === 'host' && (
                    <span className="ml-1.5 text-xs text-zoom-blue font-normal">(Host)</span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              {p.is_muted ? (
                <MicOff className="w-4 h-4 text-red-500" />
              ) : (
                <Mic className="w-4 h-4 text-gray-400" />
              )}
              {!p.is_video_on ? (
                <VideoOff className="w-4 h-4 text-red-500" />
              ) : (
                <Video className="w-4 h-4 text-gray-400" />
              )}
              {isHost && p.role !== 'host' && onRemoveParticipant && (
                <button
                  onClick={() => onRemoveParticipant(p.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-opacity"
                  title="Remove participant"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {isHost && onMuteAll && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 shrink-0">
          <button
            onClick={onMuteAll}
            className="w-full py-2.5 bg-gray-100 dark:bg-[#2a2a2a] hover:bg-gray-200 dark:hover:bg-[#333] text-gray-900 dark:text-white rounded-lg text-sm font-medium transition-colors"
          >
            Mute All Participants
          </button>
        </div>
      )}
    </div>
  );
}
