import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { XMLParser } from 'fast-xml-parser';
import he from 'he';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const outputDir = path.join(publicDir, 'facebook');
const outputFile = path.join(outputDir, 'index.xml');
const outputFileCatalogo = path.join(outputDir, 'catalogo.xml');
const cacheDir = path.join(rootDir, '.cache');
const sourceCacheFile = path.join(cacheDir, 'facebook-source-cache.xml');
const geocodeCacheFile = path.join(cacheDir, 'facebook-geocode-cache.json');
const discardLogFile = path.join(cacheDir, 'facebook-discarded.log');

const SOURCE_XML_URL = process.env.FACEBOOK_SOURCE_XML_URL;
const BASE_PUBLIC_URL = (process.env.FACEBOOK_BASE_PUBLIC_URL || 'https://st.khaua.com.br').replace(/\/+$/, '');
const FETCH_TIMEOUT_MS = Number(process.env.FACEBOOK_FETCH_TIMEOUT_MS || '12000');
const FETCH_RETRIES = Number(process.env.FACEBOOK_FETCH_RETRIES || '2');
const USER_AGENT =
  process.env.FACEBOOK_GEOCODER_USER_AGENT ||
  'st-facebook-feed-bot/1.0 (+https://st.khaua.com.br/facebook)';

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  allowBooleanAttributes: true,
  parseTagValue: false,
  trimValues: true,
});

function asArray(value) {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
}

function firstNonEmpty(...values) {
  for (const value of values) {
    const text = String(value ?? '').trim();
    if (text) return text;
  }
  return '';
}

function stripHtml(value) {
  const decoded = he.decode(String(value ?? ''));
  return decoded
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cdata(value) {
  return `<![CDATA[${String(value ?? '').replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

function normalizeAvailability(rawAvailability, rawListingType) {
  const joined = `${rawAvailability || ''} ${rawListingType || ''}`.toLowerCase();
  if (/\b(rent|rental|loca|alug|for_rent)\b/.test(joined)) return 'for_rent';
  return 'for_sale';
}

function normalizePropertyType(value) {
  const text = String(value || '').toLowerCase();
  if (!text) return 'house';
  if (text.includes('apart')) return 'apartment';
  if (text.includes('terreno') || text.includes('lote')) return 'land';
  if (text.includes('comercial')) return 'commercial';
  if (text.includes('sobrado') || text.includes('casa')) return 'house';
  return 'house';
}

function normalizePrice(raw) {
  const value = String(raw ?? '').trim();
  if (!value) return '';
  const digits = value.replace(/[^\d,.\-]/g, '');
  if (!digits) return '';

  let number = Number(digits.replace(/\./g, '').replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0) return '';
  number = Math.round(number);
  return `${number} BRL`;
}

function normalizeAbsoluteUrl(url, baseUrl = BASE_PUBLIC_URL) {
  const value = String(url ?? '').trim();
  if (!value) return '';
  try {
    const absolute = new URL(value, baseUrl);
    if (!/^https?:$/i.test(absolute.protocol)) return '';
    absolute.protocol = 'https:';
    return absolute.toString();
  } catch {
    return '';
  }
}

function parseCoordinate(value) {
  const text = String(value ?? '').trim().replace(',', '.');
  const num = Number(text);
  return Number.isFinite(num) ? num : null;
}

function deterministicJitter(id, key) {
  const digest = crypto.createHash('sha256').update(`${id}:${key}`).digest('hex');
  const int = Number.parseInt(digest.slice(0, 8), 16);
  const normalized = int / 0xffffffff;
  return normalized * 0.002 - 0.001; // -0.001 .. 0.001
}

function privacyCoordinates(lat, lng, id) {
  const latJitter = deterministicJitter(id, 'lat');
  const lngJitter = deterministicJitter(id, 'lng');
  return {
    latitude: Number((lat + latJitter).toFixed(6)),
    longitude: Number((lng + lngJitter).toFixed(6)),
  };
}

function extractAddress(source) {
  const address = source.address || source.endereco || {};
  const components = asArray(address.component);
  const map = {};
  for (const item of components) {
    if (!item || typeof item !== 'object') continue;
    const key = String(item.name || '').toLowerCase().trim();
    const value = firstNonEmpty(item['#text'], item.text, item.value);
    if (key && value) map[key] = value;
  }

  return {
    neighborhood: firstNonEmpty(
      source.neighborhood,
      source.bairro,
      map.neighborhood,
      map.bairro,
      address.neighborhood,
      address.bairro,
      map.addr1,
      source.addr1,
      address.addr1
    ),
    city: firstNonEmpty(source.city, source.cidade, map.city, map.cidade, address.city, address.cidade),
    region: firstNonEmpty(
      source.region,
      source.estado,
      source.uf,
      map.region,
      map.estado,
      map.uf,
      address.region,
      address.estado,
      address.uf
    ),
    country: 'BR',
    cep: firstNonEmpty(
      source.cep,
      source.zipcode,
      source.postal_code,
      map.postal_code,
      map.cep,
      map.zipcode,
      address.cep,
      address.zipcode
    ),
  };
}

function extractImages(source) {
  const urls = new Set();
  const imageNodes = [
    ...asArray(source.image),
    ...asArray(source.images?.image),
    ...asArray(source.images?.url),
    ...asArray(source.photos?.photo),
    ...asArray(source.photos?.url),
    ...asArray(source.fotos?.foto),
    ...asArray(source.fotos?.url),
  ];

  for (const item of imageNodes) {
    if (!item) continue;
    const raw = typeof item === 'object' ? firstNonEmpty(item.url, item.loc, item.href, item['#text']) : String(item);
    const normalized = normalizeAbsoluteUrl(raw);
    if (normalized) urls.add(normalized);
  }
  return [...urls];
}

function extractListingUrl(source) {
  return normalizeAbsoluteUrl(
    firstNonEmpty(source.url, source.link, source.listing_url, source.permalink, source.website)
  );
}

function pickListings(parsed) {
  if (!parsed || typeof parsed !== 'object') return [];
  if (Array.isArray(parsed.listings?.listing)) return parsed.listings.listing;
  if (parsed.listings?.listing) return asArray(parsed.listings.listing);
  if (Array.isArray(parsed.listing)) return parsed.listing;
  if (parsed.listing) return asArray(parsed.listing);
  for (const key of Object.keys(parsed)) {
    const node = parsed[key];
    if (node?.listing) return asArray(node.listing);
  }
  return [];
}

async function fetchWithRetry(url, retries, timeoutMs) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { Accept: 'application/xml,text/xml;q=0.9,*/*;q=0.8' },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} ao buscar XML de origem`);
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 400 * (attempt + 1)));
      }
    } finally {
      clearTimeout(timeout);
    }
  }
  throw lastError;
}

