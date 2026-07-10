import { config } from '../config/config';

const BASE = config.wger.baseUrl;
const TIMEOUT = config.wger.timeout;

async function wgerFetch<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE}${path}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...options.headers },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`wger API error: ${res.status} ${res.statusText}`);
    return await res.json() as T;
  } finally {
    clearTimeout(timer);
  }
}

interface WgerPaginated<T> { count: number; next: string | null; previous: string | null; results: T[]; }

export interface WgerExercise { id: number; uuid: string; name: string; description: string; category: number; muscles: number[]; muscles_secondary: number[]; equipment: number[]; }
export interface WgerExerciseInfo { id: number; uuid: string; name: string; description: string; category: { id: number; name: string }; muscles: { id: number; name: string; name_en: string }[]; muscles_secondary: { id: number; name: string; name_en: string }[]; equipment: { id: number; name: string }[]; images: { id: number; uuid: string; image: string; is_main: boolean }[]; videos: { id: number; uuid: string; url: string; is_main: boolean; duration: number }[]; }
export interface WgerCategory { id: number; name: string; }
export interface WgerMuscle { id: number; name: string; name_en: string; is_front: boolean; image_url_main: string; }
export interface WgerEquipment { id: number; name: string; }
export interface WgerExerciseImage { id: number; uuid: string; exercise: number; image: string; thumbnails: { small: string; medium: string }; is_main: boolean; }
export interface WgerExerciseVideo { id: number; uuid: string; exercise: number; url: string; is_main: boolean; duration: number; }

export const wgerService = {
  async getExercises(offset = 0, limit = 50, category?: number): Promise<WgerPaginated<WgerExercise>> {
    let path = `/exercise/?format=json&offset=${offset}&limit=${limit}`;
    if (category) path += `&category=${category}`;
    return wgerFetch(path);
  },
  async getExerciseInfo(offset = 0, limit = 20): Promise<WgerPaginated<WgerExerciseInfo>> {
    return wgerFetch(`/exerciseinfo/?format=json&offset=${offset}&limit=${limit}`);
  },
  async getExerciseById(id: number): Promise<WgerExerciseInfo> {
    return wgerFetch(`/exerciseinfo/${id}/?format=json`);
  },
  async getCategories(): Promise<WgerPaginated<WgerCategory>> {
    return wgerFetch('/exercisecategory/?format=json&limit=50');
  },
  async getMuscles(): Promise<WgerPaginated<WgerMuscle>> {
    return wgerFetch('/muscle/?format=json&limit=50');
  },
  async getEquipment(): Promise<WgerPaginated<WgerEquipment>> {
    return wgerFetch('/equipment/?format=json&limit=50');
  },
  async getExerciseImages(exerciseId?: number, offset = 0, limit = 20): Promise<WgerPaginated<WgerExerciseImage>> {
    let path = `/exerciseimage/?format=json&offset=${offset}&limit=${limit}`;
    if (exerciseId) path += `&exercise=${exerciseId}`;
    return wgerFetch(path);
  },
  async getExerciseVideos(exerciseId?: number, offset = 0, limit = 20): Promise<WgerPaginated<WgerExerciseVideo>> {
    let path = `/exercisevideo/?format=json&offset=${offset}&limit=${limit}`;
    if (exerciseId) path += `&exercise=${exerciseId}`;
    return wgerFetch(path);
  },
  async searchExercises(query: string, offset = 0, limit = 20): Promise<WgerPaginated<WgerExerciseInfo>> {
    return wgerFetch(`/exerciseinfo/?format=json&offset=${offset}&limit=${limit}&name=${encodeURIComponent(query)}`);
  },
  async getExercisesByMuscle(muscleId: number, offset = 0, limit = 20): Promise<WgerPaginated<WgerExercise>> {
    return wgerFetch(`/exercise/?format=json&offset=${offset}&limit=${limit}&muscles=${muscleId}`);
  },
  async getExercisesByEquipment(equipmentId: number, offset = 0, limit = 20): Promise<WgerPaginated<WgerExercise>> {
    return wgerFetch(`/exercise/?format=json&offset=${offset}&limit=${limit}&equipment=${equipmentId}`);
  },
};

export default wgerService;
