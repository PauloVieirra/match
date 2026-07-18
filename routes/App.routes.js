import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppTabs from "./AppTabs.routes";
import FiltersScreen from "../src/screens/Filters";
import TermsScreen from "../src/screens/Terms";
import PrivacyScreen from "../src/screens/Privacy";
import ReportScreen from "../src/screens/Report";
import EditProfileScreen from "../src/screens/EditProfile";
import PhotosScreen from "../src/screens/Photos";
import LocationScreen from "../src/screens/Location";
import ChatScreen from "../src/screens/Chat";
import ProfileDetailScreen from "../src/screens/ProfileDetail";
import MatchCelebrationScreen from "../src/screens/MatchCelebration";

const Stack = createNativeStackNavigator();

export default function AppRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={AppTabs} />
      <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
      <Stack.Screen
        name="MatchCelebration"
        component={MatchCelebrationScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Photos" component={PhotosScreen} />
      <Stack.Screen name="Location" component={LocationScreen} />
      <Stack.Screen name="Filters" component={FiltersScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Report" component={ReportScreen} />
      <Stack.Screen name="ChatThread" component={ChatScreen} />
    </Stack.Navigator>
  );
}
