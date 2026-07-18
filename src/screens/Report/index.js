import React, { useState } from "react";
import { View, Text, TextInput, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Chip from "../../Components/ui/Chip";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import { styles } from "./style";

const REASONS = [
  "Assédio",
  "Perfil falso",
  "Conteúdo ofensivo",
  "Spam",
  "Outro",
];

export default function ReportScreen({ navigation }) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const submit = () => {
    if (!reason) {
      Alert.alert("Atenção", "Selecione um motivo.");
      return;
    }
    Alert.alert("Enviado", "Denúncia registrada para análise (mock).");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title="Denunciar / bloquear"
        subtitle="Ajude a manter a comunidade segura."
        onBack={() => navigation.goBack()}
        large
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Motivo</Text>
        <View style={styles.chips}>
          {REASONS.map((r) => (
            <Chip key={r} label={r} selected={reason === r} onPress={() => setReason(r)} />
          ))}
        </View>
        <Text style={styles.label}>Detalhes (opcional)</Text>
        <TextInput
          style={styles.input}
          value={details}
          onChangeText={setDetails}
          multiline
          placeholder="Descreva o ocorrido..."
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton title="Bloquear usuário" variant="ghost" onPress={() => Alert.alert("Bloqueado", "Usuário bloqueado (mock).")} />
        <PrimaryButton title="Enviar denúncia" variant="coral" onPress={submit} style={{ marginTop: 10 }} />
      </View>
    </SafeAreaView>
  );
}
