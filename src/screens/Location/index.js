import React, { useContext, useState } from "react";
import { View, Text, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../../../contexts/ContextAPI";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import { styles } from "./style";

export default function LocationScreen({ navigation }) {
  const { user, updateProfile } = useContext(AppContext);
  const [city, setCity] = useState(user?.profile?.city || "");
  const [granted, setGranted] = useState(!!user?.profile?.locationGranted);

  const allow = () => {
    setGranted(true);
    if (!city) setCity("Brasília - DF");
  };

  const save = async () => {
    await updateProfile({ city, locationGranted: granted });
    Alert.alert("Salvo", "Localização atualizada.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title="Localização"
        subtitle="Usada só para descoberta próxima. Você define o raio nos filtros."
        onBack={() => navigation.goBack()}
        large
      />
      <View style={styles.content}>
        <Text style={styles.label}>Cidade</Text>
        <TextInput
          style={styles.input}
          value={city}
          onChangeText={setCity}
          placeholder="Brasília - DF"
          placeholderTextColor="rgba(255,255,255,0.4)"
        />
        <PrimaryButton
          title={granted ? "GPS liberado ✓" : "Permitir localização"}
          variant={granted ? "primary" : "ghost"}
          onPress={allow}
          style={{ marginTop: 12 }}
        />
        <Text style={styles.hint}>
          Consentimento explícito de localização (LGPD). Você pode revogar a qualquer momento.
        </Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton title="Salvar" onPress={save} />
      </View>
    </SafeAreaView>
  );
}
