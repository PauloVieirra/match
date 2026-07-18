import React, { useContext } from "react";
import {
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather, FontAwesome } from "@expo/vector-icons";
import { AppContext } from "../../../contexts/ContextAPI";
import { colors } from "../../theme/colors";
import { styles } from "./style";

export default function SignInScreen({ navigation }) {
  const { login } = useContext(AppContext);

  // Mock da API de login social — substituir pela integração real (Supabase Auth).
  const socialLogin = (provider) => {
    login({
      provider,
      name: "",
      phone: "",
      onboardingCompleted: false,
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../../assets/imgloginfundo.png")}
        resizeMode="cover"
        style={styles.heroImage}
      >
        <LinearGradient
          colors={["rgba(11,13,15,0.15)", "rgba(11,13,15,0.55)", "rgba(11,13,15,0.92)"]}
          locations={[0, 0.55, 1]}
          style={styles.heroOverlay}
        />

        <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
          <View style={styles.bottomArea}>
            <View style={styles.glassWrap}>
              <BlurView
                intensity={40}
                tint="dark"
                experimentalBlurMethod="dimezisBlurView"
                style={styles.glassPanel}
              >
                <Text style={styles.headline}>
                  Conecte-se por{"\n"}estilo de vida.
                </Text>
                <Text style={styles.subhead}>
                  Qualidade de vida primeiro. Treino, rotina e hábitos em comum.
                </Text>

                <TouchableOpacity
                  style={styles.phoneBtn}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("TermsConsent")}
                >
                  <Feather name="smartphone" size={18} color={colors.accent} />
                  <Text style={styles.phoneBtnText}>Entrar com telefone</Text>
                </TouchableOpacity>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>ou continue com</Text>
                  <View style={styles.dividerLine} />
                </View>

                <View style={styles.socialRow}>
                  <TouchableOpacity
                    style={styles.dropBtn}
                    activeOpacity={0.85}
                    onPress={() => socialLogin("google")}
                  >
                    <AntDesign name="google" size={24} color="rgba(255,255,255,0.92)" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.dropBtn}
                    activeOpacity={0.85}
                    onPress={() => socialLogin("apple")}
                  >
                    <FontAwesome name="apple" size={26} color="rgba(255,255,255,0.92)" />
                  </TouchableOpacity>
                </View>

                <Text style={styles.terms}>
                  Ao continuar, você verá nossos Termos e Política de Privacidade antes de criar a
                  conta.
                </Text>
              </BlurView>
            </View>
          </View>
        </SafeAreaView>
      </ImageBackground>
    </View>
  );
}
