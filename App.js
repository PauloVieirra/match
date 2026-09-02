import React, { useContext } from "react";
import { StyleSheet } from "react-native";
import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Toaster } from "sonner-native";
import Routes from "./routes/Routes";
import { AppContext, AppProvider } from "./contexts/ContextAPI";
import ConnectionNotification from "./src/Components/ConnectionNotification";
import AppBackground from "./src/Components/ui/AppBackground";
import { navigationRef, openMatchScreen } from "./routes/navigationRef";
import { colors } from "./src/theme/colors";

// Fundo transparente nas telas para o gradiente global (AppBackground) aparecer.
const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "transparent",
    primary: colors.primary,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
  },
};

function AppContent() {
  const {
    user,
    connectionNotification,
    dismissConnectionNotification,
  } = useContext(AppContext);

  const openNotification = () => {
    const userId = connectionNotification?.userId;
    dismissConnectionNotification();
    if (userId) openMatchScreen(userId);
  };

  return (
    <AppBackground>
      <NavigationContainer ref={navigationRef} theme={navTheme}>
        <Routes />
        <ConnectionNotification
          visible={!!connectionNotification && !!user?.onboardingCompleted}
          onPress={openNotification}
          onClose={dismissConnectionNotification}
        />
      </NavigationContainer>
      <Toaster
        theme="light"
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          style: {
            backgroundColor: colors.bgElevated,
            borderWidth: 1,
            borderColor: colors.borderStrong,
          },
          titleStyle: {
            color: colors.title,
            fontWeight: "700",
          },
          descriptionStyle: {
            color: colors.textMuted,
          },
        }}
      />
    </AppBackground>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
