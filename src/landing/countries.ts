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
    slug: 'airport-france',
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

export function flagFromIsoA2(iso: string | undefined | null): string {
  if (!iso || iso.length !== 2 || iso === '-9' || iso === '-99') return '🏳️';
  const upper = iso.toUpperCase();
  if (!/^[A-Z]{2}$/.test(upper)) return '🏳️';
  const A = 'A'.charCodeAt(0);
  const base = 0x1f1e6;
  return String.fromCodePoint(base + upper.charCodeAt(0) - A, base + upper.charCodeAt(1) - A);
}

export function countrySlug(name: string): string {
  return `airport-${name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')}`;
}
