export const EFFECT_CATEGORIES = [
  { id: 'funny', name: 'Funny', emoji: '😂', color: '#ff7c45' },
  { id: 'crying', name: 'Crying', emoji: '😭', color: '#5c9cff' },
  { id: 'shouting', name: 'Shouting', emoji: '😱', color: '#ff3c6e' },
  { id: 'romantic', name: 'Romantic', emoji: '💕', color: '#ff6b9d' },
  { id: 'horror', name: 'Horror', emoji: '👻', color: '#9c6bff' },
  { id: 'action', name: 'Action', emoji: '💥', color: '#ff9c1a' },
  { id: 'cinematic', name: 'Cinematic', emoji: '🎬', color: '#22d3ee' },
  { id: 'glitch', name: 'Glitch', emoji: '⚡', color: '#7c5cfc' },
];

export const EFFECTS = [
  // FUNNY
  { id: 'f1', name: 'Cartoon Boing', category: 'funny', emoji: '🤸', price: 1.99, description: 'Stretchy cartoon bounce effect', downloads: 1240, featured: true },
  { id: 'f2', name: 'Slippery Slip', category: 'funny', emoji: '🍌', price: 1.49, description: 'Classic banana slip animation', downloads: 980 },
  { id: 'f3', name: 'Wobbly Zoom', category: 'funny', emoji: '🔍', price: 2.49, description: 'Jiggly zoom punch-in effect', downloads: 763 },
  { id: 'f4', name: 'Clown Pop', category: 'funny', emoji: '🤡', price: 0.99, description: 'Circus clown sound & overlay', downloads: 2100, featured: true },
  { id: 'f5', name: 'Funny Fart', category: 'funny', emoji: '💨', price: 0.49, description: 'Classic comedy fart sound fx', downloads: 3400 },

  // CRYING
  { id: 'c1', name: 'Ugly Cry', category: 'crying', emoji: '😭', price: 1.99, description: 'Dramatic crying overlay & tears', downloads: 1890, featured: true },
  { id: 'c2', name: 'Single Tear', category: 'crying', emoji: '😢', price: 1.49, description: 'Cinematic single tear drop', downloads: 1200 },
  { id: 'c3', name: 'Rainstorm Sob', category: 'crying', emoji: '🌧️', price: 2.99, description: 'Rain overlay with dramatic music', downloads: 870 },
  { id: 'c4', name: 'Anime Cry', category: 'crying', emoji: '😿', price: 2.49, description: 'Anime-style river tears', downloads: 2300, featured: true },

  // SHOUTING
  { id: 's1', name: 'Mega Scream', category: 'shouting', emoji: '😱', price: 1.99, description: 'Screen shake + scream overlay', downloads: 1560, featured: true },
  { id: 's2', name: 'Rage Mode', category: 'shouting', emoji: '🤬', price: 2.49, description: 'Red screen rage animation', downloads: 990 },
  { id: 's3', name: 'Shout Echo', category: 'shouting', emoji: '📣', price: 1.49, description: 'Echo reverb shout effect', downloads: 743 },
  { id: 's4', name: 'Shocked Face', category: 'shouting', emoji: '😲', price: 0.99, description: 'Home Alone face + scream', downloads: 4200, featured: true },

  // ROMANTIC
  { id: 'r1', name: 'Heart Rain', category: 'romantic', emoji: '💕', price: 1.99, description: 'Falling hearts overlay', downloads: 2100 },
  { id: 'r2', name: 'Pink Filter', category: 'romantic', emoji: '🌸', price: 1.49, description: 'Soft pink bloom filter', downloads: 1800, featured: true },
  { id: 'r3', name: 'Sparkle Love', category: 'romantic', emoji: '✨', price: 2.99, description: 'Glittery sparkle overlay', downloads: 1400 },

  // HORROR
  { id: 'h1', name: 'Jump Scare', category: 'horror', emoji: '👻', price: 2.99, description: 'Classic jump scare effect', downloads: 1890, featured: true },
  { id: 'h2', name: 'Bloody Screen', category: 'horror', emoji: '🩸', price: 2.49, description: 'Blood drip overlay', downloads: 1100 },
  { id: 'h3', name: 'Dark Vignette', category: 'horror', emoji: '🌑', price: 1.99, description: 'Creepy dark edge overlay', downloads: 830 },

  // ACTION
  { id: 'a1', name: 'Explosion FX', category: 'action', emoji: '💥', price: 3.99, description: 'Cinematic explosion overlay', downloads: 2800, featured: true },
  { id: 'a2', name: 'Bullet Time', category: 'action', emoji: '🔫', price: 3.49, description: 'Slow-mo bullet time effect', downloads: 1950 },
  { id: 'a3', name: 'Speed Ramp', category: 'action', emoji: '⚡', price: 2.99, description: 'Fast to slow speed ramp', downloads: 1670 },

  // CINEMATIC
  { id: 'ci1', name: 'Letterbox', category: 'cinematic', emoji: '🎬', price: 0.99, description: 'Cinematic black bar overlay', downloads: 5200, featured: true },
  { id: 'ci2', name: 'Film Grain', category: 'cinematic', emoji: '📽️', price: 1.99, description: 'Vintage film grain texture', downloads: 3100 },
  { id: 'ci3', name: 'Lens Flare', category: 'cinematic', emoji: '☀️', price: 2.49, description: 'Hollywood lens flare effect', downloads: 2400 },

  // GLITCH
  { id: 'g1', name: 'RGB Split', category: 'glitch', emoji: '🌈', price: 2.99, description: 'RGB color channel split', downloads: 3300, featured: true },
  { id: 'g2', name: 'Data Corrupt', category: 'glitch', emoji: '💾', price: 3.49, description: 'Digital corruption glitch', downloads: 2100 },
  { id: 'g3', name: 'TV Static', category: 'glitch', emoji: '📺', price: 1.99, description: 'Old TV static overlay', downloads: 1890 },
];

export const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.79 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 1580 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', rate: 15.2 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 130 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18.7 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.5 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 149 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'CA$', rate: 1.37 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.55 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5.05 },
];
