/** Trip day → hero image URL (Barcelona). */
export const DAY_IMAGES: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=1200&q=80",
  2: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=1200&q=80",
  3: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=1200&q=80",
  4: "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80",
  5: "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80",
};

/** Static crop focus for 16:9 hero strip (tuned per photo). */
export const DAY_IMAGE_FOCUS: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "50% 45%",
  2: "50% 35%",
  3: "50% 40%",
  4: "50% 55%",
  5: "50% 50%",
};
