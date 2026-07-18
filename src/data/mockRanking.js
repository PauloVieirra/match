// Dados de demonstração do sistema de rankeamento.
// A pontuação (XP) e as conquistas serão calculadas pelo backend futuramente.

export const ACHIEVEMENT_BADGES = [
  { id: "streak", label: "Constância", icon: "zap", color: "#18D3A6" },
  { id: "early", label: "Madrugador", icon: "sunrise", color: "#F5B841" },
  { id: "distance", label: "Longa distância", icon: "map", color: "#5AA9FF" },
  { id: "social", label: "Parceiro de treino", icon: "users", color: "#B08CFF" },
  { id: "goal", label: "Meta batida", icon: "target", color: "#FF4D6D" },
  { id: "iron", label: "Ferro pesado", icon: "anchor", color: "#8ED0C6" },
];

export const RANKING = [
  {
    id: "u4",
    name: "Rafael",
    title: "Máquina",
    xp: 6200,
    trend: "up",
    avatar: "https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["streak", "iron", "goal"],
  },
  {
    id: "u1",
    name: "Bruna",
    title: "Disciplinada",
    xp: 5810,
    trend: "same",
    avatar: "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["streak", "early"],
  },
  {
    id: "u2",
    name: "Lucas",
    title: "Maratonista",
    xp: 4703,
    trend: "down",
    avatar: "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["distance", "goal"],
  },
  {
    id: "u5",
    name: "Carolina",
    title: "Constante",
    xp: 4300,
    trend: "up",
    avatar: "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["streak", "social"],
  },
  {
    id: "u6",
    name: "Thiago",
    title: "Ferro pesado",
    xp: 3890,
    trend: "down",
    avatar: "https://images.pexels.com/photos/4761792/pexels-photo-4761792.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["iron"],
  },
  {
    id: "u3",
    name: "Marina",
    title: "Em evolução",
    xp: 3810,
    trend: "up",
    avatar: "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["early", "social"],
  },
  {
    id: "u7",
    name: "Fernanda",
    title: "Nadadora",
    xp: 3678,
    trend: "down",
    avatar: "https://images.pexels.com/photos/3757362/pexels-photo-3757362.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["distance"],
  },
  {
    id: "u8",
    name: "André",
    title: "Crossfiteiro",
    xp: 3501,
    trend: "up",
    avatar: "https://images.pexels.com/photos/1552106/pexels-photo-1552106.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["goal", "streak"],
  },
  {
    id: "x1",
    name: "Paula",
    title: "Yogini",
    xp: 3210,
    trend: "same",
    avatar: "https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["early"],
  },
  {
    id: "x2",
    name: "Diego",
    title: "Ciclista",
    xp: 2680,
    trend: "down",
    avatar: "https://images.pexels.com/photos/2402777/pexels-photo-2402777.jpeg?auto=compress&cs=tinysrgb&w=400",
    badges: ["distance", "social"],
  },
];

// Posição simulada do usuário logado (fora do top 10).
export const MY_RANKING = {
  position: 27,
  xp: 1380,
  trend: "up",
  topPercent: 20,
  badges: ["streak", "early"],
};
