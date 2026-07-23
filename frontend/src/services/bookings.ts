import api from '../api/axios';

export interface BookableCoach {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  total_members: number;
  avg_rating: number;
  total_sessions: number;
}

export interface CoachAvailability {
  date: string;
  coach_id: number;
  available_slots: string[];
  booked_slots: string[];
}

export interface BookingPayload {
  coach_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
}

export interface BookingResponse {
  id: number;
  coach_id: number;
  member_id: number;
  booking_date: string;
  start_time: string;
  end_time: string;
  status: string;
  notes?: string;
  created_at: string;
}

export async function getBookableCoaches(): Promise<BookableCoach[]> {
  const response = await api.get('/bookings/coaches');
  return response.data?.data ?? [];
}

export async function getCoachAvailability(coachId: number, date: string): Promise<CoachAvailability> {
  const response = await api.get(`/bookings/coaches/${coachId}/availability`, { params: { date } });
  return response.data?.data;
}

export async function createBooking(payload: BookingPayload): Promise<BookingResponse> {
  const response = await api.post('/bookings', payload);
  return response.data?.data;
}