async function readJson(filePath, fallback = {}) {
  try {
    const text = await fs.readFile(filePath, 'utf8');
    return JSON.parse(text);
  } catch {
    return fallback;
  }
}

async function geocode(query, geocodeCache) {
  const key = query.toLowerCase().trim();
  if (!key) return null;
  if (geocodeCache[key]) return geocodeCache[key];

  try {
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', query);
    url.searchParams.set('format', 'jsonv2');
    url.searchParams.set('limit', '1');

    const response = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' },
    });
    if (!response.ok) return null;
    const results = await response.json();
    const first = results?.[0];
    if (!first) return null;
    const coords = {
      latitude: Number(first.lat),
      longitude: Number(first.lon),
    };
    if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) return null;
    if (Math.abs(coords.latitude) < 0.000001 && Math.abs(coords.longitude) < 0.000001) return null;
    geocodeCache[key] = coords;
    return coords;
  } catch {
    return null;
  }
}

async function resolveCoordinates(source, address, geocodeCache) {
  const directLat = parseCoordinate(firstNonEmpty(source.latitude, source.lat, source.geo?.lat, source.location?.lat));
  const directLng = parseCoordinate(firstNonEmpty(source.longitude, source.lng, source.lon, source.geo?.lng, source.location?.lng));
  if (
    directLat != null &&
    directLng != null &&
    !(Math.abs(directLat) < 0.000001 && Math.abs(directLng) < 0.000001)
  ) {
    return { latitude: directLat, longitude: directLng };
  }

  const queryA = [address.neighborhood, address.city, address.region, 'Brasil'].filter(Boolean).join(', ');
  const byNeighborhood = await geocode(queryA, geocodeCache);
  if (byNeighborhood) return byNeighborhood;

  const cep = String(address.cep || '').replace(/\D/g, '');
  if (cep.length === 8) {
    const byCep = await geocode(`${cep}, Brasil`, geocodeCache);
    if (byCep) return byCep;
  }

  const queryCity = [address.city, address.region, 'Brasil'].filter(Boolean).join(', ');
  const byCity = await geocode(queryCity, geocodeCache);
  if (byCity) return byCity;

  return null;
}

function buildListingXml(item) {
  const imagesXml = item.images.map((img) => `    <image>\n      <url>${escapeXml(img)}</url>\n    </image>`).join('\n');
  return [
    '  <listing>',
    `    <home_listing_id>${escapeXml(item.home_listing_id)}</home_listing_id>`,
    `    <name>${cdata(item.name)}</name>`,
    `    <availability>${escapeXml(item.availability)}</availability>`,
    `    <description>${cdata(item.description)}</description>`,
    '    <address format="simple">',
    `      <component name="addr1">${escapeXml(item.address.addr1)}</component>`,
    `      <component name="city">${escapeXml(item.address.city)}</component>`,
    `      <component name="region">${escapeXml(item.address.region)}</component>`,
    '      <component name="country">BR</component>',
    '    </address>',
    `    <neighborhood>${cdata(item.neighborhood)}</neighborhood>`,
    `    <latitude>${item.latitude.toFixed(6)}</latitude>`,
    `    <longitude>${item.longitude.toFixed(6)}</longitude>`,
    imagesXml,
    `    <price>${escapeXml(item.price)}</price>`,
    `    <property_type>${escapeXml(item.property_type)}</property_type>`,
    `    <url>${escapeXml(item.url)}</url>`,
    '  </listing>',
  ].join('\n');
}

