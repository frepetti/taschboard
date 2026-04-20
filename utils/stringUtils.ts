/**
 * stringUtils.ts
 * Utilidades de comparación y validación de strings.
 * Usado principalmente para la detección de duplicados en el catálogo de competidores.
 */

/**
 * Calcula la distancia de Levenshtein entre dos strings.
 * Normaliza ambos strings (lowercase + trim) antes de comparar.
 */
export function levenshteinDistance(a: string, b: string): number {
  const s1 = a.toLowerCase().trim();
  const s2 = b.toLowerCase().trim();

  const m = s1.length;
  const n = s2.length;

  // Matriz de programación dinámica
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // borrar
          dp[i][j - 1],     // insertar
          dp[i - 1][j - 1]  // reemplazar
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Busca un competidor similar en la lista existente usando similitud de Levenshtein.
 *
 * @param input - Nombre que el usuario está intentando agregar
 * @param existing - Lista de competidores ya existentes
 * @param threshold - Umbral de similitud (0-1), por defecto 0.80 (80%)
 * @returns El nombre del competidor más similar si supera el umbral, o null si no hay coincidencias
 *
 * @example
 * findSimilarCompetitor('Tanquerai', ['Tanqueray', 'Hendricks'])
 * // → 'Tanqueray' (similitud ~0.89)
 *
 * findSimilarCompetitor('Bombay', ['Tanqueray', 'Hendricks'])
 * // → null (sin similitudes altas)
 */
export function findSimilarCompetitor(
  input: string,
  existing: string[],
  threshold = 0.80
): string | null {
  const normalized = input.toLowerCase().trim();
  if (!normalized || existing.length === 0) return null;

  let bestMatch: string | null = null;
  let bestSimilarity = 0;

  for (const competitor of existing) {
    const normalizedExisting = competitor.toLowerCase().trim();
    // Si es exactamente igual, no hay conflicto (ya existe exacto)
    if (normalized === normalizedExisting) return null;

    const distance = levenshteinDistance(normalized, normalizedExisting);
    const maxLen = Math.max(normalized.length, normalizedExisting.length);
    const similarity = maxLen === 0 ? 1 : 1 - distance / maxLen;

    if (similarity >= threshold && similarity > bestSimilarity) {
      bestSimilarity = similarity;
      bestMatch = competitor;
    }
  }

  return bestMatch;
}
