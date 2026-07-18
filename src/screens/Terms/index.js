import React from "react";
import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import { styles } from "./style";

export default function TermsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <ScreenHeader title="Termos de uso" onBack={() => navigation.goBack()} large />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.p}>
          Ao usar o Match Maromba, você concorda em criar um perfil verdadeiro, respeitar outros
          usuários e usar o app para conexões baseadas em estilo de vida e qualidade de vida.
        </Text>
        <Text style={styles.p}>
          É proibido assédio, conteúdo ofensivo, spam e uso comercial não autorizado. Podemos
          suspender contas que violem estas regras.
        </Text>
        <Text style={styles.p}>
          O chat só fica disponível após match mútuo. Likes podem ter limites diários e mensais
          conforme as regras do produto.
        </Text>
        <Text style={styles.muted}>Versão MVP · texto resumido para validação.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
