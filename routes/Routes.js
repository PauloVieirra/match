import React, { useContext } from "react";
import { ActivityIndicator, View } from "react-native";
import { AppContext } from "../contexts/ContextAPI";
import { colors } from "../src/theme/colors";
import AppRoutes from "./App.routes";
import AuthRoutes from "./Auth.routes";
import OnboardingRoutes from "./Onboarding.routes";
import PreparingScreen from "../src/screens/Preparing";

export default function Routes() {
  const { user, loading, preparing } = useContext(AppContext);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "transparent", alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!user) return <AuthRoutes />;
  if (!user.onboardingCompleted) return <OnboardingRoutes />;
  if (preparing) return <PreparingScreen />;
  return <AppRoutes />;
}
