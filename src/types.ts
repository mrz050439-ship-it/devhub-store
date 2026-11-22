// Shared types and constants for متجري

export interface AppReview {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  comment: string;
}

export interface AppItem {
  id: string;
  title: string;
  developer: string;
  category: string;
  categoryKey: string;
  appType: 'android_native' | 'webview';
  apkFileName?: string;
  apkDownloadUrl?: string;
  packageName?: string;
  webViewUrl?: string;
  minAndroidVersion?: string;
  rating: number;
  reviewCount: number;
  downloads: string;
  downloadCount: number;
  size: string;
  version: string;
  updatedAt: string;
  gradient: string;
  shadowColor: string;
  emoji: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
  screenshots: string[];
  isFeatured?: boolean;
  isPopular?: boolean;
  isRecent?: boolean;
  reviews: AppReview[];
  createdAt: string;
}

export interface AdminStats {
  totalApps: number;
  totalDownloads: number;
  avgRating: string;
  totalReviews: number;
  categoryCounts: Record<string, number>;
  logs: { id: string; action: string; appTitle: string; timestamp: string }[];
}

export type Page = 'home' | 'apps' | 'favorites' | 'installed' | 'admin';
export type TypeFilter = 'all' | 'android' | 'webview';
export type SortKey = 'popular' | 'rating' | 'recent' | 'name';

export interface CategoryDef {
  key: string;
  name: string;
  emoji: string;
  gradient: string;
  desc: string;
}

export const CATEGORIES: CategoryDef[] = [
  { key: 'all', name: 'الكل', emoji: '✨', gradient: 'from-amber-400 via-orange-500 to-rose-500', desc: 'تصفح كل التطبيقات والألعاب' },
  { key: 'games', name: 'ألعاب', emoji: '🎮', gradient: 'from-rose-400 via-red-500 to-orange-500', desc: 'ألعاب وتحديات ممتعة' },
  { key: 'education', name: 'تعليم', emoji: '🎓', gradient: 'from-violet-400 via-purple-500 to-indigo-500', desc: 'تعلم وطور مهاراتك' },
  { key: 'tools', name: 'أدوات', emoji: '🛠️', gradient: 'from-teal-400 via-emerald-500 to-green-600', desc: 'أدوات إنتاجية يومية' },
  { key: 'social', name: 'تواصل', emoji: '💬', gradient: 'from-sky-400 via-blue-500 to-indigo-500', desc: 'دردشة ومكالمات ومجتمعات' },
  { key: 'finance', name: 'مالية', emoji: '💳', gradient: 'from-amber-400 via-yellow-500 to-amber-600', desc: 'محافظ ومدفوعات وميزانية' },
];

export const EDITABLE_CATEGORIES = CATEGORIES.filter(c => c.key !== 'all');

export const GRADIENT_OPTIONS = [
  { label: 'غروب دافئ', value: 'from-amber-400 via-orange-500 to-rose-600', shadow: 'rgba(245, 158, 11, 0.35)' },
  { label: 'أزرق كوني نيون', value: 'from-blue-500 via-indigo-600 to-cyan-500', shadow: 'rgba(59, 130, 246, 0.35)' },
  { label: 'زمردي تيتانيوم', value: 'from-emerald-400 via-teal-600 to-cyan-800', shadow: 'rgba(16, 185, 129, 0.35)' },
  { label: 'بنفسجي ملكي', value: 'from-violet-500 via-purple-600 to-fuchsia-600', shadow: 'rgba(139, 92, 246, 0.35)' },
  { label: 'وردي سيبراني', value: 'from-pink-500 via-rose-600 to-purple-800', shadow: 'rgba(244, 63, 94, 0.35)' },
  { label: 'كربوني داكن', value: 'from-zinc-600 via-slate-700 to-zinc-900', shadow: 'rgba(148, 163, 184, 0.25)' },
];

export const SORT_OPTIONS: { key: SortKey; name: string }[] = [
  { key: 'popular', name: 'الأكثر تحميلاً' },
  { key: 'rating', name: 'الأعلى تقييماً' },
  { key: 'recent', name: 'الأحدث' },
  { key: 'name', name: 'الاسم أبجدياً' },
];

export const POPULAR_SEARCHES = ['أذكار ونور', 'سباق صحراء', 'طقس العرب', 'محفظة ريال', 'مدرستي', 'ألعاب أندرويد', 'تواصل'];

export function sortApps(apps: AppItem[], sortBy: SortKey): AppItem[] {
  const list = [...apps];
  switch (sortBy) {
    case 'popular':
      return list.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    case 'rating':
      return list.sort((a, b) => b.rating - a.rating);
    case 'recent':
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case 'name':
      return list.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
    default:
      return list;
  }
}

export function appMatches(app: AppItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase().trim();
  return (
    app.title.toLowerCase().includes(q) ||
    app.developer.toLowerCase().includes(q) ||
    app.category.toLowerCase().includes(q) ||
    (app.packageName || '').toLowerCase().includes(q) ||
    app.shortDesc.toLowerCase().includes(q)
  );
  }
