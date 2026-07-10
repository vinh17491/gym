import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export interface Coach {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  is_active: number;
  created_at: string;
  workout_count: number;
  avgRating?: number;
  totalMembers?: number;
  totalSessions?: number;
}

export interface CoachDetail extends Coach {
  specialty?: string;
  bio?: string;
  rating?: number;
  reviews?: number;
  price?: number;
  location?: string;
  experience?: string;
  certifications?: string[];
  available?: boolean;
  availableSlots?: string[];
  memberResults?: { name: string; result: string }[];
  reviewsList?: { user: string; rating: number; text: string; date: string }[];
}

export async function getCoaches(params?: { search?: string; page?: number; limit?: number }): Promise<Coach[]> {
  try {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    
    const res = await axios.get(`${API_BASE}/coaches?${q}`);
    return res.data?.data?.coaches ?? [];
  } catch {
    return [];
  }
}

export async function getCoachById(id: string): Promise<CoachDetail | null> {
  try {
    const res = await axios.get(`${API_BASE}/coaches/${id}`);
    const data = res.data?.data;
    if (!data) return null;
    
    // Map DB data to CoachDetail with defaults
    return {
      id: String(data.id),
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar_url,
      is_active: data.is_active,
      created_at: data.created_at,
      workout_count: data.workout_count || 0,
      specialty: 'Personal Training',
      bio: `Experienced fitness coach with ${data.workout_count || 0} workout programs.`,
      rating: 4.5,
      reviews: Math.floor(Math.random() * 50) + 20,
      price: 50 + Math.floor(Math.random() * 30),
      location: 'Online / Gym',
      experience: '5+ years',
      certifications: ['NASM Certified', 'CrossFit Level 1'],
      available: true,
      availableSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
      memberResults: [
        { name: 'Member 1', result: 'Achieved fitness goals' },
        { name: 'Member 2', result: 'Improved strength significantly' },
      ],
      reviewsList: [
        { user: 'Client A', rating: 5, text: 'Great coach!', date: '1 week ago' },
        { user: 'Client B', rating: 4, text: 'Very knowledgeable', date: '2 weeks ago' },
      ],
    };
  } catch {
    return null;
  }
}