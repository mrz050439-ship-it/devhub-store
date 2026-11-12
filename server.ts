import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database path
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Types
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
  appType?: 'android_native' | 'webview';
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

export interface ActivityLog {
  id: string;
  action: string;
  appTitle: string;
  timestamp: string;
}

interface DatabaseSchema {
  apps: AppItem[];
  logs: ActivityLog[];
}

// Initial Seed Data
const INITIAL_APPS: AppItem[] = [
  {
    id: 'app-1',
    title: 'أذكار ونور',
    developer: 'مختبرات التقنية الإسلامية',
    category: 'أدوات',
    categoryKey: 'tools',
    rating: 4.9,
    reviewCount: 48200,
    downloads: '1.5M+',
    downloadCount: 1540000,
    size: '28 MB',
    version: '3.4.1',
    updatedAt: 'اليوم',
    gradient: 'from-emerald-400 via-teal-500 to-emerald-700',
    shadowColor: 'rgba(16, 185, 129, 0.25)',
    emoji: '📿',
    shortDesc: 'رفيقك اليومي للذكر والقرآن الكريم وأوقات الصلاة بتصميم هادئ ومريح للعين.',
    fullDesc: 'تطبيق أذكار ونور صُمم ليكون بوابتك اليومية للطمأنينة. يوفر حصن المسلم كاملاً، قراءة المصحف الشريف بخط واضح، ومسبحة إلكترونية تفاعلية تحفظ إنجازك دون أي إعلانات مزعجة.',
    features: ['تنبيهات هادئة للأذكار', 'مصحف المدينة الليلي', 'مسبحة لمسية ذكية', 'تحديد القبلة بدون نت'],
    screenshots: ['الورد اليومي للأذكار', 'المصحف الشريف بالنمط الليلي', 'بوصلة القبلة الذكية'],
    isFeatured: true,
    isPopular: true,
    isRecent: false,
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    reviews: [
      { id: 'r1', userName: 'عبدالله الشمري', avatar: '👨‍💼', rating: 5, date: 'قبل 3 أيام', comment: 'تطبيق رائع جداً ومريح للعين، تصميمه الداكن أنيق للغاية وبدون إعلانات.' },
      { id: 'r2', userName: 'سارة الزهراني', avatar: '👩‍💻', rating: 5, date: 'قبل أسبوع', comment: 'المسبحة الإلكترونية وتنبيهات أوقات الصلاة دقيقة جداً. جزاكم الله خيراً.' }
    ]
  },
  {
    id: 'app-2',
    title: 'سباق صحراء العرب',
    developer: 'استوديو نجد للألعاب',
    category: 'ألعاب',
    categoryKey: 'games',
    rating: 4.8,
    reviewCount: 31400,
    downloads: '2.8M+',
    downloadCount: 2820000,
    size: '145 MB',
    version: '2.1.0',
    updatedAt: 'أمس',
    gradient: 'from-amber-400 via-orange-500 to-red-600',
    shadowColor: 'rgba(245, 158, 11, 0.25)',
    emoji: '🏎️',
    shortDesc: 'تحديات التطعيس والسباقات الواقعية في رمال وكثبان شبه الجزيرة العربية.',
    fullDesc: 'انطلق في أقوى لعبة سباق سيارات واقعية مخصصة للبيئة الصحراوية. قم بتعديل مركبتك الرباعية، وتحد أصدقاءك في سباقات أونلاين حماسية مع فيزياء قيادة متطورة وصوت محركات واقعي.',
    features: ['30 سيارة رباعية قابلة للتعديل', 'سباق جماعي عبر الإنترنت', 'فيزياء رمال متقدمة', 'طقس ديناميكي وعواصف'],
    screenshots: ['مضمار كثبان الربع الخالي', 'كراج الترقية وتعديل المحرك', 'لوحة المتصدرين الأسبوعية'],
    isFeatured: true,
    isPopular: true,
    isRecent: false,
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    reviews: [
      { id: 'r3', userName: 'فيصل المطيري', avatar: '🏎️', rating: 5, date: 'أمس', comment: 'الفيزياء وتجاوب السيارات فوق الرمال لا مثيل له، لعبة إدمانية وممتعة!' }
    ]
  },
  {
    id: 'app-3',
    title: 'طقس العرب المباشر',
    developer: 'شبكة أرصاد المستقبل',
    category: 'أدوات',
    categoryKey: 'tools',
    rating: 4.8,
    reviewCount: 22100,
    downloads: '950K+',
    downloadCount: 955000,
    size: '18 MB',
    version: '4.0.2',
    updatedAt: 'اليوم',
    gradient: 'from-sky-400 via-blue-500 to-indigo-600',
    shadowColor: 'rgba(14, 165, 233, 0.25)',
    emoji: '🌦️',
    shortDesc: 'رادار مباشر للأمطار وتوقعات دقيقة لدرجات الحرارة والرياح لكل المدن.',
    fullDesc: 'تطبيق الطقس الأكثر دقة للمنطقة العربية، يعتمد على رادارات متقدمة لتتبع السحب الماطرة والعواصف الترابية ساعة بساعة مع ويدجت أنيق لشاشتك.',
    features: ['رادار أقمار صناعية حي', 'توقعات دقيقة لـ 14 يوماً', 'تنبيهات فورية بالأمطار', 'مؤشرات جودة الهواء'],
    screenshots: ['رادار السحب الحية التفاعلي', 'شاشة الطقس اللحظية للمدن'],
    isFeatured: false,
    isPopular: true,
    isRecent: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    reviews: [
      { id: 'r4', userName: 'أحمد القحطاني', avatar: '👨', rating: 5, date: 'اليوم', comment: 'توقعاته للمطر في مدينتي كانت دقيقة بالدقيقة!' }
    ]
  },
  {
    id: 'app-4',
    title: 'مدرستي الذكية',
    developer: 'مؤسسة حلول التعليم',
    category: 'تعليم',
    categoryKey: 'education',
    rating: 4.7,
    reviewCount: 15300,
    downloads: '700K+',
    downloadCount: 710000,
    size: '34 MB',
    version: '1.9.4',
    updatedAt: 'قبل 3 أيام',
    gradient: 'from-violet-400 via-purple-500 to-indigo-700',
    shadowColor: 'rgba(139, 92, 246, 0.25)',
    emoji: '🎓',
    shortDesc: 'منصة تعليمية تفاعلية للدروس المبسطة، بنك الاختبارات والمتابعة الدراسية.',
    fullDesc: 'بيئة تعليمية شاملة تجمع الطلاب والمعلمين، وتوفر ملخصات دراسية واختبارات تفاعلية تقيس نقاط القوة والضعف مع شروحات بالفيديو لجميع المراحل.',
    features: ['شروحات فيديو تفاعلية', 'بنك أسئلة يحتوي 50 ألف سؤال', 'جدول مذاكرة ذكي', 'تقارير أداء دورية'],
    screenshots: ['الفصول التفاعلية والمقررات', 'شاشة الاختبار والتقييم الفوري'],
    isFeatured: false,
    isPopular: false,
    isRecent: true,
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    reviews: [
      { id: 'r5', userName: 'مريم العتيبي', avatar: '👩‍🏫', rating: 5, date: 'قبل أسبوع', comment: 'سهل على أبنائي مراجعة دروس الرياضيات والعلوم قبل الامتحانات.' }
    ]
  },
  {
    id: 'app-5',
    title: 'نبض المحادثة',
    developer: 'سحابة الخليج للبرمجيات',
    category: 'تواصل',
    categoryKey: 'social',
    rating: 4.8,
    reviewCount: 64000,
    downloads: '3.2M+',
    downloadCount: 3250000,
    size: '42 MB',
    version: '5.2.0',
    updatedAt: 'قبل 4 أيام',
    gradient: 'from-fuchsia-400 via-pink-500 to-rose-600',
    shadowColor: 'rgba(236, 72, 153, 0.25)',
    emoji: '💬',
    shortDesc: 'تطبيق مراسلة فورية مشفر فائق السرعة ومكالمات صوت وفيديو عالية الوضوح.',
    fullDesc: 'تواصل مع العائلة والأصدقاء بأمان تام وتشفير طرف إلى طرف. شارك الملفات والصور بجودتها الكاملة واستمتع بمكالمات صوتية ومرئية فائقة النقاء.',
    features: ['تشفير تام للرسائل', 'مكالمات فيديو بدقة HD', 'مجموعات حتى 100 ألف عضو', 'ملصقات عربية حصرية'],
    screenshots: ['واجهة المحادثات المشفرة', 'مكالمات الفيديو الجماعية بدقة HD'],
    isFeatured: false,
    isPopular: true,
    isRecent: false,
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    reviews: [
      { id: 'r6', userName: 'ياسر الحربي', avatar: '👨‍💻', rating: 5, date: 'قبل يومين', comment: 'سرعة إرسال الرسائل والصوتيات مذهلة، وجودة المكالمات تفوقت على التطبيقات الشهيرة.' }
    ]
  },
  {
    id: 'app-6',
    title: 'محفظة ريال الذكية',
    developer: 'التقنية المالية الآمنة',
    category: 'مالية',
    categoryKey: 'finance',
    rating: 4.9,
    reviewCount: 39800,
    downloads: '1.9M+',
    downloadCount: 1910000,
    size: '31 MB',
    version: '2.8.5',
    updatedAt: 'أمس',
    gradient: 'from-emerald-400 via-cyan-500 to-blue-600',
    shadowColor: 'rgba(6, 182, 212, 0.25)',
    emoji: '💳',
    shortDesc: 'إدارة مصاريفك الشخصية، دفع الفواتير وتتبع ميزانيتك الشهرية بكل بساطة.',
    fullDesc: 'تطبيق مالي ذكي يساعدك على متابعة مصروفاتك وتصنيفها تلقائياً مع تنبيهات عند الاقتراب من سقف الميزانية، وخطط ادخار لتحقيق أهدافك.',
    features: ['تصنيف تلقائي للنفقات', 'تقارير بيانية تفاعلية', 'تحديد ميزانية لكل بند', 'تصدير التقارير المالية'],
    screenshots: ['لوحة القيادة المالية الشهرية', 'الرسم البياني لتوزيع النفقات'],
    isFeatured: false,
    isPopular: true,
    isRecent: false,
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    reviews: [
      { id: 'r7', userName: 'سلطان الدوسري', avatar: '💼', rating: 5, date: 'قبل 4 أيام', comment: 'ساعدني هذا التطبيق في ادخار ربع راتبي في أول شهرين!' }
    ]
  },
  {
    id: 'app-7',
    title: 'مساعد المهام والتركيز',
    developer: 'أفكار رقمية للإنتاجية',
    category: 'أدوات',
    categoryKey: 'tools',
    rating: 4.7,
    reviewCount: 18200,
    downloads: '820K+',
    downloadCount: 825000,
    size: '22 MB',
    version: '3.1.2',
    updatedAt: 'قبل أسبوع',
    gradient: 'from-cyan-400 via-teal-500 to-indigo-600',
    shadowColor: 'rgba(20, 184, 166, 0.25)',
    emoji: '⚡',
    shortDesc: 'نظم يومك وركز على إنجاز أهدافك بمؤقت بومودورو وقوائم المهام الذكية.',
    fullDesc: 'أداة الإنتاجية المفضلة لرواد الأعمال والطلاب. تنظم مهامك حسب الأولوية وتوفر مؤقت تركيز مدمج يعزل المشتتات ويقيس إنجازك اليومي.',
    features: ['مؤقت بومودورو مع أصوات هادئة', 'قوائم مهام مرنة', 'مزامنة سحابية فورية', 'إحصائيات إنجاز أسبوعية'],
    screenshots: ['مؤقت التركيز الفائق', 'قوائم المهام اليومية المرنة'],
    isFeatured: false,
    isPopular: false,
    isRecent: true,
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    reviews: [
      { id: 'r8', userName: 'هند السبيعي', avatar: '👩‍🎓', rating: 5, date: 'قبل أسبوعين', comment: 'أصبح إنجاز واجباتي وبحوثي الجامعية أسهل بكثير.' }
    ]
  },
  {
    id: 'app-8',
    title: 'مدرب اللياقة والصحة',
    developer: 'فيتنس كير كوتش',
    category: 'تعليم',
    categoryKey: 'education',
    rating: 4.8,
    reviewCount: 29500,
    downloads: '1.2M+',
    downloadCount: 1240000,
    size: '56 MB',
    version: '2.6.0',
    updatedAt: 'قبل 3 أيام',
    gradient: 'from-rose-400 via-red-500 to-orange-600',
    shadowColor: 'rgba(244, 63, 94, 0.25)',
    emoji: '🌿',
    shortDesc: 'تمارين منزلية موجهة، حساب السعرات للأكلات العربية وعداد خطوات دقيق.',
    fullDesc: 'حول هاتفك إلى مدرب شخصي وأخصائي تغذية. خطط تمارين بدون أوزان، وجداول وجبات مخصصة لهدفك، مع متابعة دقيقة لمؤشرات نشاطك اليومي.',
    features: ['تمارين فيديو ثلاثية الأبعاد', 'حاسبة أكلات عربية', 'عداد خطوات موفر للطاقة', 'تذكير ذكي بشرب الماء'],
    screenshots: ['خطة التمرين المنزلي', 'جدول حساب السعرات والماكروز'],
    isFeatured: false,
    isPopular: true,
    isRecent: true,
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    reviews: [
      { id: 'r9', userName: 'فهد البقمي', avatar: '🏋️‍♂️', rating: 5, date: 'قبل 3 أيام', comment: 'التمارين المنزلية واضحة جداً وجدول الأكلات العربية ساعدني كثيراً.' }
    ]
  },
  {
    id: 'app-9',
    title: 'استوديو الصور الاحترافي',
    developer: 'بيكسل برو للوسائط',
    category: 'أدوات',
    categoryKey: 'tools',
    rating: 4.6,
    reviewCount: 21000,
    downloads: '1.1M+',
    downloadCount: 1110000,
    size: '64 MB',
    version: '4.2.0',
    updatedAt: 'قبل 5 أيام',
    gradient: 'from-blue-400 via-indigo-500 to-purple-600',
    shadowColor: 'rgba(99, 102, 241, 0.25)',
    emoji: '🎨',
    shortDesc: 'فلاتر سينمائية، تفريغ الخلفيات تلقائياً وتصميم نصوص عربية مبهرة.',
    fullDesc: 'كل أدوات تعديل الصور الاحترافية بين يديك. أزل الخلفية بنقرة واحدة، واضبط الإضاءة والألوان، واكتب بخطوط عربية فخمة مع تأثيرات بصرية.',
    features: ['تفريغ الخلفية الفوري', 'أكثر من 80 فلتراً سينمائياً', 'مكتبة خطوط عربية', 'تصدير بجودة 4K فائقة'],
    screenshots: ['أداة عزل وتفريغ الخلفية', 'معرض الخطوط والتأثيرات'],
    isFeatured: false,
    isPopular: false,
    isRecent: true,
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    reviews: [
      { id: 'r10', userName: 'نورة الدوسري', avatar: '👩‍🎨', rating: 5, date: 'قبل أسبوع', comment: 'الخطوط العربية المتاحة في التطبيق غاية في الروعة!' }
    ]
  },
  {
    id: 'app-10',
    title: 'لغز الكلمات الذهبية',
    developer: 'ألعاب العقل والذكاء',
    category: 'ألعاب',
    categoryKey: 'games',
    rating: 4.9,
    reviewCount: 52000,
    downloads: '2.5M+',
    downloadCount: 2540000,
    size: '48 MB',
    version: '3.0.1',
    updatedAt: 'قبل 4 أيام',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    shadowColor: 'rgba(234, 179, 8, 0.25)',
    emoji: '🧩',
    shortDesc: 'اختبر ذكاءك وحصيلتك اللغوية في لعبة كلمات متقاطعة عربية مشوقة.',
    fullDesc: 'آلاف المراحل والألغاز الثقافية واللغوية المتنوعة التي تنشط العقل وتغذي المعرفة. العب بمفردك أو نافس أصدقاءك في تحديات يومية ممتعة.',
    features: ['أكثر من 2000 مرحلة', 'تحديات أسبوعية وجوائز', 'تعمل بدون إنترنت', 'مساعدات وتلميحات ذكية'],
    screenshots: ['شبكة الكلمات المتقاطعة', 'التحدي اليومي ولوحة الصدارة'],
    isFeatured: false,
    isPopular: true,
    isRecent: false,
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    reviews: [
      { id: 'r11', userName: 'ماجد القرني', avatar: '🧠', rating: 5, date: 'قبل 3 أيام', comment: 'لعبة مسلية ومفيدة جداً، تزيد من الحصيلة اللغوية وتنشط العقل.' }
    ]
  }
];

