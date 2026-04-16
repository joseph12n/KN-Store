/**
 * imageMapping.js
 * Utilidades para normalizar y ordenar el array `images` que viene de la API.
 */

const ANGLE_ORDER = { front: 0, side: 1, back: 2 };

/**
 * Ordena un array de imagenes por angulo: front -> side -> back.
 * Imagenes con angulo desconocido o ausente van al final.
 *
 * @param {Array<{ url: string, angle: string, alt: string }>} images
 * @returns {Array<{ url: string, angle: string, alt: string }>}
 */
export function sortImagesByAngle(images) {
  if (!Array.isArray(images) || images.length === 0) return [];

  return [...images].sort((a, b) => {
    const orderA = ANGLE_ORDER[a?.angle] ?? 99;
    const orderB = ANGLE_ORDER[b?.angle] ?? 99;
    return orderA - orderB;
  });
}

/**
 * Normaliza el array de imagenes: filtra entradas sin URL,
 * garantiza que alt y angle siempre tengan un valor por defecto,
 * y ordena por angulo.
 *
 * @param {Array|undefined|null} images
 * @returns {Array<{ url: string, angle: string, alt: string }>}
 */
export function normalizeImages(images) {
  if (!Array.isArray(images) || images.length === 0) return [];

  const valid = images
    .filter((img) => img && typeof img.url === 'string' && img.url.trim() !== '')
    .map((img) => ({
      url: img.url.trim(),
      angle: img.angle && ANGLE_ORDER[img.angle] !== undefined ? img.angle : 'front',
      alt: typeof img.alt === 'string' && img.alt.trim() !== '' ? img.alt.trim() : '',
    }));

  return sortImagesByAngle(valid);
}

/**
 * Retorna solo las imagenes de un angulo especifico.
 *
 * @param {Array} images
 * @param {'front'|'side'|'back'} angle
 * @returns {Array}
 */
export function filterByAngle(images, angle) {
  if (!Array.isArray(images) || images.length === 0) return [];
  return images.filter((img) => img?.angle === angle);
}

/**
 * Retorna la imagen principal (primera de angulo "front",
 * o la primera disponible si no hay ninguna frontal).
 *
 * @param {Array} images
 * @returns {{ url: string, angle: string, alt: string }|null}
 */
export function getPrimaryImage(images) {
  if (!Array.isArray(images) || images.length === 0) return null;
  const normalized = normalizeImages(images);
  return normalized.find((img) => img.angle === 'front') ?? normalized[0] ?? null;
}
