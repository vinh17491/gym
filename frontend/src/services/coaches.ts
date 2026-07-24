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
    
    const reviewsList = (data.reviews || []).map((r: any) => ({
      user: r.member_name || 'Học viên',
      rating: r.rating || 5,
      text: r.review || 'Buổi tập rất hiệu quả và nhiệt tình!',
      date: r.updated_at ? new Date(r.updated_at).toLocaleDateString('vi-VN') : 'Vừa xong'
    }));

    return {
      id: String(data.id),
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar_url: data.avatar_url,
      is_active: data.is_active,
      created_at: data.created_at,
      workout_count: data.total_sessions || 0,
      specialty: 'Personal Trainer & Physical Conditioning',
      bio: `Huấn luyện viên chuyên nghiệp với ${data.total_sessions || 0} buổi tập đã hoàn thành cùng ${data.total_members || 0} học viên tại GymFit.`,
      rating: Number(data.avg_rating || 5.0),
      reviews: reviewsList.length,
      price: 50,
      location: 'GymFit Fitness Center',
      experience: '5+ năm kinh nghiệm',
      certifications: ['NASM Certified Personal Trainer', 'Certified Strength Coach'],
      available: true,
      availableSlots: ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      memberResults: [
        { name: 'Học viên tiêu biểu', result: 'Cải thiện thể lực và sức bền vượt bậc' },
        { name: 'Khách hàng thân thiết', result: 'Đạt mục tiêu tăng cơ giảm mỡ đúng lộ trình' },
      ],
      reviewsList: reviewsList.length ? reviewsList : [
        { user: 'Học viên GymFit', rating: 5, text: 'Coach hướng dẫn rất tận tình và đúng kỹ thuật.', date: 'Gần đây' }
      ],
    };
  } catch {
    return null;
  }
}