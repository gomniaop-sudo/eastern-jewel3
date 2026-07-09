/**
 * Premium Section Content
 * Static content for the premium section and page
 */

// Premium Feature Interface
export interface PremiumFeature {
  icon: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
}

// Premium Features (used on both section and page)
export const premiumFeatures: PremiumFeature[] = [
  {
    icon: 'Star',
    title: { en: 'Exclusive Galleries', ar: 'معارض حصرية' },
    description: { en: 'Access to members-only collections featuring our most stunning work', ar: 'وصول للمجموعات الحصرية للأعضاء التي تضم أفضل أعمالنا' },
  },
  {
    icon: 'Zap',
    title: { en: 'HD Content', ar: 'محتوى عالي الجودة' },
    description: { en: 'High-resolution images and videos in stunning quality', ar: 'صور وفيديوهات عالية الدقة بجودة مذهلة' },
  },
  {
    icon: 'Shield',
    title: { en: 'Priority Updates', ar: 'تحديثات أولوية' },
    description: { en: 'Be the first to see new releases and exclusive content', ar: 'كن أول من يرى الإصدارات الجديدة والمحتوى الحصري' },
  },
  {
    icon: 'Headphones',
    title: { en: 'Premium Support', ar: 'دعم مميز' },
    description: { en: 'Dedicated support for all your inquiries and requests', ar: 'دعم مخصص لجميع استفساراتك وطلباتك' },
  },
];

// Premium Tier Interface
export interface PremiumTier {
  name: { en: string; ar: string };
  price: { en: string; ar: string };
  popular?: boolean;
  features: { en: string; ar: string }[];
}

// Premium Tiers (Pricing Plans)
export const premiumTiers: PremiumTier[] = [
  {
    name: { en: 'Silver', ar: 'فضي' },
    price: { en: '$19/month', ar: '19$ / شهر' },
    features: [
      { en: 'Access to standard galleries', ar: 'الوصول للمعارض القياسية' },
      { en: 'Regular updates', ar: 'تحديثات منتظمة' },
      { en: 'Email support', ar: 'دعم عبر البريد' },
      { en: '1 device access', ar: 'وصول من جهاز واحد' },
    ],
  },
  {
    name: { en: 'Gold', ar: 'ذهبي' },
    price: { en: '$49/month', ar: '49$ / شهر' },
    popular: true,
    features: [
      { en: 'All Standard galleries', ar: 'جميع المعارض القياسية' },
      { en: 'Exclusive premium content', ar: 'محتوى حصري مميز' },
      { en: 'HD quality downloads', ar: 'تنزيلات بجودة عالية' },
      { en: 'Priority updates', ar: 'تحديثات أولوية' },
      { en: 'Email support', ar: 'دعم عبر البريد' },
      { en: '3 device access', ar: 'وصول من 3 أجهزة' },
    ],
  },
  {
    name: { en: 'Diamond', ar: 'ماسي' },
    price: { en: '$99/month', ar: '99$ / شهر' },
    features: [
      { en: 'Everything in Gold', ar: 'كل شيء في الذهبي' },
      { en: 'Early access to new content', ar: 'وصول مبكر للمحتوى الجديد' },
      { en: '4K quality downloads', ar: 'تنزيلات بجودة 4K' },
      { en: 'Behind the scenes content', ar: 'محتوى ما وراء الكواليس' },
      { en: 'Priority live chat support', ar: 'دعم محادثة مباشرة أولوية' },
      { en: 'Unlimited devices', ar: 'أجهزة غير محدودة' },
      { en: 'Exclusive member events', ar: 'فعليات حصرية للأعضاء' },
    ],
  },
];

// Premium Section Background Image
export const premiumSectionImage = {
  src: 'https://images.pexels.com/photos/1545734/pexels-photo-1545734.jpeg?auto=compress&cs=tinysrgb&w=800',
} as const;

// "Most Popular" Badge
export const popularBadge = {
  en: 'Most Popular',
  ar: 'الأكثر شعبية',
  icon: 'Star',
} as const;

// Whats Included Section Heading
export const whatsIncludedHeading = {
  en: "What's Included",
  ar: 'ما هو مشمول',
} as const;

// Full Premium Content Export
export const premiumContent = {
  features: premiumFeatures,
  tiers: premiumTiers,
  sectionImage: premiumSectionImage,
  popularBadge,
  whatsIncludedHeading,
} as const;

export type PremiumContent = typeof premiumContent;
