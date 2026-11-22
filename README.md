# متجري (Matjari Store)

متجر تطبيقات عربي (RTL) للأندرويد والويب فيو، بواجهة داكنة عصرية وخادم Express مدمج مع قاعدة بيانات JSON.

## التشغيل

```bash
npm install
npm run dev
```

ثم افتح http://localhost:3000

## أوامر مفيدة

```bash
npm run build    # بناء نسخة الإنتاج (vite build)
npm start        # تشغيل الخادم (dev mode مع Vite middleware)
npm run lint     # فحص TypeScript بدون إخراج ملفات
```

## المكونات

- **الواجهة (src/)**: React 19 + Vite + Tailwind CSS 4 + motion
  - `App.tsx` — التجميع الرئيسي وإدارة الحالة
  - `components/StoreHeader.tsx` — الهيدر والقوائم والبحث الفوري والبحث الصوتي
  - `components/Hero.tsx` — سلايدر التطبيقات المميزة
  - `components/Sections.tsx` — بطاقات الفئات وأشرطة الأقسام (الأكثر تحميلاً / وصل حديثاً / الأعلى تقييماً)
  - `components/shared.tsx` — بطاقة التطبيق والنجوم والشارات المشتركة
  - `components/AppDetailsModal.tsx` — صفحة تفاصيل التطبيق (لقطات، مميزات، مراجعات، تطبيقات مشابهة)
  - `components/AdminPanel.tsx` — لوحة الأدمن (إحصائيات، جدول إدارة، سجل العمليات)
  - `components/EditorModal.tsx` — إضافة/تعديل تطبيق (APK أو WebView)
  - `components/WebViewModal.tsx` — محاكي الويب فيو
- **الخادم (server.ts)**: Express API
  - `GET /api/apps` مع فلترة `category` و `search`
  - `GET/POST/PUT/DELETE /api/apps/:id`
  - `POST /api/apps/:id/download` و `GET /api/download/:id` (تنزيل ملف APK)
  - `POST /api/apps/:id/reviews`
  - `GET /api/admin/stats` و `POST /api/admin/reset`
- **قاعدة البيانات**: `data/database.json` (تُهيأ تلقائياً من البيانات الافتراضية)

## ملاحظات

- التطبيقات المثبتة والمفضلة تُحفظ في `localStorage` على جهاز المستخدم.
- البحث الصوتي يعتمد على Web Speech API (متصفحات Chromium).
