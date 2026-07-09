/**
 * About Section Content
 * Static content for the about section and page
 */

// Core Values
export interface ValueItem {
  icon: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
}

export const aboutValues: ValueItem[] = [
  {
    icon: 'Eye',
    title: { en: 'Artistic Vision', ar: 'رؤية فنية' },
    description: { en: 'Every image tells a story of beauty, grace, and timeless elegance', ar: 'كل صورة تروي قصة الجمال والرقة والأناقة الخالدة' },
  },
  {
    icon: 'Heart',
    title: { en: 'Authentic Expression', ar: 'تعبير أصيل' },
    description: { en: 'Capturing genuine moments that resonate with emotional depth', ar: 'التقاط لحظات حقيقية تتردد بعمق عاطفي' },
  },
  {
    icon: 'Award',
    title: { en: 'Excellence', ar: 'التميز' },
    description: { en: 'Pursuing perfection in every detail and composition', ar: 'السعي للكمال في كل التفاصيل والتكوين' },
  },
  {
    icon: 'Sparkles',
    title: { en: 'Innovation', ar: 'الابتكار' },
    description: { en: 'Pushing creative boundaries while honoring timeless traditions', ar: 'تجاوز الحدود الإبداعية مع احترام التقاليد الخالدة' },
  },
];

// Team Members
export interface TeamMember {
  icon: string;
  role: { en: string; ar: string };
  description: { en: string; ar: string };
}

export const aboutTeam: TeamMember[] = [
  {
    icon: 'Camera',
    role: { en: 'Creative Director', ar: 'مدير إبداعي' },
    description: { en: 'A visionary artist with over 15 years of experience in fine art photography, bringing a unique perspective that blends Eastern aesthetics with contemporary elegance.', ar: 'فنان رؤيوي بخبرة تزيد عن 15 عاماً في التصوير الفني، يجلب منظوراً فريداً يمزج بين الجماليات الشرقية والأناقة المعاصرة.' },
  },
  {
    icon: 'Users',
    role: { en: 'Lead Photographers', ar: 'مصورون رئيسيون' },
    description: { en: 'Our team of skilled photographers specialize in capturing the essence of sophistication, each bringing their unique artistic voice to every session.', ar: 'فريقنا من المصورين الماهرين يتخصصون في التقاط جوهر الترف، كل منهم يجلب صوته الفني الفريد لكل جلسة.' },
  },
  {
    icon: 'Sparkles',
    role: { en: 'Art Directors', ar: 'مديرو فنون' },
    description: { en: 'Our art directors meticulously craft each visual narrative, ensuring every composition reflects the highest standards of artistic excellence.', ar: 'مديروا الفن لدينا يصممون بدقة كل سرد بصري، ضامنين أن كل تكوين يعكس أعلى معايير التميز الفني.' },
  },
];

// Statistics
export interface StatItem {
  value: string;
  label: { en: string; ar: string };
}

export const aboutStats: StatItem[] = [
  { value: '12+', label: { en: 'Years of Excellence', ar: 'سنوات من التميز' } },
  { value: '5000+', label: { en: 'Curated Images', ar: 'صور مدققة' } },
  { value: '2500+', label: { en: 'Exclusive Members', ar: 'أعضاء حصريون' } },
  { value: '99%', label: { en: 'Satisfaction Rate', ar: 'نسبة الرضا' } },
];

// Team Section Heading
export const teamSectionHeading = {
  en: 'Behind every stunning image is a dedicated team of professionals committed to excellence',
  ar: 'خلف كل صورة مذهلة فريق متفانٍ من المحترفين ملتزم بالتميز',
} as const;

// About Page Image
export const aboutImage = {
  src: 'https://images.pexels.com/photos/2889126/pexels-photo-2889126.jpeg?auto=compress&cs=tinysrgb&w=800',
  alt: 'About Eastern Jewel',
} as const;

// Core Values Section Heading
export const valuesSectionHeading = {
  en: 'Our Core Values',
  ar: 'قيمنا الأساسية',
} as const;

// Full About Content Export
export const aboutContent = {
  values: aboutValues,
  team: aboutTeam,
  stats: aboutStats,
  teamSectionHeading,
  valuesSectionHeading,
  image: aboutImage,
} as const;

export type AboutContent = typeof aboutContent;
