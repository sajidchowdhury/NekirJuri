// ============================================================
// Website CMS Sample Data — Pages, Notices, Gallery
// Realistic Bangladeshi Islamic school context
// ============================================================

// ──────────────────────────────────────────────
// Website Pages
// ──────────────────────────────────────────────

export type PageStatus = 'published' | 'draft';

export interface WebsitePage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: PageStatus;
  lastUpdated: string;
  author: string;
  seoTitle?: string;
  seoDescription?: string;
  featuredImageUrl?: string;
}

export const samplePages: WebsitePage[] = [
  {
    id: 'page-1',
    title: 'About Us',
    slug: '/about-us',
    content: 'Learn about our madrasha — its rich history spanning over three decades, our mission to provide quality Islamic and general education, and the vision that guides us every day.\n\nFounded in 1992, Al-Hidayah Islamic Academy has been a beacon of knowledge, nurturing young minds in both Islamic sciences and modern academics. Our mission is to develop well-rounded individuals who excel in both deen and duniya.',
    status: 'published',
    lastUpdated: '2025-01-15',
    author: 'Admin',
    seoTitle: 'About Al-Hidayah Islamic Academy',
    seoDescription: 'Learn about our madrasha, its history, mission, and vision for Islamic education in Bangladesh.',
    featuredImageUrl: '',
  },
  {
    id: 'page-2',
    title: 'Admission',
    slug: '/admission',
    content: 'Admission is open for the academic session 2025-2026. We welcome students from Play Group to Class 10.\n\n**Requirements:**\n- Completed application form\n- Birth certificate\n- Previous school records (if applicable)\n- Guardian\'s NID copy\n- Two passport-size photographs\n\n**Process:**\n1. Submit application form\n2. Entrance assessment\n3. Interview with guardian\n4. Admission confirmation and fee payment',
    status: 'published',
    lastUpdated: '2025-02-01',
    author: 'Admin',
    seoTitle: 'Admission — Al-Hidayah Islamic Academy',
    seoDescription: 'Admission process, requirements, and important dates for the upcoming academic session.',
  },
  {
    id: 'page-3',
    title: 'Academic Programs',
    slug: '/programs',
    content: 'We offer three comprehensive programs:\n\n**Hifz Program** — Complete memorization of the Holy Quran with Tajweed.\n\n**Alim Program** — In-depth Islamic studies including Fiqh, Hadith, Tafsir, and Arabic literature.\n\n**General Program** — NCTB curriculum combined with Islamic studies for a balanced education.\n\nEach program is designed to nurture students spiritually and academically.',
    status: 'published',
    lastUpdated: '2025-01-20',
    author: 'Principal',
    seoTitle: 'Academic Programs — Al-Hidayah Islamic Academy',
    seoDescription: 'Explore our Hifz, Alim, and General academic programs.',
  },
  {
    id: 'page-4',
    title: 'Contact',
    slug: '/contact',
    content: '**Address:** Village Charpadma, Union Durgapur, Upazila Beanibazar, District Sylhet, Bangladesh\n\n**Phone:** +880 1712-345678\n**Email:** info@alhidayah.edu.bd\n\n**Office Hours:** Saturday–Thursday, 8:00 AM – 4:00 PM\n**Friday:** Closed\n\nWe are located 5 km from Beanibazar town on the Durgapur road.',
    status: 'published',
    lastUpdated: '2025-01-10',
    author: 'Admin',
    seoTitle: 'Contact Us — Al-Hidayah Islamic Academy',
    seoDescription: 'Get in touch with us — address, phone, email, and office hours.',
  },
  {
    id: 'page-5',
    title: 'Donate',
    slug: '/donate',
    content: 'Your generous donations help us provide quality education to underprivileged students and maintain our facilities.\n\n**Bank Details:**\n- Bank: Sonali Bank Limited\n- Branch: Beanibazar\n- Account Name: Al-Hidayah Islamic Academy\n- Account Number: 1234-5678-9012\n- Routing Number: 123456789\n\n**Mobile Banking:**\n- bKash: +880 1712-345678\n- Nagad: +880 1712-345678\n\nJazakallahu Khairan for your support!',
    status: 'published',
    lastUpdated: '2025-02-10',
    author: 'Admin',
    seoTitle: 'Donate — Al-Hidayah Islamic Academy',
    seoDescription: 'Support our mission — donation via bank transfer or mobile banking.',
  },
  {
    id: 'page-6',
    title: 'Annual Report 2024',
    slug: '/annual-report-2024',
    content: '# Annual Report 2024\n\nThis report covers the academic and financial highlights of 2024.\n\n**Academic Highlights:**\n- Total students: 650\n- Hifz completions: 12\n- Board exam pass rate: 95%\n\n*This page is currently being drafted and will be published soon.*',
    status: 'draft',
    lastUpdated: '2025-03-01',
    author: 'Principal',
    seoTitle: '',
    seoDescription: '',
  },
];

