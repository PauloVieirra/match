import React from "react";
import {
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import { colors } from "../../theme/colors";
import { styles } from "./style";

export default function SignInScreen({ navigation }) {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <ImageBackground
        source={require("../../../assets/imgloginfundo.png")}
        resizeMode="cover"
        style={styles.heroImage}
      >
        <LinearGradient
          colors={["rgba(255,248,249,0.05)", "rgba(255,248,249,0.45)", "rgba(255,248,249,0.94)"]}
          locations={[0, 0.5, 1]}
          style={styles.heroOverlay}
        />

        <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
          <View style={styles.topBrand}>
            <Image
              source={require("../../../assets/icon.png")}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="TreinaComigo"
            />
            <Text style={styles.brandName}>TreinaComigo</Text>
          </View>

          <View style={styles.bottomArea}>
            <View style={styles.glassWrap}>
              <BlurView
                intensity={50}
                tint="light"
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
                  onPress={() => navigation.navigate("TermsConsent", { next: "EmailAuth" })}
                >
                  <Feather name="mail" size={18} color={colors.white} />
                  <Text style={styles.phoneBtnText}>Entrar com e-mail</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.phoneBtn, styles.secondaryBtn]}
                  activeOpacity={0.85}
                  onPress={() => navigation.navigate("TermsConsent", { next: "PhoneAuth" })}
                >
                  <Feather name="smartphone" size={18} color={colors.gray} />
                  <Text style={[styles.phoneBtnText, styles.secondaryBtnText]}>
                    Entrar com telefone (mock)
                  </Text>
                </TouchableOpacity>

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
