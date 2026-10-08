'use client';

import { useState, useEffect } from 'react';
import { Video, PlusSquare, Calendar, MonitorUp } from 'lucide-react';
import Link from 'next/link';
import NewMeetingModal from './NewMeetingModal';
import MeetingCard from './MeetingCard';
import { api } from '@/lib/api';
import { Meeting } from '@/types';

export default function HomeContent() {
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [upcomingMeetings, setUpcomingMeetings] = useState<Meeting[]>([]);
  const [recentMeetings, setRecentMeetings] = useState<Meeting[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch meetings on mount
  useEffect(() => {
    const fetchMeetings = async () => {
      const [upcoming, recent] = await Promise.all([
        api.getUpcomingMeetings(),
        api.getRecentMeetings(),
      ]);
      setUpcomingMeetings(upcoming);
      setRecentMeetings(recent);
    };
    fetchMeetings();
  }, []);

  // Refresh meetings after modal closes (in case a new one was created)
  const handleModalClose = () => {
    setIsNewMeetingModalOpen(false);
    api.getUpcomingMeetings().then(setUpcomingMeetings);
    api.getRecentMeetings().then(setRecentMeetings);
  };

  const actionButtons = [
    {
      title: 'New Meeting',
      icon: Video,
      color: 'bg-orange-500 hover:bg-orange-600',
      onClick: () => setIsNewMeetingModalOpen(true),
    },
    {
      title: 'Join',
      icon: PlusSquare,
      color: 'bg-zoom-blue hover:bg-blue-700',
      href: '/join',
    },
    {
      title: 'Schedule',
      icon: Calendar,
      color: 'bg-zoom-blue hover:bg-blue-700',
      href: '/schedule',
    },
    {
      title: 'Share Screen',
      icon: MonitorUp,
      color: 'bg-zoom-blue hover:bg-blue-700',
      onClick: () => alert('Share Screen feature coming soon!'),
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      {/* Date/Time Hero Banner */}
      <div className="bg-gradient-to-r from-zoom-dark to-gray-800 rounded-2xl p-8 mb-8 text-white shadow-lg">
        <h2 className="text-4xl md:text-5xl font-light mb-2">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </h2>
        <p className="text-gray-300 font-medium">
          {currentTime.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {actionButtons.map((btn, idx) => {
          const BtnContent = (
            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 dark:border-gray-700 h-full">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg ${btn.color}`}
              >
                <btn.icon className="w-7 h-7" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {btn.title}
              </span>
            </div>
          );

          if (btn.href) {
            return (
              <Link href={btn.href} key={idx} className="block h-full">
                {BtnContent}
              </Link>
            );
          }

          return (
            <div key={idx} onClick={btn.onClick} className="h-full">
              {BtnContent}
            </div>
          );
        })}
      </div>

      {/* Meetings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Meetings */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Upcoming Meetings
          </h3>
          <div className="space-y-4">
            {upcomingMeetings.length > 0 ? (
              upcomingMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                <Calendar className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No upcoming meetings scheduled.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Meetings */}
        <div>
          <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
            Recent Meetings
          </h3>
          <div className="space-y-4">
            {recentMeetings.length > 0 ? (
              recentMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))
            ) : (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 text-center">
                <Video className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No recent meetings.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isNewMeetingModalOpen && <NewMeetingModal onClose={handleModalClose} />}
    </div>
  );
}
