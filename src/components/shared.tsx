import React from 'react';
import { motion } from 'motion/react';
import { Star, Download, Play, Heart, Smartphone, Globe } from 'lucide-react';
import { AppItem } from '../types';

export function Stars({ rating, className = 'w-3.5 h-3.5' }: { rating: number; className?: string }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`${className} ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-stone-700'}`}
        />
      ))}
    </div>
  );
}

export function TypeBadge({ appType, size = 'sm' }: { appType: AppItem['appType']; size?: 'sm' | 'md' }) {
  const pad = size === 'md' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[10px]';
  if (appType === 'webview') {
    return (
      <span className={`${pad} font-bold text-violet-300 bg-violet-950/80 border border-violet-800/60 rounded-full inline-flex items-center gap-1`}>
        <Globe className="w-2.5 h-2.5" />
        <span>ويب فيو</span>
      </span>
    );
  }
  return (
    <span className={`${pad} font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 rounded-full inline-flex items-center gap-1`}>
      <Smartphone className="w-2.5 h-2.5" />
      <span>APK أندرويد</span>
    </span>
  );
}

export function SectionHeader({ title, subtitle, actionLabel, onAction }: {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-7 rounded-full bg-gradient-to-b from-amber-400 to-rose-500" />
          <h2 className="text-lg sm:text-xl font-black text-white font-heading">{title}</h2>
        </div>
        {subtitle && <p className="text-xs text-stone-400 mt-1 mr-4">{subtitle}</p>}
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="shrink-0 text-xs font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3.5 py-1.5 rounded-xl transition-all"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface AppCardProps {
  app: AppItem;
  isInstalled: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  isFavorite: boolean;
  onOpen: (app: AppItem) => void;
  onInstall: (app: AppItem, e?: React.MouseEvent) => void;
  onDownloadApk: (app: AppItem, e?: React.MouseEvent) => void;
  onToggleFavorite: (appId: string, e: React.MouseEvent) => void;
}

export function AppCard({
  app,
  isInstalled,
  isDownloading,
  downloadProgress,
  isFavorite,
  onOpen,
  onInstall,
  onDownloadApk,
  onToggleFavorite,
}: AppCardProps) {
  const isWebView = app.appType === 'webview';

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
      whileHover={{ y: -4 }}
      onClick={() => onOpen(app)}
      className="group relative cursor-pointer bg-stone-900/60 hover:bg-stone-900/95 backdrop-blur-xl border border-white/[0.06] hover:border-amber-500/40 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between shadow-xl shadow-black/40 hover:shadow-amber-950/20"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-1.5">
            <TypeBadge appType={app.appType} />
            <span className="text-[10px] text-stone-500 font-mono">v{app.version}</span>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={(e) => onToggleFavorite(app.id, e)}
            className={`p-1.5 rounded-xl border transition-all ${
              isFavorite
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-stone-800/40 border-white/[0.04] text-stone-500 hover:text-rose-400'
            }`}
            title="حفظ في المفضلة"
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-400' : ''}`} />
          </motion.button>
        </div>

        <div className="flex items-start gap-4">
          <div
            className="w-16 h-16 rounded-[22px] shrink-0 transition-transform duration-300 group-hover:scale-105"
            style={{ boxShadow: `0 8px 24px -4px ${app.shadowColor}` }}
          >
            <div className={`w-full h-full rounded-[22px] bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-3xl`}>
              {app.emoji}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-base text-stone-100 group-hover:text-amber-300 transition-colors truncate font-heading">
              {app.title}
            </h4>
            <p className="text-xs text-stone-400 truncate mt-0.5">{app.developer}</p>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-stone-500">
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-amber-400" />
                {app.rating}
              </span>
              <span>·</span>
              <span>{app.downloads} تنزيل</span>
            </div>
          </div>
        </div>

        <p className="mt-4 text-xs text-stone-400 leading-relaxed line-clamp-2">{app.shortDesc}</p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-white/[0.04] flex items-center justify-between gap-2">
        <span className="text-[11px] text-stone-500 font-mono">{app.size}</span>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e) => onDownloadApk(app, e)}
            className="p-2 bg-stone-800/80 hover:bg-stone-700/80 border border-white/[0.08] text-amber-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
            title={`تحميل ملف ${app.apkFileName || 'APK'}`}
          >
            <Download className="w-3.5 h-3.5" />
            <span className="text-[11px]">APK</span>
          </motion.button>

          {isDownloading ? (
            <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300">
              <div className="w-3 h-3 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
              <span>{downloadProgress}%</span>
            </div>
          ) : isInstalled ? (
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={(e) => onInstall(app, e)}
              className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
            >
              <Play className="w-3 h-3 fill-emerald-400" />
              <span>{isWebView ? 'فتح الويب' : 'تشغيل'}</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.92 }}
              onClick={(e) => onInstall(app, e)}
              className="px-3.5 py-1.5 bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-orange-600/20"
            >
              <span>تثبيت</span>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function AppGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
    >
      {children}
    </motion.div>
  );
}
