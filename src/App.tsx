import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Download,
  Star,
  Check,
  Share2,
  ShieldCheck,
  X,
  Smartphone,
  Heart,
  TrendingUp,
  Clock,
  Layers,
  Wifi,
  Battery,
  Sparkles,
  Inbox,
  Play,
  RotateCcw,
  Plus,
  Edit3,
  Trash2,
  Settings,
  BarChart3,
  MessageSquare,
  Send,
  Eye,
  RefreshCw,
  LayoutGrid,
  CheckCircle2,
  ArrowRight,
  ChevronLeft,
  Globe,
  FileCode,
  UploadCloud,
  ExternalLink,
  Laptop,
  CheckCircle,
  FileCheck,
  Cpu,
  Terminal,
  ChevronRight,
  Mic,
  MicOff,
  Volume2,
  Radio
} from 'lucide-react';

// Interfaces matching server schema
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

const CATEGORIES = [
  { key: 'all', name: 'الكل', emoji: '✨' },
  { key: 'games', name: 'ألعاب', emoji: '🎮' },
  { key: 'education', name: 'تعليم', emoji: '🎓' },
  { key: 'tools', name: 'أدوات', emoji: '🛠️' },
  { key: 'social', name: 'تواصل', emoji: '💬' },
  { key: 'finance', name: 'مالية', emoji: '💳' },
] as const;

const GRADIENT_OPTIONS = [
  { label: 'أزرق كوني نيون', value: 'from-blue-500 via-indigo-600 to-cyan-500', shadow: 'rgba(59, 130, 246, 0.35)' },
  { label: 'زمردي تيتانيوم', value: 'from-emerald-400 via-teal-600 to-cyan-800', shadow: 'rgba(16, 185, 129, 0.35)' },
  { label: 'كهرماني ناري', value: 'from-amber-400 via-orange-500 to-rose-600', shadow: 'rgba(245, 158, 11, 0.35)' },
  { label: 'بنفسجي ملكي', value: 'from-violet-500 via-purple-600 to-fuchsia-600', shadow: 'rgba(139, 92, 246, 0.35)' },
  { label: 'وردي سيبراني', value: 'from-pink-500 via-rose-600 to-purple-800', shadow: 'rgba(244, 63, 94, 0.35)' },
  { label: 'كربوني داكن', value: 'from-zinc-600 via-slate-700 to-zinc-900', shadow: 'rgba(148, 163, 184, 0.25)' },
];

