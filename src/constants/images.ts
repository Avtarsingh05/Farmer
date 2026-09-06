/**
 * KisanMitra Central Image Assets & Fallback Handlers
 * Uses high-resolution, authentic agricultural imagery from Unsplash.
 */

export const DEFAULT_PRODUCE_IMAGE =
  'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80';

export const DEFAULT_FARMER_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';

export const DEFAULT_BUYER_AVATAR =
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80';

export const DEFAULT_ADMIN_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80';

export const ABOUT_TEAM_IMAGE =
  'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=1200&auto=format&fit=crop&q=80';

export const HERO_FARMER_IMAGE =
  'https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=900&auto=format&fit=crop&q=80';

export const HERO_PRODUCE_IMAGE =
  'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=900&auto=format&fit=crop&q=80';

export const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  vegetables: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
  fruits: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
  grains: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
  pulses: 'https://images.unsplash.com/photo-1585642673356-829424c5384e?w=800&auto=format&fit=crop&q=80',
  oilseeds: 'https://images.unsplash.com/photo-1508847154043-be5407fcaa5a?w=800&auto=format&fit=crop&q=80',
  spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&auto=format&fit=crop&q=80',
  dairy: 'https://images.unsplash.com/photo-1527153857715-3908f2ae5e81?w=800&auto=format&fit=crop&q=80',
  other: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80',
};

/**
 * Returns a fitting produce image based on category or default
 */
export function getProduceFallbackImage(category?: string): string {
  if (!category) return DEFAULT_PRODUCE_IMAGE;
  const key = category.toLowerCase().trim();
  for (const [catKey, url] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (key.includes(catKey)) {
      return url;
    }
  }
  return DEFAULT_PRODUCE_IMAGE;
}

/**
 * Standard onError image handler to prevent broken image icons
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl: string = DEFAULT_PRODUCE_IMAGE
) {
  const target = event.currentTarget;
  if (target.src !== fallbackUrl) {
    target.src = fallbackUrl;
  }
}
