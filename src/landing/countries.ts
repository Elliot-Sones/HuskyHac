export type SupportedCountry = {
  flag: string;
  language: string;
  place: string;
  subtitle: string;
  centroid: [number, number];
  slug: string;
};

export type TeaserCountry = {
  flag: string;
  language: string;
};

export const SUPPORTED: Record<string, SupportedCountry> = {
  France: {
    flag: '🇫🇷',
    language: 'French',
    place: 'Charles de Gaulle, Paris',
    subtitle: 'French · A1 → B2 routes',
    centroid: [2.3522, 48.8566],
    slug: 'france',
  },
};

export const TEASERS: Record<string, TeaserCountry> = {
  Japan: { flag: '🇯🇵', language: 'Japanese' },
  Spain: { flag: '🇪🇸', language: 'Spanish' },
  Italy: { flag: '🇮🇹', language: 'Italian' },
  Germany: { flag: '🇩🇪', language: 'German' },
  Mexico: { flag: '🇲🇽', language: 'Spanish' },
  Brazil: { flag: '🇧🇷', language: 'Portuguese' },
  China: { flag: '🇨🇳', language: 'Mandarin' },
  Portugal: { flag: '🇵🇹', language: 'Portuguese' },
  'South Korea': { flag: '🇰🇷', language: 'Korean' },
  Netherlands: { flag: '🇳🇱', language: 'Dutch' },
  India: { flag: '🇮🇳', language: 'Hindi' },
  Greece: { flag: '🇬🇷', language: 'Greek' },
  Turkey: { flag: '🇹🇷', language: 'Turkish' },
  Egypt: { flag: '🇪🇬', language: 'Arabic' },
  Russia: { flag: '🇷🇺', language: 'Russian' },
};

export const COUNTRIES_GEOJSON_URL =
  'https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson';
