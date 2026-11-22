import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, Inbox, Store } from 'lucide-react';
import {
  AppItem, AdminStats, Page, TypeFilter, SortKey,
  CATEGORIES, SORT_OPTIONS, sortApps, appMatches,
} from './types';
import { AppCard, AppGrid, SectionHeader } from './components/shared';
import { Hero } from './components/Hero';
import { CategoryCards, AppRail } from './components/Sections';
import { AppDetailsModal } from './components/AppDetailsModal';
import { EditorModal, EditorPayload } from './components/EditorModal';
import { AdminPanel } from './components/AdminPanel';
import { StoreHeader } from './components/StoreHeader';
import { WebViewModal } from './components/WebViewModal';

const LS_INSTALLED = 'matjari.installed';
const LS_FAVORITES = 'matjari.favorites';

function loadLS(key: string): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return {};
}

export default function App() {
  // Navigation
  const [page, setPage] = useState<Page>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortKey>('popular');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Data
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [liveWebViewUrl, setLiveWebViewUrl] = useState<string | null>(null);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // Editor
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);

  // Review submission
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Local device state (persisted)
  const [installedApps, setInstalledApps] = useState<Record<string, boolean>>(() => {
    const stored = loadLS(LS_INSTALLED);
    return Object.keys(stored).length > 0 ? stored : { 'app-1': true };
  });
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => loadLS(LS_FAVORITES));
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try { localStorage.setItem(LS_INSTALLED, JSON.stringify(installedApps)); } catch { /* ignore */ }
  }, [installedApps]);
  useEffect(() => {
    try { localStorage.setItem(LS_FAVORITES, JSON.stringify(favorites)); } catch { /* ignore */ }
  }, [favorites]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Data fetching
  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      if (data.success) setApps(data.data);
    } catch (e) {
      console.error('Error fetching apps:', e);
      triggerToast('حدث خطأ أثناء جلب التطبيقات');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAdminStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) setAdminStats(data.data);
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    }
  }, []);

  useEffect(() => { fetchApps(); }, [fetchApps]);
  useEffect(() => { if (page === 'admin') fetchAdminStats(); }, [page, fetchAdminStats]);

  // Live search matches
  const liveMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return apps.filter(a => appMatches(a, searchQuery)).slice(0, 5);
  }, [apps, searchQuery]);

  // Voice search (Web Speech API)
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast('عذراً، متصفحك لا يدعم التعرف الصوتي المباشر.');
      return;
    }
    if (isListening) { setIsListening(false); return; }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.onstart = () => {
        setIsListening(true);
        setIsSearchFocused(true);
        triggerToast('🎙️ جاري الاستماع لصوتك... تحدث باسم التطبيق الآن');
      };
      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((res: any) => res[0])
          .map((res: any) => res.transcript)
          .join('');
        setSearchQuery(transcript);
      };
      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          triggerToast('يرجى السماح بالوصول إلى الميكروفون لاستخدام البحث بالصوت');
        } else {
          triggerToast('لم يتم التقاط الصوت بوضوح، يرجى إعادة المحاولة');
        }
      };
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (err) {
      setIsListening(false);
      triggerToast('تعذر تشغيل الميكروفون');
    }
  };

  // APK download
  const triggerApkDownload = (app: AppItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    triggerToast(`جاري تنزيل ملف APK: ${app.apkFileName || app.title + '.apk'}`);
    const link = document.createElement('a');
    link.href = `/api/download/${app.id}`;
    link.setAttribute('download', app.apkFileName || `${app.title}.apk`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, downloadCount: (a.downloadCount || 0) + 1 } : a));
  };

  // Install simulation
  const handleInstall = (app: AppItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (installedApps[app.id]) {
      if (app.appType === 'webview' && app.webViewUrl) {
        setLiveWebViewUrl(app.webViewUrl);
      } else {
        triggerToast(`تشغيل تطبيق "${app.title}"`);
      }
      return;
    }
    if (downloadingId) return;

    setDownloadingId(app.id);
    setDownloadProgress(15);
    let current = 15;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 25) + 18;
      if (current >= 100) {
        clearInterval(interval);
        setDownloadProgress(100);
        setTimeout(async () => {
          setInstalledApps(prev => ({ ...prev, [app.id]: true }));
          setDownloadingId(null);
          setDownloadProgress(0);
          triggerToast(`تم تثبيت حزمة "${app.title}" بنجاح!`);
          try {
            await fetch(`/api/apps/${app.id}/download`, { method: 'POST' });
            fetchApps();
          } catch (err) {
            console.error('Download update error', err);
          }
        }, 400);
      } else {
        setDownloadProgress(current);
      }
    }, 150);
  };

  const handleUninstall = (app: AppItem) => {
    setInstalledApps(prev => {
      const next = { ...prev };
      delete next[app.id];
      return next;
    });
    triggerToast(`تمت إزالة "${app.title}" من المكتبة`);
  };

  const toggleFavorite = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = !prev[appId];
      triggerToast(next ? 'تم الحفظ في المفضلة' : 'تم الحذف من المفضلة');
      return { ...prev, [appId]: next };
    });
  };

  // Admin actions
  const openEditor = (appToEdit?: AppItem) => {
    setEditingApp(appToEdit || null);
    setIsEditorOpen(true);
  };

  const handleSaveApp = async (payload: EditorPayload) => {
    try {
      if (editingApp) {
        const res = await fetch(`/api/apps/${editingApp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resData = await res.json();
        if (resData.success) {
          triggerToast('تم تحديث بيانات التطبيق بنجاح');
          if (selectedApp?.id === editingApp.id) setSelectedApp(resData.data);
        }
      } else {
        const res = await fetch('/api/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const resData = await res.json();
        if (resData.success) triggerToast('تمت إضافة التطبيق بنجاح لقاعدة البيانات');
      }
      setIsEditorOpen(false);
      fetchApps();
      fetchAdminStats();
    } catch (err) {
      console.error('Error saving app:', err);
      triggerToast('حدث خطأ أثناء حفظ التطبيق');
    }
  };

  const handleDeleteApp = async (app: AppItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`هل أنت متأكد من حذف تطبيق "${app.title}" من المتجر وقاعدة البيانات؟`)) return;
    try {
      const res = await fetch(`/api/apps/${app.id}`, { method: 'DELETE' });
      const resData = await res.json();
      if (resData.success) {
        triggerToast(`تم حذف "${app.title}" بنجاح`);
        if (selectedApp?.id === app.id) setSelectedApp(null);
        fetchApps();
        fetchAdminStats();
      }
    } catch (err) {
      triggerToast('حدث خطأ أثناء الحذف');
    }
  };

  const handleResetDatabase = async () => {
    if (!confirm('هل تريد استعادة التطبيقات الافتراضية لقاعدة البيانات؟')) return;
    try {
      const res = await fetch('/api/admin/reset', { method: 'POST' });
      const resData = await res.json();
      if (resData.success) {
        triggerToast('تمت استعادة البيانات الافتراضية');
        fetchApps();
        fetchAdminStats();
      }
    } catch (err) {
      console.error('Failed to reset', err);
    }
  };

  const handleSubmitReview = async (author: string, comment: string, rating: number) => {
    if (!selectedApp) return;
    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/apps/${selectedApp.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName: author || 'مستخدم متجري', comment, rating }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedApp(data.data);
        triggerToast('شكراً لمراجعتك! تم التحديث بنجاح.');
        fetchApps();
      }
    } catch (err) {
      triggerToast('تعذر إرسال المراجعة');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const goToCategory = (key: string) => {
    setSelectedCategory(key);
    setPage('apps');
  };

  // Filtering & sorting
  const filteredApps = useMemo(() => {
    let list = apps;
    if (page === 'favorites') list = list.filter(a => favorites[a.id]);
    if (page === 'installed') list = list.filter(a => installedApps[a.id]);
    if (typeFilter === 'android') list = list.filter(a => a.appType === 'android_native');
    if (typeFilter === 'webview') list = list.filter(a => a.appType === 'webview');
    list = list.filter(a => (selectedCategory === 'all' || a.categoryKey === selectedCategory) && appMatches(a, searchQuery));
    return sortApps(list, sortBy);
  }, [apps, page, favorites, installedApps, typeFilter, selectedCategory, searchQuery, sortBy]);

  const featuredApps = useMemo(() => {
    const f = apps.filter(a => a.isFeatured);
    return f.length > 0 ? f : sortApps(apps, 'popular').slice(0, 3);
  }, [apps]);

  const popularApps = useMemo(() => sortApps(apps.filter(a => a.isPopular), 'popular').slice(0, 8), [apps]);
  const recentApps = useMemo(() => sortApps(apps.filter(a => a.isRecent), 'recent').slice(0, 8), [apps]);
  const topRatedApps = useMemo(() => sortApps(apps, 'rating').slice(0, 8), [apps]);

  const cardProps = (app: AppItem) => ({
    app,
    isInstalled: Boolean(installedApps[app.id]),
    isDownloading: downloadingId === app.id,
    downloadProgress,
    isFavorite: Boolean(favorites[app.id]),
    onOpen: setSelectedApp,
    onInstall: handleInstall,
    onDownloadApk: triggerApkDownload,
    onToggleFavorite: toggleFavorite,
  });

  const showFilters = page === 'apps' || page === 'favorites' || page === 'installed';

  const emptyMessages: Record<string, { title: string; hint: string }> = {
    apps: { title: 'لا توجد تطبيقات مطابقة', hint: 'جرّب تغيير الفئة أو الفلتر أو كلمة البحث.' },
    favorites: { title: 'لا توجد تطبيقات في المفضلة بعد', hint: 'اضغط على القلب في أي تطبيق لحفظه هنا.' },
    installed: { title: 'لا توجد تطبيقات مثبتة بعد', hint: 'ثبّت أي تطبيق من المتجر وسيظهر في مكتبتك هنا.' },
  };

  return (
    <div className="min-h-screen bg-[#0c0a09] text-stone-100 flex flex-col font-sans antialiased overflow-x-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[650px] h-[450px] bg-amber-600/[0.07] rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-10 w-[550px] h-[550px] bg-orange-700/[0.06] rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-rose-700/[0.05] rounded-full blur-[140px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur-2xl border border-amber-500/40 text-stone-100 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice listening overlay */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-stone-900/95 backdrop-blur-2xl border-2 border-amber-400 text-white px-6 py-5 rounded-[28px] shadow-2xl flex flex-col items-center gap-3.5 max-w-sm w-full mx-4"
          >
            <div className="flex items-center gap-3.5 w-full">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/60 flex items-center justify-center animate-pulse shrink-0">
                <Mic className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>جاري الاستماع لصوتك...</span>
                </div>
                <div className="text-[11px] text-stone-400 mt-0.5">تحدث باسم التطبيق أو الفئة باللغة العربية</div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 h-8 w-full bg-stone-950/60 rounded-xl py-1 px-3 border border-white/[0.04]">
              {[12, 26, 16, 30, 22, 10, 28, 18, 24, 14].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [6, h, 6] }}
                  transition={{ repeat: Infinity, duration: 0.5 + (i % 4) * 0.15, ease: 'easeInOut' }}
                  className="w-1 bg-gradient-to-t from-amber-400 via-orange-400 to-rose-500 rounded-full"
                />
              ))}
            </div>
            <div className="bg-stone-950 border border-amber-500/30 rounded-xl px-4 py-2.5 w-full text-center text-xs text-white font-medium min-h-[38px] flex items-center justify-center">
              {searchQuery ? `"${searchQuery}"` : 'تحدث الآن (مثال: "سباق سيارات" أو "تطبيق أذكار")...'}
            </div>
            <button onClick={() => setIsListening(false)} className="text-xs text-amber-400 hover:text-white underline font-semibold">
              إنهاء الاستماع
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <StoreHeader
        page={page}
        onNavigate={(p) => { setPage(p); if (p !== 'apps') setSelectedCategory('all'); }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearchFocused={isSearchFocused}
        setIsSearchFocused={setIsSearchFocused}
        isListening={isListening}
        onVoiceSearch={handleVoiceSearch}
        liveMatches={liveMatches}
        onOpenApp={setSelectedApp}
        installedCount={Object.keys(installedApps).length}
        favoritesCount={Object.values(favorites).filter(Boolean).length}
      />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-10">
        {page === 'admin' ? (
          <AdminPanel
            apps={apps}
            adminStats={adminStats}
            onAdd={() => openEditor()}
            onEdit={(app) => openEditor(app)}
            onDelete={handleDeleteApp}
            onReset={handleResetDatabase}
            onDownloadApk={triggerApkDownload}
            onOpenWebView={setLiveWebViewUrl}
          />
        ) : loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mx-auto" />
            <p className="text-xs text-stone-400">جاري الاتصال بقاعدة البيانات وسحب حزم التطبيقات...</p>
          </div>
        ) : (
          <>
            {page === 'home' && (
              <>
                <Hero
                  apps={featuredApps}
                  installedApps={installedApps}
                  onOpen={setSelectedApp}
                  onInstall={handleInstall}
                  onDownloadApk={triggerApkDownload}
                />
                <CategoryCards apps={apps} onSelect={goToCategory} />
                <AppRail
                  title="الأكثر تحميلاً"
                  subtitle="التطبيقات اللي بيحملها المستخدمون أكثر شيء"
                  apps={popularApps}
                  installedApps={installedApps}
                  onOpen={setSelectedApp}
                  onInstall={handleInstall}
                  onShowAll={() => { setSortBy('popular'); setPage('apps'); }}
                />
                <AppRail
                  title="وصل حديثاً"
                  subtitle="آخر الإضافات الجديدة على المتجر"
                  apps={recentApps}
                  installedApps={installedApps}
                  onOpen={setSelectedApp}
                  onInstall={handleInstall}
                  onShowAll={() => { setSortBy('recent'); setPage('apps'); }}
                />
                <AppRail
                  title="الأعلى تقييماً"
                  subtitle="اختيارات حاصلة على أعلى نجوم من المستخدمين"
                  apps={topRatedApps}
                  installedApps={installedApps}
                  onOpen={setSelectedApp}
                  onInstall={handleInstall}
                  onShowAll={() => { setSortBy('rating'); setPage('apps'); }}
                />
              </>
            )}

            {showFilters && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap shrink-0 border transition-all ${
                        selectedCategory === cat.key
                          ? 'bg-gradient-to-l from-amber-500 to-orange-600 text-white border-amber-400 shadow-lg shadow-orange-500/25'
                          : 'bg-stone-900/60 border-white/[0.06] text-stone-300 hover:text-white hover:bg-stone-800/60'
                      }`}
                    >
                      <span>{cat.emoji}</span>
                      <span>{cat.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex p-1 bg-stone-900/90 border border-white/[0.06] rounded-2xl text-xs font-semibold">
                    {([
                      { key: 'all', name: 'كل الأنواع' },
                      { key: 'android', name: 'APK أندرويد' },
                      { key: 'webview', name: 'ويب فيو' },
                    ] as { key: TypeFilter; name: string }[]).map(t => (
                      <button
                        key={t.key}
                        onClick={() => setTypeFilter(t.key)}
                        className={`px-3 py-1.5 rounded-xl transition-all ${
                          typeFilter === t.key ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {t.name}
                      </button>
                    ))}
                  </div>

                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as SortKey)}
                    className="bg-stone-900/90 border border-white/[0.08] text-stone-200 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  >
                    {SORT_OPTIONS.map(o => (
                      <option key={o.key} value={o.key}>{o.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {(page !== 'home') && (
              filteredApps.length === 0 ? (
                <div className="py-24 px-6 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-5">
                  <div className="w-20 h-20 rounded-3xl bg-stone-900 border border-white/[0.08] flex items-center justify-center shadow-xl">
                    <Inbox className="w-8 h-8 text-stone-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white font-heading">{emptyMessages[page]?.title || 'لا توجد نتائج'}</h3>
                    <p className="text-xs text-stone-400">{emptyMessages[page]?.hint}</p>
                  </div>
                  <button
                    onClick={() => { setSelectedCategory('all'); setTypeFilter('all'); setSearchQuery(''); setPage('apps'); }}
                    className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold"
                  >
                    عرض كافة التطبيقات
                  </button>
                </div>
              ) : (
                <section className="space-y-4">
                  <SectionHeader
                    title={
                      page === 'favorites' ? 'تطبيقاتك المفضلة'
                      : page === 'installed' ? 'مكتبتك المثبتة'
                      : selectedCategory === 'all' ? 'كل التطبيقات'
                      : `فئة ${CATEGORIES.find(c => c.key === selectedCategory)?.name || ''}`
                    }
                    subtitle={`${filteredApps.length} تطبيق`}
                  />
                  <AppGrid>
                    {filteredApps.map(app => <AppCard key={app.id} {...cardProps(app)} />)}
                  </AppGrid>
                </section>
              )
            )}

            {page === 'home' && (
              <section className="space-y-4">
                <SectionHeader
                  title="كل التطبيقات"
                  subtitle={`${apps.length} تطبيق في المتجر`}
                  actionLabel="تصفح بفلاتر متقدمة"
                  onAction={() => setPage('apps')}
                />
                <AppGrid>
                  {sortApps(apps, 'popular').slice(0, 6).map(app => <AppCard key={app.id} {...cardProps(app)} />)}
                </AppGrid>
              </section>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 via-orange-500 to-rose-500 flex items-center justify-center">
              <Store className="w-4 h-4 text-stone-900" />
            </div>
            <div>
              <div className="text-sm font-black text-white font-heading">مَتْجَرِي</div>
              <div className="text-[11px] text-stone-500">سوق التطبيقات العربي للأندرويد والويب فيو</div>
            </div>
          </div>
          <div className="flex items-center gap-5 text-xs text-stone-400">
            <button onClick={() => setPage('apps')} className="hover:text-amber-300 transition-colors">كل التطبيقات</button>
            <button onClick={() => setPage('favorites')} className="hover:text-amber-300 transition-colors">المفضلة</button>
            <button onClick={() => setPage('installed')} className="hover:text-amber-300 transition-colors">مكتبتي</button>
            <button onClick={() => setPage('admin')} className="hover:text-amber-300 transition-colors">لوحة الأدمن</button>
          </div>
          <div className="text-[11px] text-stone-600 font-mono">Matjari Store · 2026</div>
        </div>
      </footer>

      {/* Details modal */}
      <AnimatePresence>
        {selectedApp && (
          <AppDetailsModal
            app={selectedApp}
            allApps={apps}
            isInstalled={Boolean(installedApps[selectedApp.id])}
            isFavorite={Boolean(favorites[selectedApp.id])}
            isDownloading={downloadingId === selectedApp.id}
            downloadProgress={downloadProgress}
            isSubmittingReview={isSubmittingReview}
            onClose={() => setSelectedApp(null)}
            onOpen={setSelectedApp}
            onInstall={handleInstall}
            onUninstall={handleUninstall}
            onDownloadApk={triggerApkDownload}
            onToggleFavorite={toggleFavorite}
            onOpenWebView={setLiveWebViewUrl}
            onSubmitReview={handleSubmitReview}
          />
        )}
      </AnimatePresence>

      {/* WebView simulator */}
      <AnimatePresence>
        {liveWebViewUrl && <WebViewModal url={liveWebViewUrl} onClose={() => setLiveWebViewUrl(null)} />}
      </AnimatePresence>

      {/* Editor */}
      <AnimatePresence>
        {isEditorOpen && (
          <EditorModal
            editingApp={editingApp}
            onClose={() => setIsEditorOpen(false)}
            onSave={handleSaveApp}
            triggerToast={triggerToast}
          />
        )}
      </AnimatePresence>
    </div>
  );
      }
