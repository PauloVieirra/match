import React from "react";
import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HomeScreen from "../src/screens/Home/Index";
import DiscoverScreen from "../src/screens/Discover";
import CheckInScreen from "../src/screens/CheckIn";
import MatchesScreen from "../src/screens/Matches";
import ProfileScreen from "../src/screens/Profile";

const Tab = createBottomTabNavigator();

/** Altura do conteúdo da tab bar (ícones + labels), sem o inset do sistema. */
const TAB_BAR_CONTENT_HEIGHT = 60;

const ICONS = {
  HomeTab: "home",
  DiscoverTab: "compass",
  CheckInTab: "map-pin",
  MatchesTab: "users",
  ProfileTab: "user",
};

function TabIcon({ routeName, color, size }) {
  return <Feather name={ICONS[routeName] || "circle"} size={size} color={color} />;
}

export default function AppTabs() {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, 0);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        sceneStyle: { backgroundColor: "transparent" },
        tabBarActiveTintColor: "#18D3A6",
        tabBarInactiveTintColor: "rgba(255,255,255,0.45)",
        // Com edgeToEdgeEnabled no Android, height fixo sem inset deixa a
        // barra do sistema por cima dos botões — incluir paddingBottom + height.
        tabBarStyle: {
          backgroundColor: "#0B0D0F",
          borderTopColor: "rgba(255,255,255,0.08)",
          paddingTop: 6,
          height: TAB_BAR_CONTENT_HEIGHT + bottomInset,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 6,
          marginTop: 2,
        },
        tabBarIcon: ({ color, size }) => (
          <TabIcon routeName={route.name} color={color} size={size ?? 22} />
        ),
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: "Início" }} />
      <Tab.Screen name="DiscoverTab" component={DiscoverScreen} options={{ title: "Descobrir" }} />
      <Tab.Screen name="CheckInTab" component={CheckInScreen} options={{ title: "Check-in" }} />
      <Tab.Screen name="MatchesTab" component={MatchesScreen} options={{ title: "Matches" }} />
      <Tab.Screen name="ProfileTab" component={ProfileScreen} options={{ title: "Perfil" }} />
    </Tab.Navigator>
  );
}