function toFacebookListing(source) {
  const homeListingId = firstNonEmpty(source.home_listing_id, source.id, source.codigo, source.code, source.reference);
  const name = stripHtml(firstNonEmpty(source.name, source.title, source.titulo, source.imovel_titulo));
  const description = stripHtml(firstNonEmpty(source.description, source.descricao, source.summary, source.resumo));
  const address = extractAddress(source);
  const images = extractImages(source);
  const price = normalizePrice(firstNonEmpty(source.price, source.valor, source.sale_price, source.rent_price));
  const url = extractListingUrl(source);
  const availability = normalizeAvailability(source.availability, firstNonEmpty(source.listing_type, source.negocio, source.business_type));
  const propertyType = normalizePropertyType(firstNonEmpty(source.property_type, source.tipo, source.type));

  return {
    home_listing_id: homeListingId,
    name,
    description,
    neighborhood: address.neighborhood || address.city || 'Região',
    address: {
      addr1: address.neighborhood || address.city || 'Região',
      city: address.city || 'Não informado',
      region: address.region || 'SP',
      country: 'BR',
      cep: address.cep || '',
    },
    availability,
    property_type: propertyType,
    images,
    price,
    url,
    source,
  };
}

function isValidListing(listing) {
  if (!listing.home_listing_id) return 'sem home_listing_id';
  if (!listing.price) return 'sem preço válido';
  if (!listing.url) return 'sem URL válida';
  if (!listing.images.length) return 'sem imagem válida';
  if (!listing.latitude || !listing.longitude) return 'sem latitude/longitude';
  return null;
}

async function main() {
  await fs.mkdir(cacheDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });

  if (!SOURCE_XML_URL) {
    const existing = await fs.readFile(outputFile, 'utf8').catch(() => null);
    if (existing) {
      console.warn('[facebook-feed] FACEBOOK_SOURCE_XML_URL ausente; mantendo XML existente.');
      return;
    }
    throw new Error('FACEBOOK_SOURCE_XML_URL não definido e nenhum feed existente encontrado.');
  }

  let sourceXml;
  try {
    sourceXml = await fetchWithRetry(SOURCE_XML_URL, FETCH_RETRIES, FETCH_TIMEOUT_MS);
    await fs.writeFile(sourceCacheFile, sourceXml, 'utf8');
  } catch (error) {
    sourceXml = await fs.readFile(sourceCacheFile, 'utf8').catch(() => {
      throw new Error(`Falha ao buscar XML e sem cache local: ${error.message}`);
    });
    console.warn('[facebook-feed] usando cache local da origem após falha de fetch:', error.message);
  }

  const parsed = parser.parse(sourceXml);
  const sourceListings = pickListings(parsed);
  if (!sourceListings.length) {
    throw new Error('Nenhum <listing> encontrado no XML de origem.');
  }

  const geocodeCache = await readJson(geocodeCacheFile, {});
  const discarded = [];
  const transformed = [];

  for (const source of sourceListings) {
    const listing = toFacebookListing(source);
    const coords = await resolveCoordinates(source, listing.address, geocodeCache);
    if (coords) {
      const safe = privacyCoordinates(coords.latitude, coords.longitude, listing.home_listing_id || listing.url || 'seed');
      listing.latitude = safe.latitude;
      listing.longitude = safe.longitude;
    }

    const invalidReason = isValidListing(listing);
    if (invalidReason) {
      discarded.push(`[${new Date().toISOString()}] ${listing.home_listing_id || 'sem_id'} -> ${invalidReason}`);
      continue;
    }
    transformed.push(listing);
  }

  await fs.writeFile(geocodeCacheFile, JSON.stringify(geocodeCache, null, 2), 'utf8');
  if (discarded.length) {
    await fs.appendFile(discardLogFile, `${discarded.join('\n')}\n`, 'utf8');
  }

  const listingsXml = transformed.map(buildListingXml).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<listings>\n${listingsXml}\n</listings>\n`;

  await fs.writeFile(outputFile, xml, 'utf8');
  await fs.writeFile(outputFileCatalogo, xml, 'utf8');

  console.log(`[facebook-feed] origem: ${sourceListings.length} listings`);
  console.log(`[facebook-feed] saída: ${transformed.length} listings válidos`);
  console.log(`[facebook-feed] descartados: ${discarded.length}`);
  console.log(`[facebook-feed] gerado em ${path.relative(rootDir, outputFile)}`);
}

main().catch((error) => {
  console.error('[facebook-feed] erro fatal:', error.message);
  process.exitCode = 1;
});
