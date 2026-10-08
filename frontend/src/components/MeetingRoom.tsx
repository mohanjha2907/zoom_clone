'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Meeting, Participant, ChatMessage } from '@/types';
import MeetingControls from '@/components/MeetingControls';
import ParticipantPanel from '@/components/ParticipantPanel';
import ChatPanel from '@/components/ChatPanel';
import { Shield, Info } from 'lucide-react';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';

export default function MeetingRoom({ code }: { code: string }) {
  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [myParticipant, setMyParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize meeting: fetch data + join + connect WebSocket
  useEffect(() => {
    let cancelled = false;

    const initMeeting = async () => {
      try {
        const displayName =
          sessionStorage.getItem(`zoom_name_${code}`) ||
          `Guest-${Math.floor(Math.random() * 1000)}`;

        // Fetch meeting details
        let meetingData: Meeting;
        try {
          meetingData = await api.getMeeting(code);
        } catch {
          // If backend is down, use fallback
          meetingData = {
            id: 1,
            meeting_code: code,
            title: 'Zoom Meeting',
            host_id: 1,
            duration: 60,
            status: 'active',
            meeting_type: 'instant',
            invite_link: `http://localhost:3000/meeting/${code}`,
            created_at: new Date().toISOString(),
          };
        }

        if (cancelled) return;
        setMeeting(meetingData);

        // If meeting is scheduled, activate it
        if (meetingData.status === 'scheduled') {
          try {
            await api.updateMeetingStatus(code, 'active');
          } catch {}
        }

        // Join the meeting as participant
        let participant: Participant;
        try {
          participant = await api.joinMeeting(code, displayName, 1);
        } catch {
          participant = {
            id: Date.now(),
            meeting_id: meetingData.id,
            display_name: displayName,
            role: 'host',
            is_muted: false,
            is_video_on: true,
            joined_at: new Date().toISOString(),
          };
        }

        if (cancelled) return;
        setMyParticipant(participant);

        // Fetch current participants
        try {
          const parts = await api.getParticipants(code);
          setParticipants(parts);
        } catch {
          setParticipants([participant]);
        }

        // System welcome message
        setMessages([
          {
            id: '1',
            sender: 'System',
            message: `Welcome to ${meetingData.title}! Meeting Code: ${code}`,
            timestamp: new Date().toISOString(),
          },
        ]);

        // Connect WebSocket
        try {
          const ws = new WebSocket(`${WS_URL}/${code}`);
          wsRef.current = ws;

          ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
              setMessages((prev) => [
                ...prev,
                {
                  id: Date.now().toString(),
                  sender: data.sender,
                  message: data.content,
                  timestamp: new Date().toISOString(),
                },
              ]);
            } else if (data.type === 'join') {
              // Refresh participant list
              api.getParticipants(code).then(setParticipants).catch(() => {});
            } else if (data.type === 'leave') {
              api.getParticipants(code).then(setParticipants).catch(() => {});
            }
          };
        } catch {
          // WebSocket connection optional
        }

        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError('Failed to join meeting. Please check the meeting code.');
          setLoading(false);
        }
      }
    };

    initMeeting();

    return () => {
      cancelled = true;
      wsRef.current?.close();
    };
  }, [code]);

  const handleEndMeeting = useCallback(async () => {
    // Leave the meeting
    if (myParticipant) {
      try {
        await api.leaveMeeting(code, myParticipant.id);
      } catch {}
    }
    // If host, end the meeting
    if (myParticipant?.role === 'host') {
      try {
        await api.updateMeetingStatus(code, 'ended');
      } catch {}
    }
    wsRef.current?.close();
    router.push('/');
  }, [code, myParticipant, router]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newState = !prev;
      if (myParticipant) {
        api.toggleMute(code, myParticipant.id).catch(() => {});
        // Broadcast via WebSocket
        wsRef.current?.send(
          JSON.stringify({
            type: 'mute',
            sender: myParticipant.display_name,
            content: newState ? 'muted' : 'unmuted',
          })
        );
      }
      return newState;
    });
  }, [code, myParticipant]);

  const handleToggleVideo = useCallback(() => {
    setIsVideoOn((prev) => {
      const newState = !prev;
      if (myParticipant) {
        api.toggleVideo(code, myParticipant.id).catch(() => {});
      }
      return newState;
    });
  }, [code, myParticipant]);

  const handleSendMessage = useCallback(
    (text: string) => {
      const senderName = myParticipant?.display_name || 'Me';
      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        sender: senderName,
        message: text,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, newMsg]);

      // Broadcast via WebSocket
      wsRef.current?.send(
        JSON.stringify({
          type: 'chat',
          sender: senderName,
          content: text,
        })
      );
    },
    [myParticipant]
  );

  const handleMuteAll = useCallback(async () => {
    try {
      await api.muteAll(code);
      const parts = await api.getParticipants(code);
      setParticipants(parts);
    } catch {}
  }, [code]);

  const handleRemoveParticipant = useCallback(
    async (participantId: number) => {
      try {
        await api.removeParticipant(code, participantId);
        setParticipants((prev) => prev.filter((p) => p.id !== participantId));
      } catch {}
    },
    [code]
  );

  // Colors for participant avatars
  const avatarColors = [
    'bg-blue-600',
    'bg-green-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-yellow-600',
    'bg-teal-600',
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-[#242424] items-center justify-center text-white flex-col space-y-4">
        <div className="w-12 h-12 border-4 border-zoom-blue border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400">Connecting to meeting...</p>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="flex h-screen bg-[#242424] items-center justify-center text-white">
        <div className="bg-[#1a1a1a] p-8 rounded-xl max-w-md text-center">
          <p className="text-red-400 mb-4">{error || 'Meeting not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-zoom-blue px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // Determine grid layout based on participant count
  const gridClass =
    participants.length === 1
      ? 'grid-cols-1'
      : participants.length === 2
        ? 'grid-cols-2'
        : participants.length <= 4
          ? 'grid-cols-2 grid-rows-2'
          : participants.length <= 6
            ? 'grid-cols-3 grid-rows-2'
            : 'grid-cols-3 grid-rows-3';

  return (
    <div className="flex flex-col h-screen bg-[#242424] overflow-hidden font-sans">
      {/* Top Bar */}
      <div className="h-12 bg-black/40 flex items-center justify-between px-4 text-white shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <Shield className="w-4 h-4 text-green-500" />
          <span className="font-medium text-sm">{meeting.title || 'Zoom Meeting'}</span>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <span className="bg-gray-800 px-3 py-1 rounded text-xs font-mono">
            ID: {meeting.meeting_code}
          </span>
          <span className="bg-gray-800 px-2 py-1 rounded">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button className="p-1 hover:bg-white/10 rounded">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Grid */}
        <div className="flex-1 p-4 flex items-center justify-center relative overflow-hidden">
          <div className={`grid gap-3 w-full h-full max-w-7xl ${gridClass}`}>
            {participants.map((p, idx) => {
              const isMe = myParticipant && p.id === myParticipant.id;
              const showVideo = isMe ? isVideoOn : p.is_video_on;
              const showMuted = isMe ? isMuted : p.is_muted;

              return (
                <div
                  key={p.id}
                  className="bg-[#1a1a1a] rounded-xl border border-gray-800 overflow-hidden relative flex flex-col items-center justify-center min-h-[180px]"
                >
                  {showVideo ? (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <div
                        className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-3xl md:text-4xl font-semibold text-white ${avatarColors[idx % avatarColors.length]}`}
                      >
                        {p.display_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center text-3xl md:text-4xl font-semibold text-white ${avatarColors[idx % avatarColors.length]}`}
                    >
                      {p.display_name.charAt(0).toUpperCase()}
                    </div>
                  )}

                  {/* Name Label */}
                  <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm px-3 py-1.5 rounded-md text-white text-xs font-medium flex items-center gap-2">
                    <span>{isMe ? `${p.display_name} (You)` : p.display_name}</span>
                    {showMuted && (
                      <span className="w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[8px]">
                        🔇
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panels */}
        {showParticipants && (
          <ParticipantPanel
            participants={participants}
            onClose={() => setShowParticipants(false)}
            isHost={myParticipant?.role === 'host'}
            onMuteAll={handleMuteAll}
            onRemoveParticipant={handleRemoveParticipant}
          />
        )}

        {showChat && (
          <ChatPanel
            messages={messages}
            onClose={() => setShowChat(false)}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>

      {/* Bottom Controls */}
      <MeetingControls
        isMuted={isMuted}
        isVideoOn={isVideoOn}
        onToggleMute={handleToggleMute}
        onToggleVideo={handleToggleVideo}
        onToggleParticipants={() => {
          setShowParticipants(!showParticipants);
          if (showChat) setShowChat(false);
        }}
        onToggleChat={() => {
          setShowChat(!showChat);
          if (showParticipants) setShowParticipants(false);
        }}
        onEndMeeting={handleEndMeeting}
        participantsCount={participants.length}
      />
    </div>
  );
}
