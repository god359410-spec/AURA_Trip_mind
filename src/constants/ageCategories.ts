export const AGE_CATEGORIES = [
  { range: '< 5', label: 'Infant/Toddler', description: 'Stroller access, nap times, short attention spans' },
  { range: '5–12', label: 'Child', description: 'Kid-friendly activities, early dinners, educational' },
  { range: '13–17', label: 'Teen', description: 'Social, tech-friendly, moderate adventure' },
  { range: '18–35', label: 'Young Adult', description: 'Adventure, nightlife, budget-conscious' },
  { range: '36–55', label: 'Adult', description: 'Balanced, comfort, cultural experiences' },
  { range: '56–70', label: 'Senior', description: 'Moderate pace, comfort-first, cultural/historical' },
  { range: '70+', label: 'Elderly', description: 'Accessibility priority, medical proximity, low-exertion' },
];

export const INTEREST_OPTIONS = [
  'History & Culture', 'Food & Dining', 'Adventure & Sports', 'Nature & Wildlife',
  'Art & Museums', 'Shopping', 'Nightlife', 'Beach & Water', 'Hiking',
  'Photography', 'Architecture', 'Local Markets', 'Theme Parks', 'Spa & Wellness',
  'Music & Entertainment', 'Religion & Spirituality', 'Cycling', 'Cooking Classes',
];

export const TRIP_STYLES = [
  { value: 'adventure', label: 'Adventure', icon: '🏔️', description: 'Hiking, sports, outdoor thrills' },
  { value: 'relaxation', label: 'Relaxation', icon: '🌅', description: 'Beaches, spas, slow travel' },
  { value: 'culture', label: 'Culture', icon: '🏛️', description: 'History, art, local experiences' },
  { value: 'food', label: 'Food & Dining', icon: '🍜', description: 'Culinary exploration' },
  { value: 'mixed', label: 'Mixed', icon: '✨', description: 'Best of everything' },
  { value: 'luxury', label: 'Luxury', icon: '💎', description: 'Premium experiences' },
  { value: 'budget', label: 'Budget', icon: '💰', description: 'Maximum value' },
];

export const ACCOMMODATION_TYPES = [
  { value: 'hostel', label: 'Hostel/Backpacker', priceIndicator: '$' },
  { value: 'budget', label: 'Budget Hotel', priceIndicator: '$$' },
  { value: 'mid-range', label: 'Mid-Range Hotel', priceIndicator: '$$$' },
  { value: 'boutique', label: 'Boutique Hotel', priceIndicator: '$$$$' },
  { value: 'luxury', label: 'Luxury / 5-Star', priceIndicator: '$$$$$' },
];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿', name: 'Thai Baht' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export const DIETARY_OPTIONS: { value: string; label: string; emoji: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian', emoji: '🥗' },
  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
  { value: 'halal', label: 'Halal', emoji: '☪️' },
  { value: 'kosher', label: 'Kosher', emoji: '✡️' },
  { value: 'gluten-free', label: 'Gluten-Free', emoji: '🌾' },
  { value: 'nut-free', label: 'Nut-Free', emoji: '🚫🥜' },
  { value: 'dairy-free', label: 'Dairy-Free', emoji: '🥛' },
  { value: 'diabetic-friendly', label: 'Diabetic-Friendly', emoji: '💉' },
];

export const ACCESSIBILITY_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: 'wheelchair', label: 'Wheelchair Access', icon: '♿' },
  { value: 'low_mobility', label: 'Low Mobility', icon: '🚶' },
  { value: 'vision_impaired', label: 'Vision Impaired', icon: '👁️' },
  { value: 'hearing_impaired', label: 'Hearing Impaired', icon: '👂' },
  { value: 'cognitive', label: 'Cognitive Support', icon: '🧠' },
];
