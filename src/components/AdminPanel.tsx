import { motion } from 'motion/react';
import {
  Plus, RotateCcw, Layers, Download, Smartphone, Globe, Edit3, Trash2,
  FileCode, ExternalLink, CheckCircle2, Star, MessageSquare, Terminal
} from 'lucide-react';
import { AppItem, AdminStats } from '../types';

interface AdminProps {
  apps: AppItem[];
  adminStats: AdminStats | null;
  onAdd: () => void;
  onEdit: (app: AppItem) => void;
  onDelete: (app: AppItem, e: React.MouseEvent) => void;
  onReset: () => void;
  onDownloadApk: (app: AppItem, e?: React.MouseEvent) => void;
  onOpenWebView: (url: string) => void;
}

export function AdminPanel({ apps, adminStats, onAdd, onEdit, onDelete, onReset, onDownloadApk, onOpenWebView }: AdminProps) {
  const apkCount = apps.filter(a => a.appType === 'android_native').length;
  const webviewCount = apps.filter(a => a.appType === 'webview').length;

  return (
    <div className="space-y-8">
      {/* Header strip */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-stone-900/60 backdrop-blur-xl border border-white/[0.07] rounded-3xl p-6 shadow-xl">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2.5 py-1 rounded-full mb-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>لوحة إدارة التطبيقات وحزم APK والويب فيو</span>
          </div>
          <h2 className="text-xl font-black text-white font-heading">إدارة التطبيقات وقاعدة البيانات</h2>
          <p className="text-xs text-stone-400 mt-0.5">
            أضف تطبيقات أندرويد مع ملفات APK الخاصة بها، أو أنشئ تطبيقات ويب فيو مرتبطة بمواقع الويب.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={onAdd}
            className="px-5 py-3 bg-gradient-to-l from-amber-500 via-orange-600 to-rose-600 hover:from-amber-400 text-white rounded-2xl text-xs font-bold transition-all shadow-lg shadow-orange-600/30 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تطبيق أو APK جديد</span>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onReset}
            className="px-3.5 py-3 bg-stone-800/80 hover:bg-stone-700 text-stone-300 rounded-2xl text-xs font-medium transition-colors border border-white/[0.06] flex items-center gap-1.5"
            title="استعادة المصنع"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">إعادة ضبط</span>
          </motion.button>
        </div>
      </div>

      {/* Stats */}
      {adminStats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-stone-900/50 border border-white/[0.06] rounded-2xl p-5 space-y-1">
            <div className="text-xs text-stone-400 flex items-center justify-between">
              <span>إجمالي التطبيقات</span>
              <Layers className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white">{adminStats.totalApps}</div>
            <div className="text-[10px] text-amber-400 font-medium">{apkCount} APK · {webviewCount} ويب فيو</div>
          </div>
          <div className="bg-stone-900/50 border border-white/[0.06] rounded-2xl p-5 space-y-1">
            <div className="text-xs text-stone-400 flex items-center justify-between">
              <span>إجمالي التنزيلات</span>
              <Download className="w-4 h-4 text-orange-400" />
            </div>
            <div className="text-2xl font-black text-white">{adminStats.totalDownloads.toLocaleString('ar')}</div>
            <div className="text-[10px] text-orange-400 font-medium">عملية تنزيل مسجلة</div>
          </div>
          <div className="bg-stone-900/50 border border-white/[0.06] rounded-2xl p-5 space-y-1">
            <div className="text-xs text-stone-400 flex items-center justify-between">
              <span>متوسط التقييم</span>
              <Star className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400">{adminStats.avgRating}</div>
            <div className="text-[10px] text-stone-400">من {adminStats.totalReviews.toLocaleString('ar')} مراجعة</div>
          </div>
          <div className="bg-stone-900/50 border border-white/[0.06] rounded-2xl p-5 space-y-1">
            <div className="text-xs text-stone-400 flex items-center justify-between">
              <span>الفئات النشطة</span>
              <MessageSquare className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-2xl font-black text-teal-400">{Object.keys(adminStats.categoryCounts).length}</div>
            <div className="text-[10px] text-stone-400">{Object.entries(adminStats.categoryCounts).map(([k, v]) => `${k} (${v})`).join(' · ')}</div>
          </div>
        </div>
      )}

      {/* Apps table */}
      <div className="bg-stone-900/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-white font-heading">إدارة الحزم وتطبيقات المتجر ({apps.length})</h3>
            <p className="text-[11px] text-stone-400">تحميل مباشر لملفات APK ومراجعة روابط الويب فيو</p>
          </div>
          <span className="text-xs text-amber-400 font-mono bg-amber-950/60 border border-amber-800/40 px-2.5 py-1 rounded-lg">
            محدث لحظياً
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-stone-950/70 text-stone-400 border-b border-white/[0.04]">
              <tr>
                <th className="py-3.5 px-6 font-semibold">التطبيق</th>
                <th className="py-3.5 px-4 font-semibold">النوع</th>
                <th className="py-3.5 px-4 font-semibold">الفئة</th>
                <th className="py-3.5 px-4 font-semibold">اسم الحزمة</th>
                <th className="py-3.5 px-4 font-semibold">ملف الـ APK</th>
                <th className="py-3.5 px-4 font-semibold">التنزيلات</th>
                <th className="py-3.5 px-6 font-semibold text-left">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {apps.map(app => (
                <tr key={app.id} className="hover:bg-stone-800/40 transition-colors">
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-lg shrink-0 shadow-sm`}>
                        {app.emoji}
                      </div>
                      <div>
                        <div className="font-bold text-white">{app.title}</div>
                        <div className="text-[11px] text-stone-400">{app.developer}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    {app.appType === 'webview' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-400 bg-violet-950/60 border border-violet-800/50 px-2 py-0.5 rounded-md">
                        <Globe className="w-3 h-3" />
                        <span>ويب فيو</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-md">
                        <Smartphone className="w-3 h-3" />
                        <span>أندرويد APK</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-stone-300">{app.category}</td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-stone-400">
                    {app.packageName || `com.matjari.${app.id}`}
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      onClick={(e) => onDownloadApk(app, e)}
                      className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-[11px] underline"
                      title="تنزيل الـ APK الآن"
                    >
                      <FileCode className="w-3 h-3" />
                      <span>{app.apkFileName || `${app.id}.apk`}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{app.downloads}</td>
                  <td className="py-3.5 px-6 text-left">
                    <div className="flex items-center justify-end gap-2">
                      {app.appType === 'webview' && app.webViewUrl && (
                        <button
                          onClick={() => onOpenWebView(app.webViewUrl || '')}
                          className="p-1.5 rounded-lg bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 transition-colors"
                          title="معاينة الويب فيو"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onEdit(app)}
                        className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors"
                        title="تعديل التطبيق"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => onDelete(app, e)}
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

      {/* Audit logs */}
      {adminStats && adminStats.logs.length > 0 && (
        <div className="bg-stone-900/60 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-6 space-y-3">
          <h3 className="font-bold text-sm text-white font-heading">سجل العمليات الأخير</h3>
          <div className="space-y-2">
            {adminStats.logs.map(log => (
              <div key={log.id} className="flex items-center justify-between text-xs py-2 border-b border-white/[0.04] last:border-0">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-stone-300">{log.action}</span>
                  <span className="text-orange-400 font-medium">({log.appTitle})</span>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString('ar-EG')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
