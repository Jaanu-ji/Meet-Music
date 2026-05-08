export interface Artist {
  id: string;
  full_name: string;
  profile_photo?: string;
  bio: string;
  city: string;
  country: string;
  experience_years: number;
  instruments: string[];
  genres: string[];
  languages: string[];
  available_for_hire: boolean;
  available_for_teaching: boolean;
  online_classes: boolean;
  offline_classes: boolean;
  rating: number;
  verified_badge: boolean;
  total_gigs?: number;
  created_at?: string;
}

export const INSTRUMENTS = [
  'Singing',
  'Guitar',
  'Piano',
  'Keyboard',
  'Violin',
  'Flute',
  'Tabla',
  'Drums',
  'DJ',
  'Music Production',
  'Rap',
  'Beatboxing',
  'Harmonium',
  'Bass Guitar',
  'Ukulele',
  'Saxophone',
] as const;

export const GENRES = [
  'Pop',
  'Rock',
  'Jazz',
  'Classical',
  'Hip Hop',
  'R&B',
  'Country',
  'Electronic',
  'Folk',
  'Blues',
  'Reggae',
  'Indie',
] as const;

export const LANGUAGES = [
  'English',
  'Hindi',
  'Spanish',
  'French',
  'German',
  'Italian',
  'Portuguese',
  'Chinese',
  'Japanese',
  'Korean',
] as const;

export const DANCE_STYLES = [
  'Bharatnatyam',
  'Kathak',
  'Odissi',
  'Kuchipudi',
  'Manipuri',
  'Classical Dance',
  'Bollywood',
  'Hip Hop',
  'Contemporary',
  'Jazz',
  'Ballet',
  'Folk Dance',
] as const;

export const DANCE_GENRES = [
  'Classical',
  'Semi-Classical',
  'Contemporary',
  'Folk',
  'Fusion',
  'Bollywood',
  'Street',
  'Western',
] as const;
