import { Meeting, Participant } from '../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(errorText || `Request failed with status ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Meeting endpoints
  async createInstantMeeting(): Promise<Meeting> {
    return request<Meeting>(`${API_URL}/meetings/?host_id=1`, { method: 'POST' });
  },

  async scheduleMeeting(data: {
    title: string;
    description?: string;
    start_time?: string;
    duration: number;
  }): Promise<Meeting> {
    return request<Meeting>(`${API_URL}/meetings/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, host_id: 1 }),
    });
  },

  async getMeetings(): Promise<Meeting[]> {
    return request<Meeting[]>(`${API_URL}/meetings/`);
  },

  async getUpcomingMeetings(): Promise<Meeting[]> {
    try {
      return await request<Meeting[]>(`${API_URL}/meetings/upcoming`);
    } catch {
      return [];
    }
  },

  async getRecentMeetings(): Promise<Meeting[]> {
    try {
      return await request<Meeting[]>(`${API_URL}/meetings/recent`);
    } catch {
      return [];
    }
  },

  async getMeeting(code: string): Promise<Meeting> {
    return request<Meeting>(`${API_URL}/meetings/${code}`);
  },

  async updateMeetingStatus(code: string, status: string): Promise<Meeting> {
    return request<Meeting>(`${API_URL}/meetings/${code}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  // Participant endpoints
  async joinMeeting(code: string, displayName: string, userId?: number): Promise<Participant> {
    return request<Participant>(`${API_URL}/meetings/${code}/participants/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ display_name: displayName, user_id: userId }),
    });
  },

  async getParticipants(code: string): Promise<Participant[]> {
    return request<Participant[]>(`${API_URL}/meetings/${code}/participants/`);
  },

  async toggleMute(code: string, participantId: number): Promise<void> {
    await fetch(`${API_URL}/meetings/${code}/participants/${participantId}/toggle-mute`, {
      method: 'PUT',
    });
  },

  async toggleVideo(code: string, participantId: number): Promise<void> {
    await fetch(`${API_URL}/meetings/${code}/participants/${participantId}/toggle-video`, {
      method: 'PUT',
    });
  },

  async muteAll(code: string): Promise<void> {
    await fetch(`${API_URL}/meetings/${code}/participants/mute-all`, { method: 'PUT' });
  },

  async removeParticipant(code: string, participantId: number): Promise<void> {
    await fetch(`${API_URL}/meetings/${code}/participants/${participantId}`, { method: 'DELETE' });
  },

  async leaveMeeting(code: string, participantId: number): Promise<void> {
    await fetch(`${API_URL}/meetings/${code}/participants/leave?participant_id=${participantId}`, {
      method: 'POST',
    });
  },
};
