/**
 * Utilidades para normalización y parsing polimórfico de datos de competencia.
 * Reconcilia discrepancias entre el almacenamiento en DB (español/arrays)
 * y el consumo en componentes de interfaz (inglés/campos planos).
 */

export interface NormalizedCompetitor {
  name: string;
  visibility: 'high' | 'medium' | 'low' | 'N/A';
  priceComparison: 'premium' | 'equal' | 'lower' | 'N/A';
  price?: number;
  present: boolean;
}

export interface NormalizedCompetition {
  mainCompetitor: string;
  competitorVisibility: 'high' | 'medium' | 'low' | 'N/A';
  priceComparison: 'premium' | 'equal' | 'lower' | 'N/A';
  competitors: NormalizedCompetitor[];
}

/**
 * Normaliza valores heterogéneos de visibilidad a 'high' | 'medium' | 'low' | 'N/A'
 */
export const normalizeVisibility = (val: any): 'high' | 'medium' | 'low' | 'N/A' => {
  if (!val || typeof val !== 'string') return 'N/A';
  const v = val.trim().toLowerCase();
  if (v === 'high' || v === 'alta' || v === 'alto') return 'high';
  if (v === 'medium' || v === 'media' || v === 'medio') return 'medium';
  if (v === 'low' || v === 'baja' || v === 'bajo') return 'low';
  return 'N/A';
};

/**
 * Normaliza o calcula la comparación de precios de nuestro producto vs la competencia.
 * Retorna:
 * - 'premium': Nuestro producto es más caro (+2% o más)
 * - 'equal': Precios equivalentes (dentro de +/- 2%)
 * - 'lower': Nuestro producto es más barato (-2% o menos)
 */
export const normalizePriceComparison = (
  pcValue: any,
  compPrice?: number | null,
  ourPrice?: number | null
): 'premium' | 'equal' | 'lower' | 'N/A' => {
  if (pcValue && typeof pcValue === 'string') {
    const p = pcValue.trim().toLowerCase();
    if (p === 'premium' || p === 'higher' || p === 'más alto' || p === 'mas alto' || p === 'alto') return 'premium';
    if (p === 'equal' || p === 'similar' || p === 'igual' || p === 'par') return 'equal';
    if (p === 'lower' || p === 'más bajo' || p === 'mas bajo' || p === 'bajo' || p === 'menor') return 'lower';
  }

  // Deducción matemática a partir de precios observados si están disponibles
  if (compPrice != null && ourPrice != null && compPrice > 0 && ourPrice > 0) {
    const diff = (ourPrice - compPrice) / compPrice;
    if (diff > 0.02) return 'premium';
    if (diff < -0.02) return 'lower';
    return 'equal';
  }

  return 'N/A';
};

export const INVALID_COMPETITOR_NAMES = new Set([
  'ninguno',
  'n/a',
  'na',
  'none',
  'no hay',
  'no hay competencia',
  'no aplica',
  'sin competencia',
  'no posee',
  'no registra',
  '-',
  '--',
  '---'
]);

export function isValidCompetitorName(name: any): boolean {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim().toLowerCase();
  if (!trimmed) return false;
  if (INVALID_COMPETITOR_NAMES.has(trimmed)) return false;
  if (/^[-_./\s]+$/.test(trimmed)) return false;
  return true;
}

/**
 * Parsea e integra de manera polimórfica los datos de competencia de una inspección.
 * Soporta:
 * 1. Schema DB SQL: `detalles.competencia` [{ nombre, presente, precio, stock_nivel }]
 * 2. Schema UI: `detalles.competitors` [{ name, visibility, priceComparison }]
 * 3. Campos planos en `detalles`: `mainCompetitor`, `competitorVisibility`, `priceComparison`
 * 4. Columnas legacy directas: `competidor_principal`, `competitor_presence`, `presencia_competencia`
 */