// ──────────────────────────────────────────────
// Notices
// ──────────────────────────────────────────────

export type NoticePriority = 'urgent' | 'important' | 'normal';
export type NoticeAudience = 'public' | 'staff' | 'students' | 'parents';

export interface Notice {
  id: string;
  title: string;
  content: string;
  date: string;
  priority: NoticePriority;
  audience: NoticeAudience;
  isPinned: boolean;
  hasAttachment: boolean;
  attachmentName?: string;
}

export const sampleNotices: Notice[] = [
  {
    id: 'notice-1',
    title: 'আগামী পরীক্ষার সূচি প্রকাশ',
    content: 'আগামী ১লা এপ্রিল হতে বার্ষিক পরীক্ষা শুরু হবে। সকল শিক্ষার্থীদের পরীক্ষার সূচি অফিস হতে সংগ্রহ করতে বলা হলো। পরীক্ষার প্রস্তুতি সম্পর্কে যেকোনো প্রশ্নে শ্রেণি শিক্ষকের সাথে যোগাযোগ করুন।',
    date: '2025-03-15',
    priority: 'urgent',
    audience: 'students',
    isPinned: true,
    hasAttachment: true,
    attachmentName: 'exam-schedule-2025.pdf',
  },
  {
    id: 'notice-2',
    title: 'মাসিক অভিভাবক সভা',
    content: 'আগামী ২৫শে মার্চ বিকাল ৪টায় মাসিক অভিভাবক সভা অনুষ্ঠিত হবে। সকল অভিভাবক/অভিভাবিকার উপস্থিতি কাম্য। সভায় শিক্ষার্থীদের একাডেমিক অগ্রগতি ও আচরণ সম্পর্কে আলোচনা করা হবে।',
    date: '2025-03-20',
    priority: 'important',
    audience: 'parents',
    isPinned: false,
    hasAttachment: false,
  },
  {
    id: 'notice-3',
    title: 'ঈদুল ফিতরের ছুটির বিজ্ঞপ্তি',
    content: 'ঈদুল ফিতরের উপলক্ষে ৩০শে রমজান হতে ৫ই শাওয়াল পর্যন্ত ছুটি থাকবে। ৬ই শাওয়াল সকাল ৮টায় ক্লাস শুরু হবে। সকলকে ঈদ মোবারক।',
    date: '2025-03-28',
    priority: 'urgent',
    audience: 'public',
    isPinned: true,
    hasAttachment: true,
    attachmentName: 'eid-holiday-notice.pdf',
  },
  {
    id: 'notice-4',
    title: 'নতুন শিক্ষক নিয়োগ',
    content: 'আমরা আনন্দিত জানাচ্ছি যে, মাওলানা আব্দুল করিম সাহেব আরবি বিভাগে এবং মিসেস ফাতেমা বেগম গণিত বিভাগে যোগদান করেছেন। সকলকে তাদের স্বাগত জানাই।',
    date: '2025-03-10',
    priority: 'normal',
    audience: 'staff',
    isPinned: false,
    hasAttachment: false,
  },
  {
    id: 'notice-5',
    title: 'লাইব্রেরি সময়সূচি পরিবর্তন',
    content: 'নতুন লাইব্রেরি সময়সূচি: শনিবার হতে বৃহস্পতিবার সকাল ৯টা-বিকাল ৪টা। জুমার দিন সকাল ৯টা-দুপুর ১২টা। সকল শিক্ষার্থী নতুন সময়সূচি অনুসারে লাইব্রেরি ব্যবহার করবে।',
    date: '2025-03-12',
    priority: 'normal',
    audience: 'students',
    isPinned: false,
    hasAttachment: true,
    attachmentName: 'library-schedule.pdf',
  },
  {
    id: 'notice-6',
    title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
    content: 'আগামী ৫ই এপ্রিল বার্ষিক ক্রীড়া প্রতিযোগিতা অনুষ্ঠিত হবে। ইন্টার-হাউস ক্রিকেট, ফুটবল, ব্যাডমিন্টন ও দৌড় প্রতিযোগিতায় অংশগ্রহণে আগ্রহী শিক্ষার্থীরা শ্রেণি শিক্ষকের নিকট নাম দিন।',
    date: '2025-03-25',
    priority: 'important',
    audience: 'students',
    isPinned: false,
    hasAttachment: false,
  },
  {
    id: 'notice-7',
    title: 'ফি জমার শেষ তারিখ',
    content: 'মার্চ মাসের ফি জমার শেষ তারিখ ৩১শে মার্চ। সময়মত ফি জমা না দিলে জরিমানা প্রযোজ্য হবে। অনুগ্রহ করে সময়মত ফি পরিশোধ করুন। বিকাশ/নগদের মাধ্যমেও ফি জমা দেওয়া যাবে।',
    date: '2025-03-18',
    priority: 'urgent',
    audience: 'parents',
    isPinned: false,
    hasAttachment: true,
    attachmentName: 'fee-payment-guide.pdf',
  },
  {
    id: 'notice-8',
    title: 'স্কুল বাসের নতুন রুট',
    content: 'আগামী সপ্তাহ হতে স্কুল বাসের দুটি নতুন রুট চালু হবে — রুট ৫: বিয়নীবাজার সদর হতে একাডেমি এবং রুট ৬: দক্ষিণ দুর্গাপুর হতে একাডেমি। বিস্তারিত রুট ম্যাপ অফিস হতে সংগ্রহ করুন।',
    date: '2025-03-05',
    priority: 'normal',
    audience: 'parents',
    isPinned: false,
    hasAttachment: true,
    attachmentName: 'bus-route-map.pdf',
  },
];

