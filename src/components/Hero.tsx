import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, Download, Play, Star, Flame } from 'lucide-react';
import { AppItem } from '../types';

interface HeroProps {
  apps: AppItem[];
  installedApps: Record<string, boolean>;
  onOpen: (app: AppItem) => void;
  onInstall: (app: AppItem) => void;
  onDownloadApk: (app: AppItem) => void;
}

export function Hero({ apps, installedApps, onOpen, onInstall, onDownloadApk }: HeroProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (apps.length < 2) return;
    const t = setInterval(() => setIndex(i => (i + 1) % apps.length), 6000);
    return () => clearInterval(t);
  }, [apps.length]);

  if (apps.length === 0) return null;
  const app = apps[index % apps.length];
  const isInstalled = Boolean(installedApps[app.id]);

  return (
    <div className="relative overflow-hidden rounded-[32px] border border-white/[0.07] shadow-2xl shadow-black/50">
      <AnimatePresence mode="wait">
        <motion.div
          key={app.id}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className={`relative bg-gradient-to-bl ${app.gradient} p-6 sm:p-10`}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-l from-black/75 via-black/45 to-black/15" />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '26px 26px' }}
          />

          <div className="relative z-10 flex items-center gap-6 sm:gap-8">
            <motion.div
              initial={{ rotate: -6, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
              onClick={() => onOpen(app)}
              className="cursor-pointer w-24 h-24 sm:w-36 sm:h-36 rounded-[28px] sm:rounded-[36px] bg-white/10 backdrop-blur-xl border border-white/25 flex items-center justify-center text-5xl sm:text-7xl shadow-2xl shrink-0"
            >
              {app.emoji}
            </motion.div>

            <div className="min-w-0 flex-1 text-white">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold bg-black/35 backdrop-blur border border-white/20 px-3 py-1 rounded-full mb-2.5">
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>اختيار المحررين هذا الأسبوع</span>
              </div>
              <h1
                onClick={() => onOpen(app)}
                className="cursor-pointer text-2xl sm:text-4xl font-black font-heading leading-tight truncate"
              >
                {app.title}
              </h1>
              <p className="text-sm sm:text-base text-white/85 mt-1.5 line-clamp-2 max-w-xl leading-relaxed">
                {app.shortDesc}
              </p>
              <div className="flex items-center gap-3 mt-3 text-xs sm:text-sm text-white/80">
                <span className="flex items-center gap-1 font-bold">
                  <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
                  {app.rating}
                </span>
                <span>·</span>
                <span>{app.downloads} تنزيل</span>
                <span>·</span>
                <span className="font-mono">{app.size}</span>
              </div>

              <div className="flex items-center gap-3 mt-5">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onInstall(app)}
                  className="px-6 py-3 bg-white text-stone-900 hover:bg-amber-50 font-black text-sm rounded-2xl transition-all shadow-xl flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-stone-900" />
                  <span>{isInstalled ? 'تشغيل الآن' : 'تثبيت مجاني'}</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={() => onDownloadApk(app)}
                  className="px-5 py-3 bg-black/35 hover:bg-black/50 backdrop-blur border border-white/25 text-white font-bold text-sm rounded-2xl transition-all flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">تحميل APK</span>
                  <span className="sm:hidden">APK</span>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Carousel dots */}
      {apps.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur px-3 py-1.5 rounded-full border border-white/10">
          {apps.map((a, i) => (
            <button
              key={a.id}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${i === index % apps.length ? 'w-6 bg-amber-400' : 'w-1.5 bg-white/40 hover:bg-white/70'}`}
              title={a.title}
            />
          ))}
        </div>
      )}

      {/* Side arrows for manual browse */}
      {apps.length > 1 && (
        <button
          onClick={() => setIndex((index + 1) % apps.length)}
          className="absolute top-1/2 -translate-y-1/2 left-3 z-20 p-2 rounded-full bg-black/40 hover:bg-black/60 border border-white/15 text-white backdrop-blur transition-all"
          title="التالي"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