export function parseInspectionCompetition(inspection: any): NormalizedCompetition {
  if (!inspection) {
    return {
      mainCompetitor: 'Ninguno',
      competitorVisibility: 'N/A',
      priceComparison: 'N/A',
      competitors: []
    };
  }

  const detalles = inspection.detalles || {};
  const ourPrice = typeof inspection.precio_venta === 'number'
    ? inspection.precio_venta
    : (typeof detalles.precioCartaObservado === 'number' ? detalles.precioCartaObservado : null);

  const rawList: any[] = Array.isArray(detalles.competencia)
    ? detalles.competencia
    : (Array.isArray(detalles.competitors) ? detalles.competitors : []);

  const normalizedCompetitors: NormalizedCompetitor[] = [];

  for (const item of rawList) {
    if (!item) continue;
    const name = String(item.nombre || item.name || '').trim();
    if (!isValidCompetitorName(name)) continue;

    // Resolución booleana blindada de presencia física
    const rawPresence = item.presente ?? item.present;
    let isPresent = false;
    if (typeof rawPresence === 'boolean') {
      isPresent = rawPresence;
    } else if (typeof rawPresence === 'string') {
      const pStr = rawPresence.trim().toLowerCase();
      isPresent = pStr === 'true' || pStr === 'si' || pStr === 'sí' || pStr === 'yes' || pStr === '1';
    } else if (typeof rawPresence === 'number') {
      isPresent = rawPresence === 1;
    } else {
      isPresent = Boolean(rawPresence ?? false);
    }

    const price = typeof item.precio === 'number'
      ? item.precio
      : (typeof item.price === 'number' ? item.price : undefined);

    let rawVis = item.visibilidad || item.visibility || item.presencia;
    if (!rawVis && item.stock_nivel) {
      const sn = String(item.stock_nivel).toLowerCase();
      if (sn === 'high' || sn === 'alto' || sn === 'adequate' || sn === 'adecuado') {
        rawVis = 'medium';
      } else if (sn === 'low' || sn === 'bajo' || sn === 'critical' || sn === 'crítico') {
        rawVis = 'low';
      }
    }
    if (!rawVis && isPresent) {
      rawVis = 'medium';
    }

    const visibility = normalizeVisibility(rawVis);
    const rawPc = item.priceComparison || item.comparacion_precio || item.comparacionPrecio;
    const priceComparison = normalizePriceComparison(rawPc, price, ourPrice);

    normalizedCompetitors.push({
      name,
      visibility,
      priceComparison,
      price,
      present: isPresent
    });
  }

  // Si no había array pero hay claves planas en detalles o en la entidad principal
  if (normalizedCompetitors.length === 0) {
    const flatName = String(
      detalles.mainCompetitor ||
      inspection.competidor_principal ||
      inspection.competitor_presence ||
      inspection.main_competitor ||
      ''
    ).trim();

    if (isValidCompetitorName(flatName)) {
      const rawPresence = detalles.competitorPresent ?? inspection.presencia_competidor ?? inspection.presencia_competencia;
      let flatPresent = true;
      if (rawPresence !== undefined) {
        if (typeof rawPresence === 'boolean') flatPresent = rawPresence;
        else if (typeof rawPresence === 'string') {
          const pStr = rawPresence.trim().toLowerCase();
          flatPresent = pStr === 'true' || pStr === 'si' || pStr === 'sí' || pStr === 'yes' || pStr === '1';
        } else if (typeof rawPresence === 'number') {
          flatPresent = rawPresence === 1;
        } else {
          flatPresent = Boolean(rawPresence);
        }
      }

      const flatVis = normalizeVisibility(
        detalles.competitorVisibility ||
        inspection.presencia_competencia ||
        inspection.competitor_visibility
      );
      const flatPc = normalizePriceComparison(
        detalles.priceComparison,
        undefined,
        ourPrice
      );

      normalizedCompetitors.push({
        name: flatName,
        visibility: flatVis,
        priceComparison: flatPc,
        present: flatPresent
      });
    }
  }

  // Determinar el competidor principal preferido priorizando marcas efectivamente presentes
  let mainCompetitor = 'Ninguno';
  let competitorVisibility: 'high' | 'medium' | 'low' | 'N/A' = 'N/A';
  let priceComparison: 'premium' | 'equal' | 'lower' | 'N/A' = 'N/A';

  if (normalizedCompetitors.length > 0) {
    const presentCompetitor = normalizedCompetitors.find(c => c.present === true);
    if (presentCompetitor) {
      mainCompetitor = presentCompetitor.name;
      competitorVisibility = presentCompetitor.visibility;
      priceComparison = presentCompetitor.priceComparison;
    } else {
      // Si ninguno estuvo físicamente presente, no asignar competidor principal activo
      mainCompetitor = 'Ninguno';
      competitorVisibility = 'N/A';
      priceComparison = 'N/A';
    }
  } else if (detalles.mainCompetitor && detalles.mainCompetitor.trim() !== 'Ninguno') {
    mainCompetitor = detalles.mainCompetitor.trim();
    competitorVisibility = normalizeVisibility(detalles.competitorVisibility);
    priceComparison = normalizePriceComparison(detalles.priceComparison, undefined, ourPrice);
  }

  return {
    mainCompetitor,
    competitorVisibility,
    priceComparison,
    competitors: normalizedCompetitors
  };
}
