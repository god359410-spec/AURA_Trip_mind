import { GeoLocation } from './itinerary.types';

export interface HotelRecommendation {
  id: string;
  name: string;
  starRating: number;
  pricePerNight: number;
  totalPrice: number;
  currency: string;
  location: GeoLocation;
  amenities: string[];
  accessibilityFeatures: string[];
  images: string[];
  bookingUrl?: string;
  distanceFromCenter: number;
  aiReasoningNote: string;
  rating: number;
  reviewCount?: number;
  breakfastIncluded: boolean;
  freeCancellation: boolean;
  roomTypes: string[];
  highlights: string[];
}
