import React, { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { AppContext } from "../contexts/ContextAPI";
import AppRoutes from "./App.routes";
import AuthRoutes from "./Auth.routes";
import OnboardingRoutes from "./Onboarding.routes";

export default function Routes() {
  const { user, loading } = useContext(AppContext);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0B0D0F", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#18D3A6" size="large" />
      </View>
    );
  }

  if (!user) return <AuthRoutes />;
  if (!user.onboardingCompleted) return <OnboardingRoutes />;
  return <AppRoutes />;
}
