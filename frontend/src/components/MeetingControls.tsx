import { Mic, MicOff, Video, VideoOff, MonitorUp, Users, MessageSquare, MoreHorizontal, PhoneOff } from 'lucide-react';

interface MeetingControlsProps {
  isMuted: boolean;
  isVideoOn: boolean;
  onToggleMute: () => void;
  onToggleVideo: () => void;
  onToggleParticipants: () => void;
  onToggleChat: () => void;
  onEndMeeting: () => void;
  participantsCount: number;
  unreadChatCount?: number;
}

export default function MeetingControls({
  isMuted,
  isVideoOn,
  onToggleMute,
  onToggleVideo,
  onToggleParticipants,
  onToggleChat,
  onEndMeeting,
  participantsCount,
  unreadChatCount = 0
}: MeetingControlsProps) {
  const ControlButton = ({ icon: Icon, label, onClick, isActive = false, isDanger = false, badge = 0 }: any) => (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl transition-colors relative group ${
        isDanger 
          ? 'bg-red-500 hover:bg-red-600 text-white' 
          : isActive
            ? 'text-red-500 hover:bg-gray-800'
            : 'text-gray-300 hover:bg-gray-800 hover:text-white'
      }`}
    >
      <Icon className={`w-5 h-5 md:w-6 md:h-6 mb-1 ${isActive ? 'text-red-500' : ''}`} />
      <span className="text-[10px] md:text-xs font-medium">{label}</span>
      
      {badge > 0 && (
        <span className="absolute top-1 right-2 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );

  return (
    <div className="h-20 md:h-24 bg-[#1a1a1a] border-t border-gray-800 flex items-center justify-between px-2 md:px-6 w-full shrink-0">
      <div className="flex items-center space-x-1 md:space-x-2">
        <ControlButton 
          icon={isMuted ? MicOff : Mic} 
          label={isMuted ? "Unmute" : "Mute"} 
          isActive={isMuted}
          onClick={onToggleMute} 
        />
        <ControlButton 
          icon={isVideoOn ? Video : VideoOff} 
          label={isVideoOn ? "Start Video" : "Stop Video"} 
          isActive={!isVideoOn}
          onClick={onToggleVideo} 
        />
      </div>
      
      <div className="flex items-center space-x-1 md:space-x-2">
        <ControlButton 
          icon={MonitorUp} 
          label="Share" 
          onClick={() => {}} 
        />
        <ControlButton 
          icon={Users} 
          label="Participants" 
          badge={participantsCount}
          onClick={onToggleParticipants} 
        />
        <ControlButton 
          icon={MessageSquare} 
          label="Chat" 
          badge={unreadChatCount}
          onClick={onToggleChat} 
        />
        <ControlButton 
          icon={MoreHorizontal} 
          label="More" 
          onClick={() => {}} 
        />
      </div>

      <div>
        <ControlButton 
          icon={PhoneOff} 
          label="End" 
          isDanger={true}
          onClick={onEndMeeting} 
        />
      </div>
    </div>
  );
}
