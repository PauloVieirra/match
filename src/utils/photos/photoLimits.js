/** Limite por foto no perfil (bytes do arquivo / buffer decodificado). */
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export const MAX_PHOTO_LABEL = '5 MB';

export const MAX_PHOTO_COUNT = 5;

/**
 * Estima bytes a partir de base64 (sem data URI prefix).
 * Fórmula: floor(len * 3/4) ajustando padding `=`.
 */
export function estimateBytesFromBase64(base64) {
  if (!base64 || typeof base64 !== 'string') return 0;
  const raw = base64.replace(/^data:[^;]+;base64,/i, '').replace(/\s/g, '');
  if (!raw) return 0;
  const padding = raw.endsWith('==') ? 2 : raw.endsWith('=') ? 1 : 0;
  return Math.max(0, Math.floor((raw.length * 3) / 4) - padding);
}

/**
 * Valida asset do expo-image-picker (fileSize e/ou base64).
 * @returns {{ ok: true } | { ok: false, message: string }}
 */
export function validatePickedPhoto(asset) {
  if (!asset) {
    return { ok: false, message: 'Não foi possível ler a imagem. Tente outra foto.' };
  }

  if (typeof asset.fileSize === 'number' && asset.fileSize > MAX_PHOTO_BYTES) {
    return {
      ok: false,
      message: `A foto é grande demais. Use uma imagem de até ${MAX_PHOTO_LABEL}.`,
    };
  }

  if (asset.base64) {
    const bytes = estimateBytesFromBase64(asset.base64);
    if (bytes > MAX_PHOTO_BYTES) {
      return {
        ok: false,
        message: `A foto é grande demais. Use uma imagem de até ${MAX_PHOTO_LABEL}.`,
      };
    }
  } else {
    return { ok: false, message: 'Não foi possível ler a imagem. Tente outra foto.' };
  }

  return { ok: true };
}
