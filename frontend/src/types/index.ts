export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
}

export interface Meeting {
  id: number;
  meeting_code: string;
  title: string;
  description?: string;
  host_id: number;
  start_time?: string;
  duration: number;
  status: string;
  meeting_type: string;
  invite_link: string;
  passcode?: string;
  created_at: string;
  host?: User;
}

export interface Participant {
  id: number;
  meeting_id: number;
  user_id?: number;
  display_name: string;
  role: string;
  is_muted: boolean;
  is_video_on: boolean;
  joined_at: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: string;
}
