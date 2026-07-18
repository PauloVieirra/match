// routes/Auth.routes.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SignInScreen from "../src/screens/SignIn";
import TermsConsentScreen from "../src/screens/TermsConsent";
import PhoneAuthScreen from "../src/screens/PhoneAuth";
import VerifyCodeScreen from "../src/screens/VerifyCode";

const Stack = createNativeStackNavigator();

export default function AuthRoutes() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="TermsConsent" component={TermsConsentScreen} />
      <Stack.Screen name="PhoneAuth" component={PhoneAuthScreen} />
      <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
    </Stack.Navigator>
  );
}
