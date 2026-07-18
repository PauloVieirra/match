import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Routes from "./routes/Routes";
import { AppProvider } from "./contexts/ContextAPI";

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <NavigationContainer>
          <Routes />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}
