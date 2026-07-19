import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Busca de municípios na API pública do IBGE.
 * A lista completa (~5570 cidades) é baixada uma vez e mantida em cache
 * (memória + AsyncStorage) para o autocomplete filtrar localmente.
 */

const IBGE_URL =
  "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome";
const CACHE_KEY = "@matchmaromba:ibge-municipios";

let memoryCache = null;
let loadingPromise = null;

/**
 * O IBGE considera Brasília o único município do DF. Para o lançamento
 * regional, complementamos a busca com as 35 Regiões Administrativas.
 */
export const DF_ADMINISTRATIVE_REGIONS = [
  "Plano Piloto",
  "Gama",
  "Taguatinga",
  "Brazlândia",
  "Sobradinho",
  "Planaltina",
  "Paranoá",
  "Núcleo Bandeirante",
  "Ceilândia",
  "Guará",
  "Cruzeiro",
  "Samambaia",
  "Santa Maria",
  "São Sebastião",
  "Recanto das Emas",
  "Lago Sul",
  "Riacho Fundo",
  "Lago Norte",
  "Candangolândia",
  "Águas Claras",
  "Riacho Fundo II",
  "Sudoeste/Octogonal",
  "Varjão",
  "Park Way",
  "SCIA/Estrutural",
  "Sobradinho II",
  "Jardim Botânico",
  "Itapoã",
  "SIA",
  "Vicente Pires",
  "Fercal",
  "Sol Nascente/Pôr do Sol",
  "Arniqueira",
  "Arapoanga",
  "Água Quente",
].map((name, index) => ({
  id: `df-ra-${index + 1}`,
  name,
  uf: "DF",
  type: "administrative_region",
  source: "GDF",
}));

function simplify(raw) {
  return raw.map((m) => ({
    id: m.id,
    name: m.nome,
    uf:
      m.microrregiao?.mesorregiao?.UF?.sigla ||
      m["regiao-imediata"]?.["regiao-intermediaria"]?.UF?.sigla ||
      "",
    type: "municipality",
    source: "IBGE",
  }));
}

async function loadCities() {
  if (memoryCache) return memoryCache;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        memoryCache = JSON.parse(cached);
        return memoryCache;
      }
    } catch (e) {
      console.log("Erro ao ler cache IBGE:", e);
    }

    const response = await fetch(IBGE_URL);
    if (!response.ok) throw new Error(`IBGE respondeu ${response.status}`);
    const data = await response.json();
    memoryCache = simplify(data);
    AsyncStorage.setItem(CACHE_KEY, JSON.stringify(memoryCache)).catch(() => {});
    return memoryCache;
  })().finally(() => {
    loadingPromise = null;
  });

  return loadingPromise;
}

function normalize(text) {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Retorna até `limit` cidades cujo nome contém o termo digitado. */
export async function searchCities(query, limit = 8) {
  const term = normalize(query.trim());
  if (term.length < 2) return [];
  const ibgeCities = await loadCities();
  // As regiões do DF vêm primeiro para priorizar o público inicial do app.
  const cities = [...DF_ADMINISTRATIVE_REGIONS, ...ibgeCities];
  const starts = [];
  const contains = [];
  const seen = new Set();
  for (const city of cities) {
    const name = normalize(city.name);
    const key = `${name}-${city.uf}`;
    if (seen.has(key)) continue;
    if (name.startsWith(term)) {
      starts.push(city);
      seen.add(key);
    } else if (name.includes(term)) {
      contains.push(city);
      seen.add(key);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}

export function cityLabel(city) {
  return city?.uf ? `${city.name} - ${city.uf}` : city?.name || "";
}
