import React, { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { AppContext } from "../contexts/ContextAPI";
import AppRoutes from "./App.routes";
import AuthRoutes from "./Auth.routes";
import OnboardingRoutes from "./Onboarding.routes";
import PreparingScreen from "../src/screens/Preparing";

export default function Routes() {
  const { user, loading, preparing } = useContext(AppContext);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color="#18D3A6" size="large" />
      </View>
    );
  }

  if (!user) return <AuthRoutes />;
  if (!user.onboardingCompleted) return <OnboardingRoutes />;
  if (preparing) return <PreparingScreen />;
  return <AppRoutes />;
}
