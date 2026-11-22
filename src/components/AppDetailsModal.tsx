import { useState } from 'react';
import { motion } from 'motion/react';
import {
  X, Heart, Star, Download, Play, Smartphone, Globe, ExternalLink,
  Send, ShieldCheck, RefreshCw, HardDrive, Trash2
} from 'lucide-react';
import { AppItem } from '../types';
import { Stars, TypeBadge } from './shared';

interface DetailsProps {
  app: AppItem;
  allApps: AppItem[];
  isInstalled: boolean;
  isFavorite: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  isSubmittingReview: boolean;
  onClose: () => void;
  onOpen: (app: AppItem) => void;
  onInstall: (app: AppItem) => void;
  onUninstall: (app: AppItem) => void;
  onDownloadApk: (app: AppItem) => void;
  onToggleFavorite: (appId: string, e: React.MouseEvent) => void;
  onOpenWebView: (url: string) => void;
  onSubmitReview: (author: string, comment: string, rating: number) => void;
}

export function AppDetailsModal({
  app, allApps, isInstalled, isFavorite, isDownloading, downloadProgress,
  isSubmittingReview, onClose, onOpen, onInstall, onUninstall, onDownloadApk,
  onToggleFavorite, onOpenWebView, onSubmitReview,
}: DetailsProps) {
  const [author, setAuthor] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);

  const similar = allApps.filter(a => a.categoryKey === app.categoryKey && a.id !== app.id).slice(0, 4);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmitReview(author.trim(), comment.trim(), rating);
    setAuthor('');
    setComment('');
    setRating(5);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-stone-900 border border-white/[0.1] rounded-[32px] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Gradient hero header */}
        <div className={`relative bg-gradient-to-bl ${app.gradient} shrink-0`}>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-black/40 to-black/10" />
          <div className="relative px-6 sm:px-8 pt-5 pb-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TypeBadge appType={app.appType} size="md" />
                <span className="text-xs text-white/80">الإصدار {app.version}</span>
              </div>
              <div className="flex items-center gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => onToggleFavorite(app.id, e)}
                  className={`p-2 rounded-xl border backdrop-blur transition-colors ${
                    isFavorite ? 'bg-rose-500/20 border-rose-400/40 text-rose-300' : 'bg-black/30 border-white/20 text-white/80 hover:text-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-300' : ''}`} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="p-2 rounded-xl bg-black/30 border border-white/20 text-white/80 hover:text-white backdrop-blur transition-colors"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>
            </div>

            <div className="flex items-end gap-5">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[26px] bg-white/15 backdrop-blur-xl border border-white/30 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl shrink-0">
                {app.emoji}
              </div>
              <div className="min-w-0 pb-1">
                <h2 className="text-2xl sm:text-3xl font-black text-white font-heading truncate">{app.title}</h2>
                <p className="text-sm font-semibold text-white/85 mt-1">{app.developer}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <Stars rating={app.rating} />
                  <span className="text-xs text-white/75">({app.reviewCount.toLocaleString('ar')} مراجعة)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto p-6 sm:p-8 space-y-7">
          {/* Key metrics */}
          <div className="grid grid-cols-4 gap-2 bg-stone-950/70 border border-white/[0.06] rounded-2xl p-4 text-center">
            <div>
              <div className="text-[11px] text-stone-400 flex items-center justify-center gap-1"><Star className="w-3 h-3" />التقييم</div>
              <div className="text-sm font-bold text-amber-400 mt-1">{app.rating}</div>
            </div>
            <div className="border-r border-white/[0.06]">
              <div className="text-[11px] text-stone-400 flex items-center justify-center gap-1"><HardDrive className="w-3 h-3" />الحجم</div>
              <div className="text-sm font-bold text-white mt-1">{app.size}</div>
            </div>
            <div className="border-r border-white/[0.06]">
              <div className="text-[11px] text-stone-400 flex items-center justify-center gap-1"><Smartphone className="w-3 h-3" />النظام</div>
              <div className="text-sm font-bold text-teal-300 mt-1">{(app.minAndroidVersion || 'Android 8.0+').replace('Android ', '')}</div>
            </div>
            <div>
              <div className="text-[11px] text-stone-400 flex items-center justify-center gap-1"><RefreshCw className="w-3 h-3" />التحديث</div>
              <div className="text-sm font-bold text-violet-300 mt-1">{app.updatedAt}</div>
            </div>
          </div>

          {/* Primary actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDownloadApk(app)}
              className="py-3.5 px-5 bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-orange-600/25 flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>تحميل ملف APK المباشر ({app.size})</span>
            </motion.button>

            {app.appType === 'webview' && app.webViewUrl ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenWebView(app.webViewUrl || '')}
                className="py-3.5 px-5 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>تشغيل تجربة الويب فيو الحية</span>
              </motion.button>
            ) : isDownloading ? (
              <div className="py-3.5 px-5 bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold text-sm rounded-2xl flex items-center justify-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <span>جاري التثبيت... {downloadProgress}%</span>
              </div>
            ) : isInstalled ? (
              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onInstall(app)}
                  className="py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>تشغيل</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onUninstall(app)}
                  className="py-3.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 border border-white/[0.08] font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>إزالة</span>
                </motion.button>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onInstall(app)}
                className="py-3.5 px-5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-white/[0.08] font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>تثبيت في المتجر</span>
              </motion.button>
            )}
          </div>

          {/* Screenshots as preview frames */}
          {app.screenshots && app.screenshots.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-heading">لقطات من التطبيق</h3>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                {app.screenshots.map((shot, i) => (
                  <div
                    key={i}
                    className={`shrink-0 w-32 aspect-[9/18] rounded-2xl bg-gradient-to-b ${app.gradient} p-2 flex flex-col border border-white/15`}
                  >
                    <div className="w-8 h-1 rounded-full bg-white/40 mx-auto mb-2" />
                    <div className="flex-1 rounded-xl bg-black/30 backdrop-blur flex flex-col items-center justify-center gap-2 px-2">
                      <span className="text-3xl">{app.emoji}</span>
                      <span className="text-[10px] text-white/90 text-center leading-snug font-medium">{shot}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {app.features && app.features.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white font-heading">أبرز المميزات</h3>
              <div className="flex flex-wrap gap-2">
                {app.features.map((f, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-xs text-stone-200 bg-stone-950/70 border border-white/[0.07] px-3 py-1.5 rounded-xl">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    {f}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white font-heading">عن التطبيق</h3>
            <p className="text-sm text-stone-300 leading-relaxed whitespace-pre-line">{app.fullDesc}</p>
          </div>

          {/* Package info */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-white font-heading">معلومات الحزمة</h3>
            <div className="bg-stone-950/60 border border-white/[0.06] rounded-2xl p-4 text-xs font-mono space-y-1.5 text-stone-300">
              <div><span className="text-stone-500">اسم الحزمة:</span> {app.packageName || `com.matjari.${app.id}`}</div>
              <div><span className="text-stone-500">ملف الـ APK:</span> {app.apkFileName || `${app.title}.apk`}</div>
              {app.appType === 'webview' && app.webViewUrl && (
                <div><span className="text-stone-500">رابط الويب فيو:</span> <a href={app.webViewUrl} target="_blank" rel="noreferrer" className="text-amber-400 underline">{app.webViewUrl}</a></div>
              )}
              <div><span className="text-stone-500">الحد الأدنى للنظام:</span> {app.minAndroidVersion || 'Android 8.0+'}</div>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-4 pt-4 border-t border-white/[0.06]">
            <h3 className="text-sm font-bold text-white font-heading">
              مراجعات المستخدمين ({app.reviews?.length || 0})
            </h3>

            <form onSubmit={submit} className="bg-stone-950/60 border border-white/[0.06] rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <input
                  type="text"
                  placeholder="اسمك الكريم..."
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  className="bg-stone-900 border border-white/[0.06] rounded-xl px-3 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                />
                <div className="flex items-center gap-2 bg-stone-900 border border-white/[0.06] rounded-xl px-3 py-2">
                  <span className="text-stone-400">التقييم:</span>
                  <div className="flex items-center gap-1" dir="ltr">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} type="button" onClick={() => setRating(star)}>
                        <Star className={`w-4 h-4 ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-stone-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="اكتب تجربتك مع حزمة هذا التطبيق..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="w-full bg-stone-900 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />

              <div className="flex justify-end">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubmittingReview}
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-l from-amber-500 to-orange-600 hover:from-amber-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingReview ? 'جاري الإرسال...' : 'إرسال المراجعة'}</span>
                </motion.button>
              </div>
            </form>

            <div className="space-y-2">
              {app.reviews?.map(rev => (
                <div key={rev.id} className="bg-stone-950/40 border border-white/[0.04] p-3.5 rounded-xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-stone-800 border border-white/[0.06] flex items-center justify-center text-sm">{rev.avatar}</span>
                      <span className="font-bold text-white">{rev.userName}</span>
                    </div>
                    <Stars rating={rev.rating} className="w-3 h-3" />
                  </div>
                  <p className="text-stone-300 leading-relaxed">{rev.comment}</p>
                  <div className="text-[10px] text-stone-500">{rev.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Similar apps */}
          {similar.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/[0.06]">
              <h3 className="text-sm font-bold text-white font-heading">تطبيقات مشابهة</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {similar.map(s => (
                  <button
                    key={s.id}
                    onClick={() => onOpen(s)}
                    className="group bg-stone-950/50 hover:bg-stone-800/60 border border-white/[0.05] rounded-2xl p-3 text-center transition-all"
                  >
                    <div className={`w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr ${s.gradient} flex items-center justify-center text-2xl mb-2`}>
                      {s.emoji}
                    </div>
                    <div className="text-xs font-bold text-white truncate group-hover:text-amber-300 transition-colors">{s.title}</div>
                    <div className="text-[10px] text-amber-400 mt-0.5">★ {s.rating}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
          }