// Persistent Database Layer
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.read();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private read(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.apps && Array.isArray(parsed.apps)) {
          // Normalize and migrate existing apps to ensure APK/WebView fields
          let needsUpdate = false;
          for (const app of parsed.apps) {
            if (!app.appType) {
              app.appType = (app.categoryKey === 'education' || app.categoryKey === 'finance') ? 'webview' : 'android_native';
              needsUpdate = true;
            }
            if (!app.apkFileName) {
              app.apkFileName = `${(app.title || 'app').replace(/\s+/g, '_')}_v${app.version || '1.0'}.apk`;
              needsUpdate = true;
            }
            if (!app.packageName) {
              app.packageName = `com.matjari.${app.id}`;
              needsUpdate = true;
            }
            if (!app.minAndroidVersion) {
              app.minAndroidVersion = 'Android 8.0+';
              needsUpdate = true;
            }
            if (!app.webViewUrl && app.appType === 'webview') {
              app.webViewUrl = 'https://app-preview.matjari.app';
              needsUpdate = true;
            }
            if (!app.apkDownloadUrl) {
              app.apkDownloadUrl = `/api/download/${app.id}`;
              needsUpdate = true;
            }
          }
          if (needsUpdate) {
            this.write(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading database file, re-seeding:', e);
    }

    // Seed default database
    const initial: DatabaseSchema = {
      apps: INITIAL_APPS,
      logs: [
        { id: 'l1', action: 'تهيئة المتجر وقاعدة البيانات', appTitle: 'متجري للنظام', timestamp: new Date().toISOString() }
      ]
    };
    this.write(initial);
    return initial;
  }

  private write(data: DatabaseSchema) {
    this.ensureDirectory();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  public getApps(category?: string, search?: string): AppItem[] {
    let list = [...this.data.apps];

    if (category && category !== 'all') {
      list = list.filter(a => a.categoryKey === category);
    }

    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      list = list.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.developer.toLowerCase().includes(q) ||
        a.shortDesc.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public getAppById(id: string): AppItem | undefined {
    return this.data.apps.find(a => a.id === id);
  }

  public addApp(appData: Partial<AppItem>): AppItem {
    const newId = `app-${Date.now()}`;
    const newApp: AppItem = {
      id: newId,
      title: appData.title || 'تطبيق جديد',
      developer: appData.developer || 'مطور مستقل',
      category: appData.category || 'أدوات',
      categoryKey: appData.categoryKey || 'tools',
      appType: appData.appType || 'android_native',
      apkFileName: appData.apkFileName || `${appData.title || 'app'}-v1.0.0.apk`,
      apkDownloadUrl: `/api/download/${newId}`,
      packageName: appData.packageName || `com.matjari.${(appData.title || 'app').toLowerCase().replace(/\s+/g, '')}`,
      webViewUrl: appData.webViewUrl || '',
      minAndroidVersion: appData.minAndroidVersion || 'Android 8.0+',
      rating: appData.rating || 5.0,
      reviewCount: appData.reviewCount || 1,
      downloads: appData.downloads || '1K+',
      downloadCount: appData.downloadCount || 1000,
      size: appData.size || '25 MB',
      version: appData.version || '1.0.0',
      updatedAt: 'اليوم',
      gradient: appData.gradient || 'from-indigo-500 via-purple-600 to-pink-600',
      shadowColor: appData.shadowColor || 'rgba(99, 102, 241, 0.25)',
      emoji: appData.emoji || '📱',
      shortDesc: appData.shortDesc || '',
      fullDesc: appData.fullDesc || appData.shortDesc || '',
      features: appData.features || ['واجهة سهلة الاستخدام', 'دعم كامل للغة العربية'],
      screenshots: appData.screenshots || ['شاشة الواجهة الرئيسية'],
      isFeatured: Boolean(appData.isFeatured),
      isPopular: Boolean(appData.isPopular),
      isRecent: true,
      createdAt: new Date().toISOString(),
      reviews: []
    };

    this.data.apps.unshift(newApp);
    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      action: 'إضافة تطبيق جديد بواسطة لوحة التحكم',
      appTitle: newApp.title,
      timestamp: new Date().toISOString()
    });

    this.write(this.data);
    return newApp;
  }

  public updateApp(id: string, updates: Partial<AppItem>): AppItem | null {
    const index = this.data.apps.findIndex(a => a.id === id);
    if (index === -1) return null;

    const existing = this.data.apps[index];
    const updated: AppItem = {
      ...existing,
      ...updates,
      id: existing.id,
      updatedAt: 'اليوم'
    };

    this.data.apps[index] = updated;
    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      action: 'تحديث بيانات التطبيق',
      appTitle: updated.title,
      timestamp: new Date().toISOString()
    });

    this.write(this.data);
    return updated;
  }

  public deleteApp(id: string): boolean {
    const index = this.data.apps.findIndex(a => a.id === id);
    if (index === -1) return false;

    const [deleted] = this.data.apps.splice(index, 1);
    this.data.logs.unshift({
      id: `log-${Date.now()}`,
      action: 'حذف تطبيق من المتجر',
      appTitle: deleted.title,
      timestamp: new Date().toISOString()
    });

    this.write(this.data);
    return true;
  }

  public incrementDownload(id: string): { success: boolean; newCount: number } {
    const app = this.data.apps.find(a => a.id === id);
    if (!app) return { success: false, newCount: 0 };

    app.downloadCount = (app.downloadCount || 0) + 1;
    if (app.downloadCount >= 1000000) {
      app.downloads = `${(app.downloadCount / 1000000).toFixed(1)}M+`;
    } else if (app.downloadCount >= 1000) {
      app.downloads = `${(app.downloadCount / 1000).toFixed(0)}K+`;
    } else {
      app.downloads = `${app.downloadCount}`;
    }

    this.write(this.data);
    return { success: true, newCount: app.downloadCount };
  }

  public addReview(id: string, review: { userName: string; comment: string; rating: number }): AppItem | null {
    const app = this.data.apps.find(a => a.id === id);
    if (!app) return null;

    const newRev: AppReview = {
      id: `rev-${Date.now()}`,
      userName: review.userName || 'مستخدم متجري',
      avatar: '👤',
      rating: review.rating || 5,
      date: 'اليوم',
      comment: review.comment || 'تطبيق ممتاز!'
    };

    app.reviews.unshift(newRev);
    app.reviewCount += 1;
    
    // Recalculate average rating
    const totalRating = app.reviews.reduce((sum, r) => sum + r.rating, 0) + (app.rating * 5);
    app.rating = Number((totalRating / (app.reviews.length + 5)).toFixed(1));

    this.write(this.data);
    return app;
  }

  public getAdminStats() {
    const totalApps = this.data.apps.length;
    const totalDownloads = this.data.apps.reduce((sum, a) => sum + (a.downloadCount || 0), 0);
    const avgRating = totalApps > 0 
      ? (this.data.apps.reduce((sum, a) => sum + a.rating, 0) / totalApps).toFixed(1)
      : '0.0';
    const totalReviews = this.data.apps.reduce((sum, a) => sum + (a.reviewCount || 0), 0);

    // Categories breakdown
    const categoryCounts: Record<string, number> = {};
    for (const app of this.data.apps) {
      categoryCounts[app.category] = (categoryCounts[app.category] || 0) + 1;
    }

    return {
      totalApps,
      totalDownloads,
      avgRating,
      totalReviews,
      categoryCounts,
      logs: this.data.logs.slice(0, 10)
    };
  }

  public resetToSeed() {
    const seeded: DatabaseSchema = {
      apps: INITIAL_APPS,
      logs: [{ id: `log-${Date.now()}`, action: 'إعادة تعيين قاعدة البيانات إلى البداية', appTitle: 'النظام', timestamp: new Date().toISOString() }]
    };
    this.write(seeded);
    this.data = seeded;
    return true;
  }
}

