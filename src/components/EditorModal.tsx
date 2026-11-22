import { useState } from 'react';
import { motion } from 'motion/react';
import { X, Smartphone, Globe, Cpu, UploadCloud, FileCheck } from 'lucide-react';
import { AppItem, GRADIENT_OPTIONS, EDITABLE_CATEGORIES } from '../types';

export interface EditorPayload {
  title: string;
  developer: string;
  category: string;
  categoryKey: string;
  appType: 'android_native' | 'webview';
  apkFileName: string;
  packageName: string;
  webViewUrl: string;
  minAndroidVersion: string;
  size: string;
  version: string;
  emoji: string;
  gradient: string;
  shadowColor: string;
  shortDesc: string;
  fullDesc: string;
  features: string[];
}

interface EditorProps {
  editingApp: AppItem | null;
  onClose: () => void;
  onSave: (payload: EditorPayload) => void;
  triggerToast: (msg: string) => void;
}

const DEFAULT_FEATURES = 'واجهة خفيفة وسريعة\nدعم كامل للغة العربية\nحزمة آمنة ومفحوصة';

export function EditorModal({ editingApp, onClose, onSave, triggerToast }: EditorProps) {
  const [form, setForm] = useState(() => editingApp ? {
    title: editingApp.title,
    developer: editingApp.developer,
    category: editingApp.category,
    categoryKey: editingApp.categoryKey,
    appType: editingApp.appType || 'android_native' as const,
    apkFileName: editingApp.apkFileName || `${editingApp.title}.apk`,
    packageName: editingApp.packageName || `com.matjari.${editingApp.id}`,
    webViewUrl: editingApp.webViewUrl || '',
    minAndroidVersion: editingApp.minAndroidVersion || 'Android 9.0 (Pie)',
    size: editingApp.size,
    version: editingApp.version,
    emoji: editingApp.emoji,
    gradient: editingApp.gradient,
    shadowColor: editingApp.shadowColor,
    shortDesc: editingApp.shortDesc,
    fullDesc: editingApp.fullDesc,
    featuresText: editingApp.features.join('\n'),
  } : {
    title: '',
    developer: '',
    category: 'أدوات',
    categoryKey: 'tools',
    appType: 'android_native' as const,
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
    featuresText: DEFAULT_FEATURES,
  });

  const handleApkFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      setForm(prev => ({
        ...prev,
        apkFileName: file.name,
        size: sizeMb,
        title: prev.title || file.name.replace(/\.apk$/i, '').replace(/[-_]/g, ' '),
      }));
      triggerToast(`تم إرفاق ملف APK: ${file.name} (${sizeMb})`);
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      triggerToast('يرجى كتابة اسم التطبيق');
      return;
    }
    const safeTitle = form.title.trim().replace(/\s+/g, '_');
    onSave({
      title: form.title.trim(),
      developer: form.developer.trim() || 'مطور معتمد',
      category: form.category,
      categoryKey: form.categoryKey,
      appType: form.appType,
      apkFileName: form.apkFileName.trim() || `${safeTitle}_v${form.version || '1.0'}.apk`,
      packageName: form.packageName.trim() || `com.matjari.${safeTitle.toLowerCase()}`,
      webViewUrl: form.appType === 'webview' ? (form.webViewUrl.trim() || 'https://google.com') : '',
      minAndroidVersion: form.minAndroidVersion,
      size: form.size.trim() || '25 MB',
      version: form.version.trim() || '1.0.0',
      emoji: form.emoji.trim() || '📱',
      gradient: form.gradient,
      shadowColor: form.shadowColor,
      shortDesc: form.shortDesc.trim() || 'تطبيق مميز متاح في متجري.',
      fullDesc: form.fullDesc.trim() || form.shortDesc.trim(),
      features: form.featuresText.split('\n').filter(f => f.trim() !== ''),
    });
  };

  const inputCls = 'w-full bg-stone-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500';

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
        className="relative w-full max-w-2xl bg-stone-900 border border-white/[0.1] rounded-[32px] shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-white font-heading">
              {editingApp ? `تعديل التطبيق: ${editingApp.title}` : 'إضافة تطبيق جديد (APK أو WebView)'}
            </h3>
            <p className="text-[11px] text-stone-400">حدد نوع التطبيق وأرفق ملف الـ APK أو عنوان الويب</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* App type selector */}
          <div className="space-y-2">
            <label className="font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>نوع بيئة تشغيل التطبيق *</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, appType: 'android_native' })}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                  form.appType === 'android_native'
                    ? 'bg-amber-950/50 border-amber-400 text-white shadow-lg shadow-amber-950/50'
                    : 'bg-stone-950/60 border-white/[0.06] text-stone-400 hover:border-stone-700'
                }`}
              >
                <Smartphone className={`w-5 h-5 mt-0.5 ${form.appType === 'android_native' ? 'text-amber-400' : 'text-stone-500'}`} />
                <div>
                  <div className="font-bold text-xs text-white">تطبيق أندرويد أصلي (Native APK)</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">حزمة ملف .apk مستقلة تعمل على أجهزة أندرويد</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, appType: 'webview' })}
                className={`p-3.5 rounded-2xl border text-right transition-all flex items-start gap-3 ${
                  form.appType === 'webview'
                    ? 'bg-violet-950/50 border-violet-400 text-white shadow-lg shadow-violet-950/50'
                    : 'bg-stone-950/60 border-white/[0.06] text-stone-400 hover:border-stone-700'
                }`}
              >
                <Globe className={`w-5 h-5 mt-0.5 ${form.appType === 'webview' ? 'text-violet-400' : 'text-stone-500'}`} />
                <div>
                  <div className="font-bold text-xs text-white">تطبيق ويب فيو (WebView / PWA)</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">تطبيق يعتمد على موقع ويب داخل إطار أندرويد</div>
                </div>
              </button>
            </div>
          </div>

          {/* APK upload zone */}
          <div className="bg-stone-950/80 border border-dashed border-amber-500/40 rounded-2xl p-4 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <label htmlFor="apk-upload-input" className="cursor-pointer text-xs font-bold text-amber-400 hover:text-amber-300 underline">
                اضغط هنا لرفع ملف APK التطبيق
              </label>
              <input id="apk-upload-input" type="file" accept=".apk" onChange={handleApkFileSelect} className="hidden" />
              <p className="text-[10px] text-stone-500 mt-1">يدعم حزم APK الموقعة (Signed Android Package)</p>
            </div>
            {form.apkFileName && (
              <div className="inline-flex items-center gap-2 bg-amber-950/60 border border-amber-800/60 px-3 py-1.5 rounded-xl text-xs text-amber-300 font-mono">
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>{form.apkFileName}</span>
                <span className="text-[10px] text-stone-400">({form.size})</span>
              </div>
            )}
          </div>

          {/* WebView URL */}
          {form.appType === 'webview' && (
            <div className="space-y-1 bg-violet-950/20 border border-violet-500/30 rounded-2xl p-3.5">
              <label className="font-bold text-violet-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-violet-400" />
                <span>رابط موقع الويب المستهدف (Target WebView URL) *</span>
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={form.webViewUrl}
                onChange={e => setForm({ ...form, webViewUrl: e.target.value })}
                className={`${inputCls} font-mono text-left`}
              />
            </div>
          )}

          {/* Title & package */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-300">اسم التطبيق *</label>
              <input type="text" required placeholder="مثال: تطبيق أذكار ونور" value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })} className={inputCls} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-300">اسم الحزمة (Package Name)</label>
              <input type="text" placeholder="com.company.app" value={form.packageName}
                onChange={e => setForm({ ...form, packageName: e.target.value })} className={`${inputCls} font-mono text-left`} />
            </div>
          </div>

          {/* Developer */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-300">اسم المطور</label>
            <input type="text" placeholder="مثال: استوديو التقنية الحديثة" value={form.developer}
              onChange={e => setForm({ ...form, developer: e.target.value })} className={inputCls} />
          </div>

          {/* Category, version, emoji */}
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-stone-300">الفئة</label>
              <select
                value={form.categoryKey}
                onChange={e => {
                  const key = e.target.value;
                  const found = EDITABLE_CATEGORIES.find(c => c.key === key);
                  setForm({ ...form, categoryKey: key, category: found?.name || 'أدوات' });
                }}
                className={inputCls}
              >
                {EDITABLE_CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-300">الإصدار</label>
              <input type="text" placeholder="1.0.0" value={form.version}
                onChange={e => setForm({ ...form, version: e.target.value })}
                className={`${inputCls} text-center font-mono`} />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-stone-300">الأيقونة (إيموجي)</label>
              <input type="text" placeholder="📱" value={form.emoji}
                onChange={e => setForm({ ...form, emoji: e.target.value })}
                className={`${inputCls} text-center text-base`} />
            </div>
          </div>

          {/* Gradients */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-300">تدرج لون أيقونة التطبيق</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {GRADIENT_OPTIONS.map((g, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setForm({ ...form, gradient: g.value, shadowColor: g.shadow })}
                  className={`h-9 rounded-xl bg-gradient-to-tr ${g.value} transition-all border-2 ${
                    form.gradient === g.value ? 'border-amber-400 scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                  title={g.label}
                />
              ))}
            </div>
          </div>

          {/* Descriptions */}
          <div className="space-y-1">
            <label className="font-semibold text-stone-300">الوصف الموجز</label>
            <input type="text" placeholder="نبذة سريعة عن التطبيق..." value={form.shortDesc}
              onChange={e => setForm({ ...form, shortDesc: e.target.value })} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-stone-300">الوصف الكامل</label>
            <textarea rows={3} placeholder="شرح كامل لمميزات التطبيق..." value={form.fullDesc}
              onChange={e => setForm({ ...form, fullDesc: e.target.value })} className={inputCls} />
          </div>
          <div className="space-y-1">
            <label className="font-semibold text-stone-300">الميزات الرئيسية (ميزة في كل سطر)</label>
            <textarea rows={2} value={form.featuresText}
              onChange={e => setForm({ ...form, featuresText: e.target.value })}
              className={`${inputCls} font-sans`} />
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-end gap-3">
            <button type="button" onClick={onClose}
              className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-medium">
              إلغاء
            </button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-l from-amber-500 via-orange-600 to-rose-600 hover:from-amber-400 text-white font-bold rounded-xl shadow-lg shadow-orange-600/30"
            >
              {editingApp ? 'حفظ التعديلات' : 'إضافة وحفظ التطبيق'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
            }
