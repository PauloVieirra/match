import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Routes from "./routes/Routes";
import { AppContext, AppProvider } from "./contexts/ContextAPI";
import ConnectionNotification from "./src/Components/ConnectionNotification";
import { navigationRef, openMatchScreen } from "./routes/navigationRef";

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
    <NavigationContainer ref={navigationRef}>
      <Routes />
      <ConnectionNotification
        visible={!!connectionNotification && !!user?.onboardingCompleted}
        onPress={openNotification}
        onClose={dismissConnectionNotification}
      />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}