// ──────────────────────────────────────────────
// Gallery
// ──────────────────────────────────────────────

export type GradientColor = 'emerald' | 'amber' | 'sky' | 'rose' | 'violet';

export interface GalleryImage {
  id: string;
  caption: string;
  gradient: GradientColor;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  description: string;
  coverGradient: GradientColor;
  createdAt: string;
  images: GalleryImage[];
}

const gradients: GradientColor[] = ['emerald', 'amber', 'sky', 'rose', 'violet'];

function generateImages(count: number, albumPrefix: string): GalleryImage[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${albumPrefix}-img-${i + 1}`,
    caption: `${albumPrefix.replace(/-/g, ' ')} photo ${i + 1}`,
    gradient: gradients[i % gradients.length],
  }));
}

export const sampleAlbums: GalleryAlbum[] = [
  {
    id: 'album-1',
    title: 'Annual Day 2025',
    description: 'Highlights from the Annual Day celebration — speeches, awards, and cultural performances.',
    coverGradient: 'emerald',
    createdAt: '2025-02-15',
    images: generateImages(8, 'annual-day'),
  },
  {
    id: 'album-2',
    title: 'Campus Photos',
    description: 'Beautiful views of our campus — classrooms, library, playground, and mosque.',
    coverGradient: 'amber',
    createdAt: '2025-01-20',
    images: generateImages(6, 'campus'),
  },
  {
    id: 'album-3',
    title: 'Eid Celebration',
    description: 'Eid ul-Fitr celebration at the madrasha — special prayers, food distribution, and joyous moments.',
    coverGradient: 'sky',
    createdAt: '2025-04-01',
    images: generateImages(5, 'eid-celebration'),
  },
  {
    id: 'album-4',
    title: 'Classroom Activities',
    description: 'Students engaged in learning — Hifz classes, science experiments, and group discussions.',
    coverGradient: 'violet',
    createdAt: '2025-03-10',
    images: generateImages(7, 'classroom'),
  },
];

// ──────────────────────────────────────────────
// Gradient CSS class helper
// ──────────────────────────────────────────────

export function getGradientClasses(color: GradientColor): string {
  const map: Record<GradientColor, string> = {
    emerald: 'bg-gradient-to-br from-emerald-400 to-stone-300 dark:from-emerald-600 dark:to-stone-700',
    amber: 'bg-gradient-to-br from-amber-400 to-stone-300 dark:from-amber-600 dark:to-stone-700',
    sky: 'bg-gradient-to-br from-sky-400 to-stone-300 dark:from-sky-600 dark:to-stone-700',
    rose: 'bg-gradient-to-br from-rose-400 to-stone-300 dark:from-rose-600 dark:to-stone-700',
    violet: 'bg-gradient-to-br from-violet-400 to-stone-300 dark:from-violet-600 dark:to-stone-700',
  };
  return map[color];
}

// ──────────────────────────────────────────────
// Date formatting helper
// ──────────────────────────────────────────────

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
