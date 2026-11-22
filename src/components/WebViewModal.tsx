import { motion } from 'motion/react';
import { X, Globe } from 'lucide-react';

export function WebViewModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-4xl h-[85vh] bg-stone-950 border border-violet-500/40 rounded-3xl overflow-hidden flex flex-col shadow-2xl"
      >
        <div className="bg-stone-900 px-5 py-3 border-b border-white/[0.06] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="font-bold text-stone-300 mr-2 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-violet-400" />
              <span>محاكي بيئة الويب فيو (Android WebView)</span>
            </span>
          </div>
          <div className="flex-1 max-w-md bg-stone-950 border border-white/[0.08] rounded-xl px-3 py-1 font-mono text-[11px] text-stone-400 truncate text-left">
            {url}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-stone-800 text-stone-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 w-full bg-stone-900 relative">
          <iframe
            src={url}
            title="WebView Preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
