import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { AppItem, CATEGORIES } from '../types';
import { SectionHeader } from './shared';

interface CategoryCardsProps {
  apps: AppItem[];
  onSelect: (categoryKey: string) => void;
}

export function CategoryCards({ apps, onSelect }: CategoryCardsProps) {
  return (
    <section className="space-y-4">
      <SectionHeader
        title="تصفح حسب الفئة"
        subtitle="فئات مرتبة تسهّل عليك الوصول لنوع التطبيقات اللي تدور عليه"
      />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.filter(c => c.key !== 'all').map(cat => {
          const count = apps.filter(a => a.categoryKey === cat.key).length;
          return (
            <motion.button
              key={cat.key}
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(cat.key)}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.06] hover:border-white/[0.15] bg-stone-900/60 p-4 text-right transition-all"
            >
              <div className={`absolute -top-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-tr ${cat.gradient} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${cat.gradient} flex items-center justify-center text-xl shadow-lg mb-3`}>
                {cat.emoji}
              </div>
              <div className="font-bold text-sm text-white font-heading">{cat.name}</div>
              <div className="text-[11px] text-stone-400 mt-0.5 leading-snug">{cat.desc}</div>
              <div className="flex items-center justify-between mt-3">
                <span className="text-[10px] font-bold text-stone-500">{count} تطبيق</span>
                <ArrowLeft className="w-3.5 h-3.5 text-stone-600 group-hover:text-amber-400 group-hover:-translate-x-0.5 transition-all" />
              </div>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

interface AppRailProps {
  title: string;
  subtitle?: string;
  apps: AppItem[];
  installedApps: Record<string, boolean>;
  onOpen: (app: AppItem) => void;
  onInstall: (app: AppItem, e?: React.MouseEvent) => void;
  onShowAll?: () => void;
}

export function AppRail({ title, subtitle, apps, installedApps, onOpen, onInstall, onShowAll }: AppRailProps) {
  if (apps.length === 0) return null;
  return (
    <section className="space-y-4">
      <SectionHeader title={title} subtitle={subtitle} actionLabel={onShowAll ? 'عرض الكل' : undefined} onAction={onShowAll} />
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
        {apps.map(app => {
          const isInstalled = Boolean(installedApps[app.id]);
          return (
            <motion.div
              key={app.id}
              whileHover={{ y: -3 }}
              onClick={() => onOpen(app)}
              className="group shrink-0 w-[168px] cursor-pointer bg-stone-900/60 hover:bg-stone-900/95 border border-white/[0.06] hover:border-amber-500/40 rounded-3xl p-4 transition-all"
            >
              <div
                className="w-full aspect-square rounded-2xl flex items-center justify-center text-5xl mb-3"
                style={{ boxShadow: `0 10px 26px -6px ${app.shadowColor}` }}
              >
                <div className={`w-full h-full rounded-2xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center`}>
                  {app.emoji}
                </div>
              </div>
              <div className="font-bold text-sm text-white truncate font-heading group-hover:text-amber-300 transition-colors">
                {app.title}
              </div>
              <div className="text-[11px] text-stone-500 truncate mt-0.5">{app.developer}</div>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-[11px] font-bold text-amber-400">★ {app.rating}</span>
                <button
                  onClick={(e) => onInstall(app, e)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-xl transition-all ${
                    isInstalled
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25'
                  }`}
                >
                  {isInstalled ? 'تشغيل' : 'تثبيت'}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
