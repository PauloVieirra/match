import { createNavigationContainerRef } from "@react-navigation/native";

export const navigationRef = createNavigationContainerRef();

export function openMatchScreen(userId) {
  if (navigationRef.isReady()) {
    navigationRef.navigate("MatchCelebration", { userId });
  }
}
