/** Helpers para data de nascimento no formato DD/MM/AAAA. */

export function formatBirthInput(text) {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function parseBirthDate(value) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value || "");
  if (!m) return null;
  const [, dd, mm, yyyy] = m;
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  if (
    date.getDate() !== Number(dd) ||
    date.getMonth() !== Number(mm) - 1 ||
    date.getFullYear() !== Number(yyyy)
  ) {
    return null;
  }
  return date;
}

export function ageFrom(date) {
  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const beforeBirthday =
    today.getMonth() < date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() < date.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

const ZODIAC = [
  { sign: "Capricórnio", until: [1, 19] },
  { sign: "Aquário", until: [2, 18] },
  { sign: "Peixes", until: [3, 20] },
  { sign: "Áries", until: [4, 19] },
  { sign: "Touro", until: [5, 20] },
  { sign: "Gêmeos", until: [6, 20] },
  { sign: "Câncer", until: [7, 22] },
  { sign: "Leão", until: [8, 22] },
  { sign: "Virgem", until: [9, 22] },
  { sign: "Libra", until: [10, 22] },
  { sign: "Escorpião", until: [11, 21] },
  { sign: "Sagitário", until: [12, 21] },
  { sign: "Capricórnio", until: [12, 31] },
];

export function zodiacOf(date) {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  for (const { sign, until } of ZODIAC) {
    if (month < until[0] || (month === until[0] && day <= until[1])) return sign;
  }
  return "Capricórnio";
}