export default function App() {
  // Navigation & View Mode
  const [viewMode, setViewMode] = useState<'store' | 'admin'>('store');
  const [storeTab, setStoreTab] = useState<'all' | 'android' | 'webview' | 'installed'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Apps state from Backend
  const [apps, setApps] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedApp, setSelectedApp] = useState<AppItem | null>(null);
  const [liveWebViewUrl, setLiveWebViewUrl] = useState<string | null>(null);

  // Admin stats state
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);

  // App Editor Modal (Add/Edit)
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);
  const [editingApp, setEditingApp] = useState<AppItem | null>(null);
  
  // Editor Form with APK & WebView fields
  const [editorForm, setEditorForm] = useState({
    title: '',
    developer: '',
    category: 'أدوات',
    categoryKey: 'tools',
    appType: 'android_native' as 'android_native' | 'webview',
    apkFileName: '',
    packageName: '',
    webViewUrl: '',
    minAndroidVersion: 'Android 9.0 (Pie)',
    size: '25 MB',
    version: '1.0.0',
    emoji: '📱',
    gradient: GRADIENT_OPTIONS[0].value,
    shadowColor: GRADIENT_OPTIONS[0].shadow,
    shortDesc: '',
    fullDesc: '',
    featuresText: 'واجهة خفيفة وسريعة\nدعم كامل للغة العربية\nحزمة APK آمنة ومجربة'
  });

  // Local simulated APK upload status in Editor
  const [uploadedApkFile, setUploadedApkFile] = useState<File | null>(null);

  // Review submission
  const [newReviewAuthor, setNewReviewAuthor] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Local device state
  const [installedApps, setInstalledApps] = useState<Record<string, boolean>>({
    'app-1': true
  });
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Quick Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // 1. Fetch apps from Backend Database
  const fetchApps = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      if (data.success) {
        setApps(data.data);
      }
    } catch (e) {
      console.error('Error fetching apps:', e);
      triggerToast('حدث خطأ أثناء جلب التطبيقات');
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch admin stats
  const fetchAdminStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      if (data.success) {
        setAdminStats(data.data);
      }
    } catch (e) {
      console.error('Error fetching admin stats:', e);
    }
  }, []);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  useEffect(() => {
    if (viewMode === 'admin') {
      fetchAdminStats();
    }
  }, [viewMode, fetchAdminStats]);

  const POPULAR_SEARCHES = ['أذكار ونور', 'سباق صحراء', 'طقس العرب', 'محفظة ريال', 'مدرستي', 'ألعاب أندرويد', 'تواصل'];

  // Smart Live Search Matches (computed instantly as user types)
  const liveMatches = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return apps.filter(app =>
      app.title.toLowerCase().includes(q) ||
      app.developer.toLowerCase().includes(q) ||
      app.category.toLowerCase().includes(q) ||
      (app.packageName && app.packageName.toLowerCase().includes(q)) ||
      app.shortDesc.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [apps, searchQuery]);

  // Voice Search Handler with Web Speech API
  const handleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      triggerToast('عذراً، متصفحك لا يدعم التعرف الصوتي المباشر. يُرجى تجربة متصفح يدعم Web Speech API.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

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
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          triggerToast('يرجى السماح بالوصول إلى الميكروفون لاستخدام البحث بالصوت');
        } else {
          triggerToast('لم يتم التقاط الصوت بوضوح، يرجى إعادة المحاولة');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error('Error starting speech recognition:', err);
      setIsListening(false);
      triggerToast('تعذر تشغيل الميكروفون');
    }
  };

  // Real APK File Download Trigger
  const triggerApkDownload = (app: AppItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    triggerToast(`جاري تنزيل ملف APK: ${app.apkFileName || app.title + '.apk'}`);
    
    // Create an invisible anchor pointing to real download endpoint
    const downloadUrl = `/api/download/${app.id}`;
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', app.apkFileName || `${app.title}.apk`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update download count in local state
    setApps(prev => prev.map(a => a.id === app.id ? { ...a, downloadCount: (a.downloadCount || 0) + 1 } : a));
  };

  // Install Simulation
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

  // Toggle Favorite
  const toggleFavorite = (appId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = !prev[appId];
      triggerToast(next ? 'تم الحفظ في المفضلة' : 'تم الحذف من المفضلة');
      return { ...prev, [appId]: next };
    });
  };

  // Open Editor Modal (Create or Edit)
  const openEditor = (appToEdit?: AppItem) => {
    setUploadedApkFile(null);
    if (appToEdit) {
      setEditingApp(appToEdit);
      setEditorForm({
        title: appToEdit.title,
        developer: appToEdit.developer,
        category: appToEdit.category,
        categoryKey: appToEdit.categoryKey,
        appType: appToEdit.appType || 'android_native',
        apkFileName: appToEdit.apkFileName || `${appToEdit.title}.apk`,
        packageName: appToEdit.packageName || `com.matjari.${appToEdit.id}`,
        webViewUrl: appToEdit.webViewUrl || '',
        minAndroidVersion: appToEdit.minAndroidVersion || 'Android 9.0 (Pie)',
        size: appToEdit.size,
        version: appToEdit.version,
        emoji: appToEdit.emoji,
        gradient: appToEdit.gradient,
        shadowColor: appToEdit.shadowColor,
        shortDesc: appToEdit.shortDesc,
        fullDesc: appToEdit.fullDesc,
        featuresText: appToEdit.features.join('\n')
      });
    } else {
      setEditingApp(null);
      setEditorForm({
        title: '',
        developer: '',
        category: 'أدوات',
        categoryKey: 'tools',
        appType: 'android_native',
        apkFileName: '',
        packageName: 'com.developer.app',
        webViewUrl: '',
        minAndroidVersion: 'Android 9.0 (Pie)',
        size: '25 MB',
        version: '1.0.0',
        emoji: '🚀',
        gradient: GRADIENT_OPTIONS[0].value,
        shadowColor: GRADIENT_OPTIONS[0].shadow,
        shortDesc: '',
        fullDesc: '',
        featuresText: 'حزمة APK أصلية عالية الأداء\nدعم كامل للغة العربية والشاشات الحديثة\nآمن ومفحوص من الفيروسات'
      });
    }
    setIsEditorOpen(true);
  };

  // Handle local simulated APK upload
  const handleApkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedApkFile(file);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setEditorForm(prev => ({
        ...prev,
        apkFileName: file.name,
        size: sizeMb,
        title: prev.title || file.name.replace(/\.apk$/i, '').replace(/[-_]/g, ' ')
      }));
      triggerToast(`تم إرفاق ملف APK: ${file.name} (${sizeMb})`);
    }
  };

  // Save App to Backend
  const handleSaveApp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editorForm.title.trim()) {
      triggerToast('يرجى كتابة اسم التطبيق');
      return;
    }

    const safeTitle = editorForm.title.trim().replace(/\s+/g, '_');
    const autoApkName = editorForm.apkFileName.trim() || `${safeTitle}_v${editorForm.version || '1.0'}.apk`;
    const autoPackageName = editorForm.packageName.trim() || `com.matjari.${safeTitle.toLowerCase()}`;

    const payload = {
      title: editorForm.title.trim(),
      developer: editorForm.developer.trim() || 'مطور معتمد',
      category: editorForm.category,
      categoryKey: editorForm.categoryKey,
      appType: editorForm.appType,
      apkFileName: autoApkName,
      packageName: autoPackageName,
      webViewUrl: editorForm.appType === 'webview' ? (editorForm.webViewUrl.trim() || 'https://google.com') : '',
      minAndroidVersion: editorForm.minAndroidVersion,
      size: editorForm.size.trim() || '25 MB',
      version: editorForm.version.trim() || '1.0.0',
      emoji: editorForm.emoji.trim() || '📱',
      gradient: editorForm.gradient,
      shadowColor: editorForm.shadowColor,
      shortDesc: editorForm.shortDesc.trim() || 'تطبيق مميز متاح في متجري.',
      fullDesc: editorForm.fullDesc.trim() || editorForm.shortDesc.trim(),
      features: editorForm.featuresText.split('\n').filter(f => f.trim() !== '')
    };

    try {
      if (editingApp) {
        const res = await fetch(`/api/apps/${editingApp.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resData = await res.json();
        if (resData.success) {
          triggerToast('تم تحديث بيانات التطبيق بنجاح');
          if (selectedApp?.id === editingApp.id) {
            setSelectedApp(resData.data);
          }
        }
      } else {
        const res = await fetch('/api/apps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resData = await res.json();
        if (resData.success) {
          triggerToast('تمت إضافة التطبيق بنجاح لقاعدة البيانات');
        }
      }

      setIsEditorOpen(false);
      fetchApps();
      fetchAdminStats();
    } catch (err) {
      console.error('Error saving app:', err);
      triggerToast('حدث خطأ أثناء حفظ التطبيق');
    }
  };

  // Delete App
  const handleDeleteApp = async (appId: string, appTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`هل أنت متأكد من حذف تطبيق "${appTitle}" من المتجر وقاعدة البيانات؟`)) {
      return;
    }

    try {
      const res = await fetch(`/api/apps/${appId}`, { method: 'DELETE' });
      const resData = await res.json();
      if (resData.success) {
        triggerToast(`تم حذف "${appTitle}" بنجاح`);
        if (selectedApp?.id === appId) {
          setSelectedApp(null);
        }
        fetchApps();
        fetchAdminStats();
      }
    } catch (err) {
      console.error('Error deleting app:', err);
      triggerToast('حدث خطأ أثناء الحذف');
    }
  };

  // Reset to Factory Seed
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

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApp) return;
    if (!newReviewComment.trim()) {
      triggerToast('يرجى كتابة تعليق');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const res = await fetch(`/api/apps/${selectedApp.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName: newReviewAuthor.trim() || 'مستخدم متجري',
          comment: newReviewComment.trim(),
          rating: newReviewRating
        })
      });
      const data = await res.json();
      if (data.success) {
        setSelectedApp(data.data);
        setNewReviewAuthor('');
        setNewReviewComment('');
        setNewReviewRating(5);
        triggerToast('شكراً لمراجعتك! تم التحديث بنجاح.');
        fetchApps();
      }
    } catch (err) {
      console.error('Review submit failed', err);
      triggerToast('تعذر إرسال المراجعة');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Visible apps based on tab filters
  const visibleApps = useMemo(() => {
    let list = apps;

    if (storeTab === 'android') {
      list = list.filter(a => a.appType === 'android_native');
    } else if (storeTab === 'webview') {
      list = list.filter(a => a.appType === 'webview');
    } else if (storeTab === 'installed') {
      list = list.filter(a => installedApps[a.id]);
    }

    return list.filter(app => {
      const matchCat = selectedCategory === 'all' || app.categoryKey === selectedCategory;
      const matchSearch =
        searchQuery.trim() === '' ||
        app.title.includes(searchQuery) ||
        app.developer.includes(searchQuery) ||
        (app.packageName && app.packageName.includes(searchQuery)) ||
        app.shortDesc.includes(searchQuery);
      return matchCat && matchSearch;
    });
  }, [apps, storeTab, installedApps, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#07090f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 antialiased overflow-x-hidden">
      
      {/* Background Cybernetic Ambient Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-1/4 w-[650px] h-[450px] bg-cyan-600/10 rounded-full blur-[150px]" />
        <div className="absolute top-1/3 left-10 w-[550px] h-[550px] bg-indigo-600/10 rounded-full blur-[160px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px]" />
        <div 
          className="absolute inset-0 opacity-[0.025]" 
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>

      {/* Floating Animated Toast */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-2xl border border-cyan-500/40 text-slate-100 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-medium shadow-cyan-950/70"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Voice Listening Dialog */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 backdrop-blur-2xl border-2 border-cyan-400 text-white px-6 py-5 rounded-[28px] shadow-2xl shadow-cyan-950/90 flex flex-col items-center gap-3.5 max-w-sm w-full mx-4"
          >
            <div className="flex items-center gap-3.5 w-full">
              <div className="relative shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/60 flex items-center justify-center animate-pulse shadow-lg shadow-red-500/30">
                  <Mic className="w-6 h-6 text-red-400" />
                </div>
                <div className="absolute -inset-1 rounded-2xl border border-red-400 animate-ping opacity-40 pointer-events-none" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-black text-sm text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>جاري الاستماع لصوتك...</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">تحدث باسم التطبيق أو الفئة باللغة العربية</div>
              </div>
            </div>

            {/* Sound Wave Animation Visualizer */}
            <div className="flex items-center justify-center gap-1.5 h-8 w-full bg-slate-950/60 rounded-xl py-1 px-3 border border-white/[0.04]">
              {[12, 26, 16, 30, 22, 10, 28, 18, 24, 14].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [6, h, 6] }}
                  transition={{ repeat: Infinity, duration: 0.5 + (i % 4) * 0.15, ease: 'easeInOut' }}
                  className="w-1 bg-gradient-to-t from-cyan-400 via-indigo-400 to-purple-500 rounded-full"
                />
              ))}
            </div>

            {/* Live speech preview */}
            <div className="bg-slate-950 border border-cyan-500/30 rounded-xl px-4 py-2.5 w-full text-center text-xs text-white font-medium min-h-[38px] flex items-center justify-center shadow-inner">
              {searchQuery ? `"${searchQuery}"` : 'تحدث الآن (مثال: "سباق سيارات" أو "تطبيق أذكار")...'}
            </div>

            <div className="flex items-center justify-between w-full pt-1 text-xs">
              <span className="text-[10px] text-slate-500 font-mono">Web Speech API (ar-SA)</span>
              <button
                onClick={() => setIsListening(false)}
                className="text-xs text-cyan-400 hover:text-white underline font-semibold"
              >
                إنهاء الاستماع
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Top Header */}
      <header className="sticky top-0 z-40 bg-[#07090f]/80 backdrop-blur-2xl border-b border-white/[0.07] px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Platform Indicator */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('store')}
              className="cursor-pointer w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 p-0.5"
            >
              <div className="w-full h-full bg-[#07090f] rounded-[14px] flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
            </motion.div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight bg-gradient-to-l from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  مَتْجَرِي
                </span>
                <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2 py-0.5 rounded-full shadow-inner">
                  APK & WEBVIEW
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">سوق التطبيقات والويب فيو للأندرويد</span>
            </div>
          </div>

          {/* Smart Live Search Bar with Voice Input */}
          {viewMode === 'store' && (
            <div className="flex-1 max-w-lg relative hidden md:block">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 text-cyan-400 absolute right-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="ابحث بالاسم، حزمة APK، أو اضغط على الميكروفون..."
                  value={searchQuery}
                  onFocus={() => setIsSearchFocused(true)}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900/80 border border-white/[0.08] hover:border-cyan-500/50 focus:border-cyan-400 text-sm text-slate-100 placeholder-slate-500 rounded-2xl pr-10 pl-20 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500/20 shadow-inner"
                />

                {/* Left Controls: Clear + Voice Search Button */}
                <div className="absolute left-2.5 flex items-center gap-1">
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
                      title="مسح البحث"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Voice Input Microphone Button */}
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleVoiceSearch}
                    className={`p-1.5 rounded-xl border transition-all ${
                      isListening
                        ? 'bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/50 animate-pulse'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-cyan-400 border-white/[0.06] hover:border-cyan-400/50'
                    }`}
                    title="البحث الصوتي (تحدث الآن)"
                  >
                    <Mic className="w-3.5 h-3.5" />
                  </motion.button>
                </div>
              </div>

              {/* Instant Live Dropdown */}
              <AnimatePresence>
                {isSearchFocused && (
                  <>
                    {/* Backdrop to dismiss dropdown */}
                    <div
                      className="fixed inset-0 z-30 pointer-events-auto"
                      onClick={() => setIsSearchFocused(false)}
                    />

                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      className="absolute top-full mt-2 right-0 left-0 z-40 bg-slate-900/95 backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-4 shadow-2xl shadow-black/80 space-y-3"
                    >
                      {/* Case 1: Empty Query - Show Trending Searches */}
                      {!searchQuery.trim() ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold px-1">
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3 h-3 text-cyan-400" />
                              <span>عمليات البحث الشائعة والاقتراحات:</span>
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {POPULAR_SEARCHES.map((term, i) => (
                              <button
                                key={i}
                                onClick={() => {
                                  setSearchQuery(term);
                                  setIsSearchFocused(false);
                                }}
                                className="px-3 py-1.5 bg-slate-800/80 hover:bg-cyan-500/20 hover:border-cyan-500/40 border border-white/[0.06] text-slate-300 hover:text-cyan-300 text-xs rounded-xl transition-all"
                              >
                                {term}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Case 2: Live Instant Results Matching Query */
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 border-b border-white/[0.06] pb-2">
                            <span>النتائج الفورية المباشرة ({liveMatches.length})</span>
                            <span className="text-[10px] text-cyan-400">تحديث فوري أثناء الكتابة</span>
                          </div>

                          {liveMatches.length === 0 ? (
                            <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                              <div>لا توجد نتائج مطابقة لـ "{searchQuery}"</div>
                              <button
                                onClick={() => setSearchQuery('')}
                                className="text-[11px] text-cyan-400 underline"
                              >
                                مسح والبحث عن شيء آخر
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                              {liveMatches.map(matchApp => (
                                <div
                                  key={matchApp.id}
                                  onClick={() => {
                                    setSelectedApp(matchApp);
                                    setIsSearchFocused(false);
                                  }}
                                  className="group cursor-pointer p-2.5 rounded-2xl bg-slate-950/40 hover:bg-slate-800/60 border border-white/[0.04] hover:border-cyan-500/30 flex items-center justify-between gap-3 transition-all"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${matchApp.gradient} flex items-center justify-center text-xl shrink-0 shadow`}>
                                      {matchApp.emoji}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate">
                                        {matchApp.title}
                                      </div>
                                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                        <span>{matchApp.category}</span>
                                        <span>·</span>
                                        <span className="font-mono">{matchApp.size}</span>
                                        <span>·</span>
                                        <span className="text-amber-400 flex items-center gap-0.5">
                                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                                          {matchApp.rating}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {matchApp.appType === 'webview' ? (
                                      <span className="text-[9px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/60 px-2 py-0.5 rounded-md">
                                        ويب فيو
                                      </span>
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          triggerApkDownload(matchApp, e);
                                          setIsSearchFocused(false);
                                        }}
                                        className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30 flex items-center gap-1"
                                        title="تحميل APK"
                                      >
                                        <Download className="w-3 h-3" />
                                        <span>APK</span>
                                      </button>
                                    )}

                                    <button
                                      onClick={() => {
                                        setSelectedApp(matchApp);
                                        setIsSearchFocused(false);
                                      }}
                                      className="p-1.5 text-slate-400 group-hover:text-white"
                                    >
                                      <ChevronLeft className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="pt-2 border-t border-white/[0.04] text-center">
                            <button
                              onClick={() => setIsSearchFocused(false)}
                              className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300"
                            >
                              عرض النتائج في المتجر الكامل ({liveMatches.length} تطبيق) ←
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Navigation Controls: Store vs Admin Dashboard */}
          <div className="flex items-center gap-3">
            {viewMode === 'store' ? (
              <>
                {/* Store Tabs: All | Native APK | WebView | Installed */}
                <div className="hidden sm:flex p-1 bg-slate-900/90 border border-white/[0.06] rounded-2xl text-xs font-semibold">
                  <button
                    onClick={() => setStoreTab('all')}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      storeTab === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    الكل
                  </button>
                  <button
                    onClick={() => setStoreTab('android')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      storeTab === 'android' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Smartphone className="w-3 h-3 text-cyan-400" />
                    <span>APK أندرويد</span>
                  </button>
                  <button
                    onClick={() => setStoreTab('webview')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      storeTab === 'webview' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Globe className="w-3 h-3 text-purple-400" />
                    <span>ويب فيو</span>
                  </button>
                  <button
                    onClick={() => setStoreTab('installed')}
                    className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                      storeTab === 'installed' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>مثبّت</span>
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] flex items-center justify-center font-mono">
                      {Object.keys(installedApps).length}
                    </span>
                  </button>
                </div>

                {/* Admin Mode Switcher Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setViewMode('admin')}
                  className="px-4 py-2 bg-gradient-to-l from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-cyan-600/20"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>لوحة الأدمن</span>
                </motion.button>
              </>
            ) : (
              /* Back to Store */
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setViewMode('store')}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold rounded-2xl transition-all flex items-center gap-2"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>العودة لواجهة المتجر</span>
              </motion.button>
            )}
          </div>

        </div>
      </header>

      {/* Main View Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        
        {/* ===================== STORE VIEW ===================== */}
        {viewMode === 'store' && (
          <>
            {/* Mobile Smart Search with Voice Input */}
            <div className="relative md:hidden">
              <Search className="w-4 h-4 text-cyan-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="ابحث بالاسم، الفئة، أو اضغط الميكروفون..."
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-white/[0.08] text-sm text-white placeholder-slate-500 rounded-2xl pr-10 pl-20 py-2.5 focus:outline-none focus:border-cyan-400"
              />
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="p-1 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={handleVoiceSearch}
                  className={`p-1.5 rounded-xl border ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-cyan-400 border-white/[0.06]'}`}
                  title="البحث الصوتي"
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
              {CATEGORIES.map(cat => {
                const isActive = selectedCategory === cat.key;
                return (
                  <motion.button
                    key={cat.key}
                    whileHover={{ y: -1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap shrink-0 border ${
                      isActive
                        ? 'bg-gradient-to-l from-cyan-500 via-indigo-600 to-purple-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/25 scale-[1.02]'
                        : 'bg-slate-900/60 border-white/[0.06] text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Mobile Tab Filter Bar */}
            <div className="flex sm:hidden p-1 bg-slate-900/90 border border-white/[0.06] rounded-2xl text-xs font-semibold overflow-x-auto">
              <button
                onClick={() => setStoreTab('all')}
                className={`px-3 py-1.5 rounded-xl ${storeTab === 'all' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
              >
                الكل
              </button>
              <button
                onClick={() => setStoreTab('android')}
                className={`px-3 py-1.5 rounded-xl ${storeTab === 'android' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
              >
                APK أندرويد
              </button>
              <button
                onClick={() => setStoreTab('webview')}
                className={`px-3 py-1.5 rounded-xl ${storeTab === 'webview' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
              >
                ويب فيو
              </button>
              <button
                onClick={() => setStoreTab('installed')}
                className={`px-3 py-1.5 rounded-xl ${storeTab === 'installed' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400'}`}
              >
                المثبتة ({Object.keys(installedApps).length})
              </button>
            </div>

            {/* Loading Indicator */}
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
                <p className="text-xs text-slate-400">جاري الاتصال بقاعدة البيانات وسحب حزم التطبيقات...</p>
              </div>
            ) : visibleApps.length === 0 ? (
              /* Empty Results */
              <div className="py-24 px-6 text-center max-w-lg mx-auto flex flex-col items-center justify-center space-y-5">
                <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-white/[0.08] flex items-center justify-center shadow-xl">
                  <Inbox className="w-8 h-8 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white">لا توجد تطبيقات في هذا التصنيف</h3>
                  <p className="text-xs text-slate-400">
                    يمكنك إضافة تطبيقات جديدة من نوع APK أو WebView عبر لوحة الأدمن.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setStoreTab('all');
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold"
                >
                  عرض كافة التطبيقات
                </button>
              </div>
            ) : (
              /* Bento Apps Grid */
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: { opacity: 1, transition: { staggerChildren: 0.04 } }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {visibleApps.map(app => {
                  const isInstalled = Boolean(installedApps[app.id]);
                  const isDownloading = downloadingId === app.id;
                  const isFavorite = Boolean(favorites[app.id]);
                  const isWebView = app.appType === 'webview';

                  return (
                    <motion.div
                      key={app.id}
                      variants={{
                        hidden: { opacity: 0, y: 15 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      whileHover={{ y: -4 }}
                      onClick={() => setSelectedApp(app)}
                      className="group relative cursor-pointer bg-slate-900/50 hover:bg-slate-900/90 backdrop-blur-xl border border-white/[0.06] hover:border-cyan-500/40 rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between shadow-2xl shadow-black/40 hover:shadow-cyan-950/30"
                    >
                      <div>
                        {/* Top App Header & Badges */}
                        <div className="flex items-start justify-between gap-3 mb-3">
                          {/* App Architecture Badge */}
                          <div className="flex items-center gap-1.5">
                            {isWebView ? (
                              <span className="text-[10px] font-bold text-purple-300 bg-purple-950/80 border border-purple-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Globe className="w-2.5 h-2.5" />
                                <span>ويب فيو WebView</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                                <Smartphone className="w-2.5 h-2.5" />
                                <span>حزمة APK أندرويد</span>
                              </span>
                            )}
                            <span className="text-[10px] text-slate-500 font-mono">v{app.version}</span>
                          </div>

                          {/* Favorite button */}
                          <motion.button
                            whileTap={{ scale: 0.85 }}
                            onClick={(e) => toggleFavorite(app.id, e)}
                            className={`p-1.5 rounded-xl border transition-all ${
                              isFavorite
                                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                : 'bg-slate-800/40 border-white/[0.04] text-slate-500 hover:text-rose-400'
                            }`}
                            title="حفظ في المفضلة"
                          >
                            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-400' : ''}`} />
                          </motion.button>
                        </div>

                        {/* App Icon + Title */}
                        <div className="flex items-start gap-4">
                          <div
                            className="w-16 h-16 rounded-[22px] flex items-center justify-center text-3xl shadow-lg relative shrink-0 transition-transform duration-300 group-hover:scale-105"
                            style={{
                              background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                              boxShadow: `0 8px 24px -4px ${app.shadowColor}`
                            }}
                          >
                            <div className={`w-full h-full rounded-[22px] bg-gradient-to-tr ${app.gradient} flex items-center justify-center`}>
                              {app.emoji}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                              {app.title}
                            </h4>
                            <p className="text-xs text-slate-400 truncate mt-0.5">{app.developer}</p>
                            <div className="text-[11px] text-slate-500 font-mono truncate mt-1">
                              {app.packageName || `com.matjari.${app.id}`}
                            </div>
                          </div>
                        </div>

                        {/* Short Description */}
                        <p className="mt-4 text-xs text-slate-400 leading-relaxed line-clamp-2">
                          {app.shortDesc}
                        </p>
                      </div>

                      {/* Card Footer: Download APK Button & Quick Actions */}
                      <div className="mt-5 pt-3.5 border-t border-white/[0.04] flex items-center justify-between gap-2">
                        
                        <div className="flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1 font-bold text-slate-200">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span>{app.rating}</span>
                          </div>
                          <span className="text-slate-600">·</span>
                          <span className="text-slate-400 text-[11px]">{app.size}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Real APK Download Trigger */}
                          <motion.button
                            whileTap={{ scale: 0.92 }}
                            onClick={(e) => triggerApkDownload(app, e)}
                            className="p-2 bg-slate-800/80 hover:bg-slate-700/80 border border-white/[0.08] text-cyan-300 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                            title={`تحميل ملف ${app.apkFileName || 'APK'}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span className="text-[11px]">APK</span>
                          </motion.button>

                          {/* In-Store Install / Launch Button */}
                          {isDownloading ? (
                            <div className="flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-300">
                              <div className="w-3 h-3 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
                              <span>{downloadProgress}%</span>
                            </div>
                          ) : isInstalled ? (
                            <motion.button
                              whileTap={{ scale: 0.92 }}
                              onClick={(e) => handleInstall(app, e)}
                              className="px-3.5 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
                            >
                              <Play className="w-3 h-3 fill-emerald-400" />
                              <span>{isWebView ? 'فتح الويب' : 'تشغيل'}</span>
                            </motion.button>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.04 }}
                              whileTap={{ scale: 0.92 }}
                              onClick={(e) => handleInstall(app, e)}
                              className="px-3.5 py-1.5 bg-gradient-to-l from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-cyan-600/20"
                            >
                              <span>تثبيت</span>
                            </motion.button>
                          )}
                        </div>

                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </>
        )}

        {/* ===================== ADMIN DASHBOARD ===================== */}
        {viewMode === 'admin' && (
          <div className="space-y-8">
            
            {/* Admin Header Strip */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 shadow-xl">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-1 rounded-full mb-2">
                  <Terminal className="w-3.5 h-3.5" />
                  <span>لوحة إدارة التطبيقات وحزم APK والويب فيو</span>
                </div>
                <h2 className="text-xl font-black text-white">إدارة التطبيقات وقاعدة البيانات</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  أضف تطبيقات أندرويد حقيقية مع ملفات APK الخاصة بها، أو أنشئ تطبيقات ويب فيو (WebView) مرتبطة بمواقع الويب.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => openEditor()}
                  className="px-5 py-3 bg-gradient-to-l from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-cyan-600/30 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة تطبيق أو APK جديد</span>
                </motion.button>

                <motion.button
                  whileTap={{ scale: 0.96 }}
                  onClick={handleResetDatabase}
                  className="px-3.5 py-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-2xl text-xs font-medium transition-colors border border-white/[0.06] flex items-center gap-1.5"
                  title="استعادة المصنع"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">إعادة ضبط</span>
                </motion.button>
              </div>
            </div>

            {/* Admin Stats */}
            {adminStats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-5 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>إجمالي التطبيقات</span>
                    <Layers className="w-4 h-4 text-cyan-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{adminStats.totalApps}</div>
                  <div className="text-[10px] text-cyan-400 font-medium">حزم APK وتطبيقات ويب فيو</div>
                </div>

                <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-5 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>إجمالي التنزيلات</span>
                    <Download className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white">{adminStats.totalDownloads.toLocaleString('ar-SA')}</div>
                  <div className="text-[10px] text-indigo-400 font-medium">عملية تنزيل حقيقية مسجلة</div>
                </div>

                <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-5 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>تطبيقات أندرويد APK</span>
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {apps.filter(a => a.appType === 'android_native').length}
                  </div>
                  <div className="text-[10px] text-slate-400">حزم Native APK</div>
                </div>

                <div className="bg-slate-900/50 border border-white/[0.06] rounded-2xl p-5 space-y-1">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>تطبيقات ويب فيو</span>
                    <Globe className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-purple-400">
                    {apps.filter(a => a.appType === 'webview').length}
                  </div>
                  <div className="text-[10px] text-slate-400">WebView / PWA</div>
                </div>
              </div>
            )}

            {/* Apps Management Table with APK Details */}
            <div className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">إدارة الحزم وتطبيقات المتجر ({apps.length})</h3>
                  <p className="text-[11px] text-slate-400">تحميل مباشر لملفات APK ومراجعة روابط الويب فيو</p>
                </div>
                <span className="text-xs text-cyan-400 font-mono bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
                  محدث لحظياً
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-950/70 text-slate-400 border-b border-white/[0.04]">
                    <tr>
                      <th className="py-3.5 px-6 font-semibold">التطبيق</th>
                      <th className="py-3.5 px-4 font-semibold">النوع (Architecture)</th>
                      <th className="py-3.5 px-4 font-semibold">اسم الحزمة (Package)</th>
                      <th className="py-3.5 px-4 font-semibold">ملف الـ APK</th>
                      <th className="py-3.5 px-4 font-semibold">الحجم</th>
                      <th className="py-3.5 px-4 font-semibold">التنزيلات</th>
                      <th className="py-3.5 px-6 font-semibold text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {apps.map(app => (
                      <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-lg shrink-0 shadow-sm`}>
                              {app.emoji}
                            </div>
                            <div>
                              <div className="font-bold text-white">{app.title}</div>
                              <div className="text-[11px] text-slate-400">{app.developer}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {app.appType === 'webview' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800/50 px-2 py-0.5 rounded-md">
                              <Globe className="w-3 h-3" />
                              <span>ويب فيو</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded-md">
                              <Smartphone className="w-3 h-3" />
                              <span>أندرويد APK</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                          {app.packageName || `com.matjari.${app.id}`}
                        </td>

                        <td className="py-3.5 px-4">
                          <button
                            onClick={(e) => triggerApkDownload(app, e)}
                            className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] underline"
                            title="تنزيل الـ APK الآن"
                          >
                            <FileCode className="w-3 h-3" />
                            <span>{app.apkFileName || `${app.id}.apk`}</span>
                          </button>
                        </td>

                        <td className="py-3.5 px-4 text-slate-400">{app.size}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{app.downloads}</td>

                        <td className="py-3.5 px-6 text-left">
                          <div className="flex items-center justify-end gap-2">
                            {app.appType === 'webview' && app.webViewUrl && (
                              <button
                                onClick={() => setLiveWebViewUrl(app.webViewUrl || null)}
                                className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 transition-colors"
                                title="معاينة الويب فيو"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => openEditor(app)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                              title="تعديل التطبيق"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDeleteApp(app.id, app.title, e)}
                              className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              title="حذف التطبيق"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Logs */}
            {adminStats && adminStats.logs.length > 0 && (
              <div className="bg-slate-900/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 space-y-3">
                <h3 className="font-bold text-sm text-white">سجل العمليات الأخير (Database Activity Log)</h3>
                <div className="space-y-2">
                  {adminStats.logs.map(log => (
                    <div key={log.id} className="flex items-center justify-between text-xs py-2 border-b border-white/[0.04] last:border-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-slate-300">{log.action}</span>
                        <span className="text-indigo-400 font-medium">({log.appTitle})</span>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('ar-SA')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* ===================== APP DETAILS MODAL ===================== */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedApp(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-3xl bg-slate-900 border border-white/[0.1] rounded-[32px] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
              
              {/* Modal Top Bar */}
              <div className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl border-b border-white/[0.06] px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {selectedApp.appType === 'webview' ? (
                    <span className="text-xs font-bold text-purple-300 bg-purple-950/80 border border-purple-800/60 px-3 py-1 rounded-full flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      <span>ويب فيو WebView</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-800/60 px-3 py-1 rounded-full flex items-center gap-1">
                      <Smartphone className="w-3 h-3" />
                      <span>أندرويد APK أصلي</span>
                    </span>
                  )}
                  <span className="text-xs text-slate-400">الإصدار {selectedApp.version}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => toggleFavorite(selectedApp.id, e)}
                    className={`p-2 rounded-xl border transition-colors ${
                      favorites[selectedApp.id]
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                        : 'bg-slate-800 border-white/[0.06] text-slate-400 hover:text-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites[selectedApp.id] ? 'fill-rose-400' : ''}`} />
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedApp(null)}
                    className="p-2 rounded-xl bg-slate-800 border border-white/[0.06] text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="overflow-y-auto p-6 sm:p-8 space-y-7">
                
                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div
                    className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[26px] bg-gradient-to-tr ${selectedApp.gradient} flex items-center justify-center text-4xl shadow-2xl shrink-0`}
                    style={{ boxShadow: `0 12px 36px -6px ${selectedApp.shadowColor}` }}
                  >
                    {selectedApp.emoji}
                  </div>

                  <div className="flex-1 space-y-1">
                    <h2 className="text-2xl sm:text-3xl font-black text-white">{selectedApp.title}</h2>
                    <p className="text-sm font-semibold text-cyan-400">{selectedApp.developer}</p>
                    <div className="text-xs text-slate-400 font-mono pt-1">
                      الحزمة: {selectedApp.packageName || `com.matjari.${selectedApp.id}`}
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-4 gap-2 bg-slate-950/70 border border-white/[0.06] rounded-2xl p-4 text-center">
                  <div>
                    <div className="text-xs text-slate-400">التقييم</div>
                    <div className="flex items-center justify-center gap-1 text-sm font-bold text-amber-400 mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{selectedApp.rating}</span>
                    </div>
                  </div>
                  <div className="border-r border-l border-white/[0.06]">
                    <div className="text-xs text-slate-400">حجم APK</div>
                    <div className="text-sm font-bold text-white mt-0.5">{selectedApp.size}</div>
                  </div>
                  <div className="border-l border-white/[0.06]">
                    <div className="text-xs text-slate-400">النظام الأدنى</div>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">{selectedApp.minAndroidVersion || 'Android 8+'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">النوع</div>
                    <div className="text-sm font-bold text-purple-300 mt-0.5">
                      {selectedApp.appType === 'webview' ? 'ويب فيو' : 'أندرويد أصلي'}
                    </div>
                  </div>
                </div>

                {/* Primary Dual Action Buttons (Real APK Download + In-Store Install) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Button 1: Download actual APK file to user's device */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => triggerApkDownload(selectedApp, e)}
                    className="py-3.5 px-5 bg-gradient-to-l from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-sm rounded-2xl transition-all shadow-xl shadow-cyan-600/30 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>تحميل ملف APK المباشر ({selectedApp.size})</span>
                  </motion.button>

                  {/* Button 2: WebView preview OR In-store install */}
                  {selectedApp.appType === 'webview' && selectedApp.webViewUrl ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setLiveWebViewUrl(selectedApp.webViewUrl || null)}
                      className="py-3.5 px-5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/40 text-purple-300 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>تشغيل تجربة الويب فيو الحية</span>
                    </motion.button>
                  ) : installedApps[selectedApp.id] ? (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInstall(selectedApp)}
                      className="py-3.5 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>تشغيل التطبيق المثبت</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInstall(selectedApp)}
                      className="py-3.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/[0.08] font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>تثبيت في المتجر</span>
                    </motion.button>
                  )}
                </div>

                {/* About & Package Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">تفاصيل الحزمة والبرنامج</h3>
                  <div className="bg-slate-950/60 border border-white/[0.06] rounded-2xl p-4 text-xs font-mono space-y-1.5 text-slate-300">
                    <div><span className="text-slate-500">اسم الحزمة:</span> {selectedApp.packageName || `com.matjari.${selectedApp.id}`}</div>
                    <div><span className="text-slate-500">ملف الـ APK:</span> {selectedApp.apkFileName || `${selectedApp.title}.apk`}</div>
                    {selectedApp.appType === 'webview' && (
                      <div><span className="text-slate-500">رابط الويب فيو:</span> <a href={selectedApp.webViewUrl} target="_blank" rel="noreferrer" className="text-cyan-400 underline">{selectedApp.webViewUrl}</a></div>
                    )}
                    <div><span className="text-slate-500">الحد الأدنى للنظام:</span> {selectedApp.minAndroidVersion || 'Android 8.0+'}</div>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white">الوصف</h3>
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {selectedApp.fullDesc}
                  </p>
                </div>

                {/* Reviews */}
                <div className="space-y-4 pt-4 border-t border-white/[0.06]">
                  <h3 className="text-sm font-bold text-white">
                    مراجعات المستخدمين ({selectedApp.reviews?.length || 0})
                  </h3>

                  {/* Add Review */}
                  <form onSubmit={handleSubmitReview} className="bg-slate-950/60 border border-white/[0.06] rounded-2xl p-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="اسمك الكريم..."
                        value={newReviewAuthor}
                        onChange={e => setNewReviewAuthor(e.target.value)}
                        className="bg-slate-900 border border-white/[0.06] rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                      />
                      <div className="flex items-center gap-2 bg-slate-900 border border-white/[0.06] rounded-xl px-3 py-2">
                        <span className="text-slate-400">التقييم:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReviewRating(star)}
                            >
                              <Star
                                className={`w-4 h-4 ${
                                  star <= newReviewRating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <textarea
                      rows={2}
                      placeholder="اكتب تجربتك مع حزمة هذا التطبيق..."
                      value={newReviewComment}
                      onChange={e => setNewReviewComment(e.target.value)}
                      className="w-full bg-slate-900 border border-white/[0.06] rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />

                    <div className="flex justify-end">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        disabled={isSubmittingReview}
                        type="submit"
                        className="px-5 py-2 bg-gradient-to-l from-cyan-600 to-indigo-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{isSubmittingReview ? 'جاري الإرسال...' : 'إرسال المراجعة'}</span>
                      </motion.button>
                    </div>
                  </form>

                  {/* Review List */}
                  <div className="space-y-2">
                    {selectedApp.reviews?.map(rev => (
                      <div key={rev.id} className="bg-slate-950/40 border border-white/[0.04] p-3 rounded-xl space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white">{rev.userName}</span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-300">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== LIVE WEBVIEW SIMULATOR MODAL ===================== */}
      <AnimatePresence>
        {liveWebViewUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLiveWebViewUrl(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-4xl h-[85vh] bg-slate-950 border border-purple-500/40 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Browser/WebView Navigation Bar */}
              <div className="bg-slate-900 px-5 py-3 border-b border-white/[0.06] flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="font-bold text-slate-300 mr-2 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-purple-400" />
                    <span>محاكي بيئة الويب فيو (Android WebView)</span>
                  </span>
                </div>

                <div className="flex-1 max-w-md bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-1 font-mono text-[11px] text-slate-400 truncate text-left">
                  {liveWebViewUrl}
                </div>

                <button
                  onClick={() => setLiveWebViewUrl(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* In-App Browser Frame */}
              <div className="flex-1 w-full bg-slate-900 relative">
                <iframe
                  src={liveWebViewUrl}
                  title="WebView Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===================== APP EDITOR MODAL (ADD / EDIT APK) ===================== */}
      <AnimatePresence>
        {isEditorOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditorOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 28 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/[0.1] rounded-[32px] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
              
              {/* Editor Header */}
              <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white">
                    {editingApp ? `تعديل التطبيق: ${editingApp.title}` : 'إضافة تطبيق جديد (APK أو WebView)'}
                  </h3>
                  <p className="text-[11px] text-slate-400">حدد نوع التطبيق وأرفق ملف الـ APK أو عنوان الويب</p>
                </div>
                <button
                  onClick={() => setIsEditorOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveApp} className="p-6 overflow-y-auto space-y-5 text-xs">
                
                {/* 1. App Architecture / Type Selector (أندرويد أصلي VS ويب فيو) */}
                <div className="space-y-2">
                  <label className="font-bold text-white flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span>نوع بيئة تشغيل التطبيق *</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditorForm({ ...editorForm, appType: 'android_native' })}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                        editorForm.appType === 'android_native'
                          ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-lg shadow-cyan-950/50'
                          : 'bg-slate-950/60 border-white/[0.06] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Smartphone className={`w-5 h-5 mt-0.5 ${editorForm.appType === 'android_native' ? 'text-cyan-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="font-bold text-xs text-white">تطبيق أندرويد أصلي (Native APK)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">حزمة ملف .apk مستقلة تعمل على أجهزة أندرويد</div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditorForm({ ...editorForm, appType: 'webview' })}
                      className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                        editorForm.appType === 'webview'
                          ? 'bg-purple-950/50 border-purple-400 text-white shadow-lg shadow-purple-950/50'
                          : 'bg-slate-950/60 border-white/[0.06] text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Globe className={`w-5 h-5 mt-0.5 ${editorForm.appType === 'webview' ? 'text-purple-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="font-bold text-xs text-white">تطبيق ويب فيو (WebView / PWA)</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">تطبيق يعتمد على موقع ويب داخل إطار أندرويد</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. APK Upload Zone */}
                <div className="bg-slate-950/80 border border-dashed border-cyan-500/40 rounded-2xl p-4 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <label htmlFor="apk-upload-input" className="cursor-pointer text-xs font-bold text-cyan-400 hover:text-cyan-300 underline">
                      اضغط هنا لرفع ملف APK التطبيق
                    </label>
                    <input
                      id="apk-upload-input"
                      type="file"
                      accept=".apk"
                      onChange={handleApkFileSelect}
                      className="hidden"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">يدعم حزم APK الموقعة (Signed Android Package)</p>
                  </div>

                  {editorForm.apkFileName && (
                    <div className="inline-flex items-center gap-2 bg-cyan-950/60 border border-cyan-800/60 px-3 py-1.5 rounded-xl text-xs text-cyan-300 font-mono">
                      <FileCheck className="w-4 h-4 text-emerald-400" />
                      <span>{editorForm.apkFileName}</span>
                      <span className="text-[10px] text-slate-400">({editorForm.size})</span>
                    </div>
                  )}
                </div>

                {/* 3. If WebView: Show Target Website URL */}
                {editorForm.appType === 'webview' && (
                  <div className="space-y-1 bg-purple-950/20 border border-purple-500/30 rounded-2xl p-3.5">
                    <label className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-purple-400" />
                      <span>رابط موقع الويب المستهدف (Target WebView URL) *</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com"
                      value={editorForm.webViewUrl}
                      onChange={e => setEditorForm({ ...editorForm, webViewUrl: e.target.value })}
                      className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-400 font-mono text-left"
                    />
                  </div>
                )}

                {/* 4. Title, Developer & Package Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">اسم التطبيق *</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: تطبيق أذكار ونور"
                      value={editorForm.title}
                      onChange={e => setEditorForm({ ...editorForm, title: e.target.value })}
                      className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">اسم الحزمة (Package Name)</label>
                    <input
                      type="text"
                      placeholder="com.company.app"
                      value={editorForm.packageName}
                      onChange={e => setEditorForm({ ...editorForm, packageName: e.target.value })}
                      className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-mono text-left"
                    />
                  </div>
                </div>

                {/* 5. Category & Version & Min Android */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">الفئة</label>
                    <select
                      value={editorForm.categoryKey}
                      onChange={e => {
                        const key = e.target.value;
                        const found = CATEGORIES.find(c => c.key === key);
                        setEditorForm({
                          ...editorForm,
                          categoryKey: key,
                          category: found?.name || 'أدوات'
                        });
                      }}
                      className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    >
                      <option value="tools">أدوات</option>
                      <option value="games">ألعاب</option>
                      <option value="education">تعليم</option>
                      <option value="social">تواصل</option>
                      <option value="finance">مالية</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">الإصدار</label>
                    <input
                      type="text"
                      placeholder="1.0.0"
                      value={editorForm.version}
                      onChange={e => setEditorForm({ ...editorForm, version: e.target.value })}
                      className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white text-center font-mono focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-300">الأيقونة (إيموجي)</label>
                    <input
                      type="text"
                      placeholder="📱"
                      value={editorForm.emoji}
                      onChange={e => setEditorForm({ ...editorForm, emoji: e.target.value })}
                      className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white text-center text-base focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* 6. Gradient Themes */}
                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-300">تدرج لون أيقونة التطبيق</label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {GRADIENT_OPTIONS.map((g, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditorForm({ ...editorForm, gradient: g.value, shadowColor: g.shadow })}
                        className={`h-9 rounded-xl bg-gradient-to-tr ${g.value} transition-all border-2 ${
                          editorForm.gradient === g.value ? 'border-cyan-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        title={g.label}
                      />
                    ))}
                  </div>
                </div>

                {/* 7. Short Description */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">الوصف الموجز</label>
                  <input
                    type="text"
                    placeholder="نبذة سريعة عن التطبيق..."
                    value={editorForm.shortDesc}
                    onChange={e => setEditorForm({ ...editorForm, shortDesc: e.target.value })}
                    className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* 8. Full Description */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">الوصف الكامل</label>
                  <textarea
                    rows={3}
                    placeholder="شرح كامل لمميزات التطبيق..."
                    value={editorForm.fullDesc}
                    onChange={e => setEditorForm({ ...editorForm, fullDesc: e.target.value })}
                    className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* 9. Features List */}
                <div className="space-y-1">
                  <label className="font-semibold text-slate-300">الميزات الرئيسية (ميزة في كل سطر)</label>
                  <textarea
                    rows={2}
                    value={editorForm.featuresText}
                    onChange={e => setEditorForm({ ...editorForm, featuresText: e.target.value })}
                    className="w-full bg-slate-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>

                {/* Submit Action */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditorOpen(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium"
                  >
                    إلغاء
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-6 py-2.5 bg-gradient-to-l from-cyan-600 via-indigo-600 to-purple-600 hover:from-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-600/30"
                  >
                    {editingApp ? 'حفظ التعديلات' : 'إضافة وحفظ التطبيق'}
                  </motion.button>
                </div>

              </form>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
