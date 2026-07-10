import api from '../api/axios';

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  durationDays: number;
  type: 'monthly' | 'yearly';
  features: string[];
  sortOrder: number;
}

interface PlanRaw {
  id: number;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  type: string;
  features: string | string[];
  sort_order: number;
}

export async function getPlans(): Promise<Plan[]> {
  const { data } = await api.get('/plans');
  return (data.data as PlanRaw[]).map(mapPlan);
}

function mapPlan(r: PlanRaw): Plan {
  let features: string[] = [];
  if (typeof r.features === 'string') {
    try { features = JSON.parse(r.features); } catch { features = [r.features]; }
  } else if (Array.isArray(r.features)) {
    features = r.features;
  }
  return {
    id: r.id, name: r.name, description: r.description || '',
    price: r.price, durationDays: r.duration_days,
    type: r.type as 'monthly' | 'yearly',
    features, sortOrder: r.sort_order
  };
}
