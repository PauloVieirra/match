import React, { useContext, useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppContext } from "../../../contexts/ContextAPI";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import { styles } from "./style";

const MOCK_URIS = [
  "https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/841130/pexels-photo-841130.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/3823039/pexels-photo-3823039.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/2261477/pexels-photo-2261477.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/863988/pexels-photo-863988.jpeg?auto=compress&cs=tinysrgb&w=800",
];

export default function PhotosScreen({ navigation }) {
  const { user, updateProfile } = useContext(AppContext);
  const [photos, setPhotos] = useState(user?.profile?.photos || []);

  const add = () => {
    if (photos.length >= 5) {
      Alert.alert("Limite", "Máximo de 5 fotos (1 principal + 4).");
      return;
    }
    setPhotos((p) => [...p, { uri: MOCK_URIS[p.length % MOCK_URIS.length] }]);
  };

  const remove = (index) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
  };

  const save = async () => {
    await updateProfile({ photos });
    Alert.alert("Salvo", "Fotos atualizadas.");
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title="Fotos"
        subtitle="1 principal e até 4 secundárias."
        onBack={() => navigation.goBack()}
        large
      />
      <ScrollView contentContainerStyle={styles.content}>
        {photos.map((p, i) => (
          <View key={`${p.uri}-${i}`} style={styles.slot}>
            <Text style={styles.slotText}>{i === 0 ? "Principal" : `Secundária ${i}`}</Text>
            <PrimaryButton title="Remover" variant="ghost" onPress={() => remove(i)} style={styles.smallBtn} />
          </View>
        ))}
        {photos.length < 5 ? (
          <PrimaryButton title="+ Adicionar foto (mock)" variant="ghost" onPress={add} />
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton title="Salvar" onPress={save} />
      </View>
    </SafeAreaView>
  );
}
