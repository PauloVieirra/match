import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Serviço de curtidas de fotos.
 *
 * O contrato público (fetchLikes / setLiked) foi desenhado como um client de
 * API: todas as operações são assíncronas e retornam o estado consolidado
 * calculado pelo "servidor". Para conectar o backend, basta reimplementar as
 * duas funções exportadas com chamadas HTTP mantendo as mesmas assinaturas —
 * telas, hook e componentes não precisam mudar.
 *
 * Implementação atual (simulada):
 * - Persistência local em AsyncStorage.
 * - Contagem base determinística por foto (parece real e é estável entre sessões).
 * - Curtidas do usuário logado somadas à contagem base.
 */

const STORAGE_KEY = "@matchmaromba:photo-likes:v1";

// Latência artificial para o fluxo se comportar como uma API real.
const simulateNetwork = () =>
  new Promise((resolve) => setTimeout(resolve, 120 + Math.random() * 180));

/**
 * Identificador estável de uma foto: dono do perfil + URI da imagem.
 * No backend, será substituído pelo id real da foto no banco.
 */
export function buildPhotoId(ownerId, source, index = 0) {
  const uri = typeof source === "string" ? source : source?.uri;
  return `${ownerId}|${uri || `photo-${index}`}`;
}

// Contagem base pseudo-aleatória (8 a 407), determinística por photoId.
function seededCount(photoId) {
  let hash = 0;
  for (let i = 0; i < photoId.length; i += 1) {
    hash = (hash * 31 + photoId.charCodeAt(i)) >>> 0;
  }
  return 8 + (hash % 400);
}

async function readStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function writeStore(store) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function toSnapshot(photoId, entry, viewerId) {
  const likedBy = entry?.likedBy || {};
  return {
    count: seededCount(photoId) + Object.keys(likedBy).length,
    likedByMe: !!likedBy[viewerId],
  };
}

/**
 * Busca o estado de curtidas de um conjunto de fotos.
 * Equivalente futuro: GET /photos/likes?ids=...
 *
 * @param {string[]} photoIds
 * @param {string} viewerId identificador do usuário logado
 * @returns {Promise<Record<string, { count: number, likedByMe: boolean }>>}
 */
export async function fetchLikes(photoIds, viewerId) {
  await simulateNetwork();
  const store = await readStore();
  const result = {};
  photoIds.forEach((photoId) => {
    result[photoId] = toSnapshot(photoId, store[photoId], viewerId);
  });
  return result;
}

/**
 * Curte/descurte uma foto e retorna o estado consolidado.
 * Equivalente futuro: PUT /photos/:id/like  |  DELETE /photos/:id/like
 *
 * @param {string} photoId
 * @param {string} viewerId
 * @param {boolean} liked
 * @returns {Promise<{ count: number, likedByMe: boolean }>}
 */
export async function setLiked(photoId, viewerId, liked) {
  await simulateNetwork();
  const store = await readStore();
  const entry = store[photoId] || { likedBy: {} };
  if (liked) {
    entry.likedBy[viewerId] = true;
  } else {
    delete entry.likedBy[viewerId];
  }
  store[photoId] = entry;
  await writeStore(store);
  return toSnapshot(photoId, entry, viewerId);
}
