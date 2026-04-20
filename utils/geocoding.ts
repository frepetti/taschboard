/**
 * Geocoding Utils — Nominatim / OpenStreetMap
 *
 * Uso gratuito, sin API key. Respeta el rate limit de 1 req/seg.
 * Política: https://operations.osmfoundation.org/policies/nominatim/
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

/**
 * Geocodifica un string de dirección usando Nominatim/OpenStreetMap.
 * Retorna las coordenadas o null si no se encuentra.
 */
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim().length < 5) return null;

  try {
    const params = new URLSearchParams({
      q: address.trim(),
      format: 'json',
      limit: '1',
      addressdetails: '0',
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      {
        headers: {
          // Requerido por la política de Nominatim
          'User-Agent': 'Taschboard-BTL-Dashboard/1.0 (contact@taschboard.com)',
          'Accept-Language': 'es',
        },
      }
    );

    if (!response.ok) {
      console.warn('⚠️ [Geocoding] Nominatim request failed:', response.status);
      return null;
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.log('📍 [Geocoding] No results for:', address);
      return null;
    }

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lng)) return null;

    console.log(`✅ [Geocoding] Found: ${result.display_name} → [${lat}, ${lng}]`);

    return {
      lat,
      lng,
      displayName: result.display_name,
    };
  } catch (error) {
    console.error('❌ [Geocoding] Error:', error);
    return null;
  }
}
