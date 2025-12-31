import { AnnouncementsPublic } from "../client";

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const AnnouncementsApi = {
  getPublishedAnnouncements: async (skip: number = 0, limit: number = 100): Promise<AnnouncementsPublic> => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/announcements/published?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch published announcements: ${response.statusText}`);
    }

    return response.json();
  },

  getAllAnnouncements: async (skip: number = 0, limit: number = 100): Promise<AnnouncementsPublic> => {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_BASE_URL}/announcements?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch announcements: ${response.statusText}`);
    }

    return response.json();
  },
};