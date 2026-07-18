/**
 * Locais de atividade física registrados no app (mock).
 * O cadastro real de academias, parques e eventos virá em outra etapa;
 * o check-in exige estar dentro do raio (checkInRadiusM) do local.
 * Coordenadas na região de Brasília - DF.
 */

export const VENUE_TYPES = {
  gym: { label: "Academia", icon: "home" },
  park: { label: "Parque público", icon: "sun" },
  run: { label: "Evento de corrida", icon: "flag" },
  trail: { label: "Trilha", icon: "map" },
  soccer: { label: "Futebol", icon: "target" },
  tennis: { label: "Tênis", icon: "circle" },
  crossfit: { label: "Box de crossfit", icon: "box" },
};

export const mockVenues = [
  {
    id: "v1",
    name: "Smart Fit Asa Sul",
    type: "gym",
    latitude: -15.8262,
    longitude: -47.9147,
    address: "CLS 302, Asa Sul",
    checkInRadiusM: 200,
  },
  {
    id: "v2",
    name: "Parque da Cidade Sarah Kubitschek",
    type: "park",
    latitude: -15.8055,
    longitude: -47.9058,
    address: "Eixo Monumental, Brasília",
    checkInRadiusM: 800,
  },
  {
    id: "v3",
    name: "Circuito Corrida do Cerrado",
    type: "run",
    latitude: -15.7861,
    longitude: -47.9042,
    address: "Esplanada dos Ministérios",
    checkInRadiusM: 500,
  },
  {
    id: "v4",
    name: "Trilha do Cerradão - Parque Nacional",
    type: "trail",
    latitude: -15.7367,
    longitude: -47.9235,
    address: "Água Mineral, Brasília",
    checkInRadiusM: 600,
  },
  {
    id: "v5",
    name: "CrossFit 704 Norte",
    type: "crossfit",
    latitude: -15.7702,
    longitude: -47.8871,
    address: "704 Norte, Asa Norte",
    checkInRadiusM: 200,
  },
  {
    id: "v6",
    name: "Quadras de Tênis do Iate Clube",
    type: "tennis",
    latitude: -15.7808,
    longitude: -47.8583,
    address: "Setor de Clubes Norte",
    checkInRadiusM: 300,
  },
  {
    id: "v7",
    name: "Campo Sintético Vila Planalto",
    type: "soccer",
    latitude: -15.7724,
    longitude: -47.8462,
    address: "Vila Planalto, Brasília",
    checkInRadiusM: 250,
  },
  {
    id: "v8",
    name: "Academia BodyTech Sudoeste",
    type: "gym",
    latitude: -15.7969,
    longitude: -47.9264,
    address: "Setor Sudoeste, Brasília",
    checkInRadiusM: 200,
  },
  {
    id: "v9",
    name: "Parque Olhos D'Água",
    type: "park",
    latitude: -15.7419,
    longitude: -47.8896,
    address: "Asa Norte, Brasília",
    checkInRadiusM: 500,
  },
];

/** Distância haversine em metros. */
export function distanceMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
