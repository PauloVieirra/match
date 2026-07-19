import React, { useContext, useState } from "react";
import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../../../contexts/ContextAPI";
import CityAutocomplete from "../../Components/ui/CityAutocomplete";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import { styles } from "./style";

export default function LocationScreen({ navigation }) {
  const { user, updateProfile } = useContext(AppContext);
  const [city, setCity] = useState(user?.profile?.city || "");
  const [cityInfo, setCityInfo] = useState(user?.profile?.cityInfo || null);
  const [granted, setGranted] = useState(!!user?.profile?.locationGranted);

  const allow = () => {
    setGranted(true);
  };

  const save = async () => {
    await updateProfile({ city, cityInfo, locationGranted: granted });
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
        <CityAutocomplete
          value={city}
          onSelect={(c) => {
            setCity(c.label);
            setCityInfo({
              id: c.id,
              name: c.name,
              uf: c.uf,
              type: c.type,
              source: c.source,
            });
          }}
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
