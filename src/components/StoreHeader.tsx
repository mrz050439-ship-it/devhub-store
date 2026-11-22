import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Mic, Store, LayoutGrid, Heart, Download, Settings, Sparkles, Star, ChevronLeft } from 'lucide-react';
import { AppItem, Page, POPULAR_SEARCHES } from '../types';
import { TypeBadge } from './shared';

interface HeaderProps {
  page: Page;
  onNavigate: (page: Page) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  isSearchFocused: boolean;
  setIsSearchFocused: (v: boolean) => void;
  isListening: boolean;
  onVoiceSearch: () => void;
  liveMatches: AppItem[];
  onOpenApp: (app: AppItem) => void;
  installedCount: number;
  favoritesCount: number;
}

const NAV_ITEMS: { key: Page; name: string; icon: typeof Store }[] = [
  { key: 'home', name: 'الرئيسية', icon: Store },
  { key: 'apps', name: 'كل التطبيقات', icon: LayoutGrid },
  { key: 'favorites', name: 'المفضلة', icon: Heart },
  { key: 'installed', name: 'مكتبتي', icon: Download },
];

export function StoreHeader(props: HeaderProps) {
  const {
    page, onNavigate, searchQuery, setSearchQuery, isSearchFocused, setIsSearchFocused,
    isListening, onVoiceSearch, liveMatches, onOpenApp, installedCount, favoritesCount,
  } = props;

  const searchBox = (isMobile: boolean) => (
    <div className={`relative ${isMobile ? 'md:hidden' : 'flex-1 max-w-lg hidden md:block'}`}>
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-amber-400 absolute right-3.5 pointer-events-none" />
        <input
          type="text"
          placeholder="ابحث بالاسم، حزمة APK، أو اضغط الميكروفون..."
          value={searchQuery}
          onFocus={() => setIsSearchFocused(true)}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full bg-stone-900/80 border border-white/[0.08] hover:border-amber-500/50 focus:border-amber-400 text-sm text-stone-100 placeholder-stone-500 rounded-2xl pr-10 pl-20 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/20 shadow-inner"
        />
        <div className="absolute left-2.5 flex items-center gap-1">
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-white p-1 rounded-lg transition-colors" title="مسح البحث">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onVoiceSearch}
            className={`p-1.5 rounded-xl border transition-all ${
              isListening
                ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/50 animate-pulse'
                : 'bg-stone-800/80 hover:bg-stone-700 text-amber-400 border-white/[0.06] hover:border-amber-400/50'
            }`}
            title="البحث الصوتي (تحدث الآن)"
          >
            <Mic className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isSearchFocused && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setIsSearchFocused(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="absolute top-full mt-2 right-0 left-0 z-40 bg-stone-900/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-4 shadow-2xl shadow-black/80 space-y-3"
            >
              {!searchQuery.trim() ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 font-semibold px-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>عمليات البحث الشائعة:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {POPULAR_SEARCHES.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => { setSearchQuery(term); setIsSearchFocused(false); }}
                        className="px-3 py-1.5 bg-stone-800/80 hover:bg-amber-500/20 hover:border-amber-500/40 border border-white/[0.06] text-stone-300 hover:text-amber-300 text-xs rounded-xl transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 px-1 border-b border-white/[0.06] pb-2">
                    <span>النتائج الفورية ({liveMatches.length})</span>
                    <span className="text-[10px] text-amber-400">تحديث فوري أثناء الكتابة</span>
                  </div>
                  {liveMatches.length === 0 ? (
                    <div className="py-6 text-center text-xs text-stone-400 space-y-1">
                      <div>لا توجد نتائج مطابقة لـ "{searchQuery}"</div>
                      <button onClick={() => setSearchQuery('')} className="text-[11px] text-amber-400 underline">
                        مسح والبحث عن شيء آخر
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                      {liveMatches.map(m => (
                        <div
                          key={m.id}
                          onClick={() => { onOpenApp(m); setIsSearchFocused(false); }}
                          className="group cursor-pointer p-2.5 rounded-2xl bg-stone-950/40 hover:bg-stone-800/60 border border-white/[0.04] hover:border-amber-500/30 flex items-center justify-between gap-3 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${m.gradient} flex items-center justify-center text-xl shrink-0 shadow`}>
                              {m.emoji}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-white group-hover:text-amber-300 transition-colors truncate">{m.title}</div>
                              <div className="text-[10px] text-stone-400 flex items-center gap-2 mt-0.5">
                                <span>{m.category}</span>
                                <span>·</span>
                                <span className="font-mono">{m.size}</span>
                                <span>·</span>
                                <span className="text-amber-400 flex items-center gap-0.5">
                                  <Star className="w-2.5 h-2.5 fill-amber-400" />
                                  {m.rating}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <TypeBadge appType={m.appType} />
                            <ChevronLeft className="w-3.5 h-3.5 text-stone-400 group-hover:text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 bg-[#0c0a09]/85 backdrop-blur-2xl border-b border-white/[0.07] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate('home')}>
          <motion.div
            whileHover={{ rotate: 8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/25 p-0.5"
          >
            <div className="w-full h-full bg-[#0c0a09] rounded-[14px] flex items-center justify-center">
              <Store className="w-5 h-5 text-amber-400" />
            </div>
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight font-heading bg-gradient-to-l from-white via-stone-100 to-amber-300 bg-clip-text text-transparent">
                مَتْجَرِي
              </span>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-800/60 px-2 py-0.5 rounded-full">
                APK & WEBVIEW
              </span>
            </div>
            <span className="text-[11px] text-stone-400 font-medium">سوق التطبيقات العربي للأندرويد</span>
          </div>
        </div>

        {/* Desktop search */}
        {page !== 'admin' && searchBox(false)}

        {/* Controls */}
        <div className="flex items-center gap-3">
          {page !== 'admin' ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('admin')}
              className="px-4 py-2 bg-gradient-to-l from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">لوحة الأدمن</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => onNavigate('home')}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-amber-500/30 text-xs font-bold rounded-2xl transition-all"
            >
              العودة لواجهة المتجر
            </motion.button>
          )}
        </div>
      </div>

      {/* Nav menu */}
      {page !== 'admin' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-none">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            const active = page === item.key;
            const badge = item.key === 'installed' ? installedCount : item.key === 'favorites' ? favoritesCount : 0;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  active
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                    : 'text-stone-400 hover:text-white border-transparent hover:bg-stone-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
                {badge > 0 && (
                  <span className="min-w-4 h-4 px-1 rounded-full bg-amber-500/25 text-amber-300 text-[10px] flex items-center justify-center font-mono">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Mobile search */}
      {page !== 'admin' && <div className="max-w-7xl mx-auto px-4 pb-3 md:hidden">{searchBox(true)}</div>}
    </header>
  );
}
