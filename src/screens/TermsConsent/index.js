import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import { colors } from "../../theme/colors";
import { styles } from "./style";

const TERMS = [
  {
    title: "Uso da plataforma",
    text: "Crie um perfil verdadeiro, respeite outros usuários e use o app para conexões baseadas em estilo de vida e qualidade de vida.",
  },
  {
    title: "Conduta",
    text: "É proibido assédio, conteúdo ofensivo, spam e uso comercial não autorizado. Contas que violarem as regras podem ser suspensas.",
  },
  {
    title: "Privacidade e dados",
    text: "Tratamos telefone, perfil fitness, fotos e localização para operar descoberta, conexão e chat. Localização exige consentimento explícito (LGPD).",
  },
  {
    title: "Conexões e chat",
    text: "O chat só fica disponível após conexão mútua. Pedidos de conexão podem ter limites diários e mensais.",
  },
  {
    title: "Exclusão de conta",
    text: "Você pode excluir a conta a qualquer momento; os dados são removidos em até 30 dias.",
  },
];

export default function TermsConsentScreen({ navigation }) {
  const [accepted, setAccepted] = useState(false);

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title="Termos e Privacidade"
        subtitle="Leia e concorde para criar sua conta com telefone."
        onBack={() => navigation.goBack()}
        large
      />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {TERMS.map((item) => (
          <View key={item.title} style={styles.card}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>{item.text}</Text>
          </View>
        ))}
        <Text style={styles.note}>Versão MVP · texto resumido para validação.</Text>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.checkRow}
          onPress={() => setAccepted((v) => !v)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, accepted && styles.checkboxOn]}>
            {accepted ? <Feather name="check" size={14} color={colors.accentDark} /> : null}
          </View>
          <Text style={styles.checkText}>
            Li e concordo com os Termos de Uso e a Política de Privacidade
          </Text>
        </TouchableOpacity>

        <PrimaryButton
          title="Concordar e continuar"
          onPress={() => navigation.navigate("PhoneAuth")}
          disabled={!accepted}
        />
      </View>
    </SafeAreaView>
  );
}