// Start Express Server
async function startServer() {
  const app = express();
  const PORT = 3000;
  const db = new Database();

  app.use(express.json());

  // API Routes
  // 1. Get all apps with filtering & search
  app.get('/api/apps', (req, res) => {
    const { category, search } = req.query;
    const apps = db.getApps(category as string, search as string);
    res.json({ success: true, count: apps.length, data: apps });
  });

  // 2. Get single app details
  app.get('/api/apps/:id', (req, res) => {
    const appItem = db.getAppById(req.params.id);
    if (!appItem) {
      return res.status(404).json({ success: false, message: 'التطبيق غير موجود' });
    }
    res.json({ success: true, data: appItem });
  });

  // 3. Create app (Admin)
  app.post('/api/apps', (req, res) => {
    try {
      const created = db.addApp(req.body);
      res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // 4. Update app (Admin)
  app.put('/api/apps/:id', (req, res) => {
    const updated = db.updateApp(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'التطبيق غير موجود' });
    }
    res.json({ success: true, data: updated });
  });

  // 5. Delete app (Admin)
  app.delete('/api/apps/:id', (req, res) => {
    const ok = db.deleteApp(req.params.id);
    if (!ok) {
      return res.status(404).json({ success: false, message: 'التطبيق غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف التطبيق بنجاح' });
  });

  // 6. Increment download count
  app.post('/api/apps/:id/download', (req, res) => {
    const result = db.incrementDownload(req.params.id);
    res.json(result);
  });

  // 6.1 Real APK file download
  app.get('/api/download/:id', (req, res) => {
    const appItem = db.getAppById(req.params.id);
    if (!appItem) {
      return res.status(404).json({ success: false, message: 'التطبيق غير موجود' });
    }

    db.incrementDownload(req.params.id);

    const safeTitle = (appItem.title || 'app').replace(/[^\w\u0600-\u06FF]+/g, '_');
    const filename = appItem.apkFileName || `${safeTitle}_v${appItem.version || '1.0'}.apk`;

    // Standard Android package archive headers
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
    res.setHeader('Content-Type', 'application/vnd.android.package-archive');

    // Realistic Android APK ZIP signature & manifest chunk
    const mockApkData = Buffer.from(
      `PK\x03\x04\x14\x00\x00\x00\x08\x00\x82\x5a\x2b\x56` +
      `AndroidManifest.xml\x00\x00` +
      `[Matjari Android Package Archive]\n` +
      `PackageName: ${appItem.packageName || 'com.matjari.app'}\n` +
      `AppTitle: ${appItem.title}\n` +
      `AppType: ${appItem.appType || 'android_native'}\n` +
      `Version: ${appItem.version || '1.0.0'}\n` +
      `MinSDK: ${appItem.minAndroidVersion || 'Android 8.0+'}\n` +
      `BuiltWith: Matjari App Engine\n`
    );

    res.send(mockApkData);
  });

  // 7. Add user review
  app.post('/api/apps/:id/reviews', (req, res) => {
    const updated = db.addReview(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'التطبيق غير موجود' });
    }
    res.json({ success: true, data: updated });
  });

  // 8. Admin statistics
  app.get('/api/admin/stats', (req, res) => {
    const stats = db.getAdminStats();
    res.json({ success: true, data: stats });
  });

  // 9. Reset database to seed
  app.post('/api/admin/reset', (req, res) => {
    db.resetToSeed();
    res.json({ success: true, message: 'تمت استعادة البيانات الافتراضية بنجاح' });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serve
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Matjari Full-Stack Server running at http://localhost:${PORT}`);
  });
}

startServer();
