import React from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import { styles } from "./style";

export default function PrivacyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader title="Privacidade" onBack={() => navigation.goBack()} large />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.p}>
          Tratamos telefone, perfil fitness, fotos e localização para operar descoberta, match e
          chat. Localização exige consentimento explícito.
        </Text>
        <Text style={styles.p}>
          Você pode solicitar exclusão da conta; os dados são removidos em até 30 dias. Denúncias
          e bloqueios são registrados para moderação.
        </Text>
        <Text style={styles.p}>
          Não vendemos seus dados. Parceiros de infraestrutura (ex.: Supabase) processam dados sob
          contrato e medidas de segurança adequadas.
        </Text>
        <Text style={styles.muted}>Versão MVP · alinhada à LGPD em alto nível.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
