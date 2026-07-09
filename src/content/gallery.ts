/**
 * Gallery Section Content
 * Static content for the gallery section and page
 */

// Gallery Item Interface
export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  isPremium?: boolean;
  description: string;
}

// Gallery Categories
export const galleryCategories = [
  { id: 'all', labelKey: 'gallery.categories.all' },
  { id: 'portraits', labelKey: 'gallery.categories.portraits' },
  { id: 'artistic', labelKey: 'gallery.categories.artistic' },
  { id: 'lifestyle', labelKey: 'gallery.categories.lifestyle' },
  { id: 'exclusive', labelKey: 'gallery.categories.exclusive' },
] as const;

// Gallery Items
export const galleryItems: GalleryItem[] = [
  {
    id: '1',
    title: 'Golden Hour Portrait',
    category: 'portraits',
    image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Capturing elegance in natural light',
  },
  {
    id: '2',
    title: 'Silhouette Dreams',
    category: 'artistic',
    image: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Artistic expression through shadow',
  },
  {
    id: '3',
    title: 'Urban Elegance',
    category: 'lifestyle',
    image: 'https://images.pexels.com/photos/1021696/pexels-photo-1021696.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Modern sophistication in the city',
  },
  {
    id: '4',
    title: 'Eastern Mystique',
    category: 'portraits',
    image: 'https://images.pexels.com/photos/2889126/pexels-photo-2889126.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Where tradition meets modernity',
    isPremium: true,
  },
  {
    id: '5',
    title: 'Abstract Beauty',
    category: 'artistic',
    image: 'https://images.pexels.com/photos/1028157/pexels-photo-1028157.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Art in its purest form',
  },
  {
    id: '6',
    title: 'Natural Grace',
    category: 'lifestyle',
    image: 'https://images.pexels.com/photos/1758845/pexels-photo-1758845.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Effortless beauty',
  },
  {
    id: '7',
    title: 'Intimate Moments',
    category: 'exclusive',
    image: 'https://images.pexels.com/photos/12278983/pexels-photo-12278983.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Precious captured moments',
    isPremium: true,
  },
  {
    id: '8',
    title: 'Midnight Elegance',
    category: 'exclusive',
    image: 'https://images.pexels.com/photos/1537635/pexels-photo-1537635.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'The allure of the night',
    isPremium: true,
  },
  {
    id: '9',
    title: 'Desert Rose',
    category: 'portraits',
    image: 'https://images.pexels.com/photos/1914159/pexels-photo-1914159.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Beauty that blooms in harsh conditions',
  },
  {
    id: '10',
    title: 'Serenity',
    category: 'artistic',
    image: 'https://images.pexels.com/photos/1642225/pexels-photo-1642225.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Peace captured in frame',
  },
  {
    id: '11',
    title: 'Cultural Heritage',
    category: 'lifestyle',
    image: 'https://images.pexels.com/photos/1629785/pexels-photo-1629785.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Celebrating tradition',
  },
  {
    id: '12',
    title: 'Crown Jewels',
    category: 'exclusive',
    image: 'https://images.pexels.com/photos/1545734/pexels-photo-1545734.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'The pinnacle of elegance',
    isPremium: true,
  },
];

// Gallery Section Display Limit
export const galleryConfig = {
  sectionDisplayLimit: 6,
  pageDisplayLimit: 12,
} as const;

// Full Gallery Content Export
export const galleryContent = {
  categories: galleryCategories,
  items: galleryItems,
  config: galleryConfig,
} as const;

export type GalleryContent = typeof galleryContent;
