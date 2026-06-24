export interface User { id: number; email: string; name: string; phone?: string; role: 'member'|'coach'|'admin'; referral_code?: string; avatar_url?: string; }
export interface AuthState { user: User | null; token: string | null; isAuthenticated: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; }
export interface PaginatedResponse<T> { success: boolean; data: T[]; pagination: { total: number; page: number; limit: number; totalPages: number; }; }
export interface ApiError { success: false; message: string; errors?: { field: string; message: string }[]; }
