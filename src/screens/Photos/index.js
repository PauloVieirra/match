import React, { useContext, useState } from "react";
import {
  View,
  Text,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { AppContext } from "../../../contexts/ContextAPI";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import { colors } from "../../theme/colors";
import { styles } from "./style";
import { formatApiError } from "../../utils/api/formatApiError";
import { MAX_PHOTO_COUNT, validatePickedPhoto } from "../../utils/photos/photoLimits";

export default function PhotosScreen({ navigation }) {
  const { user, updateProfile } = useContext(AppContext);
  const [photos, setPhotos] = useState(user?.profile?.photos || []);
  const [pickingPhoto, setPickingPhoto] = useState(false);
  const [saving, setSaving] = useState(false);

  const addPhoto = async () => {
    if (photos.length >= MAX_PHOTO_COUNT) {
      Alert.alert("Limite", `Máximo de ${MAX_PHOTO_COUNT} fotos (1 principal + 4).`);
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permissão necessária",
        "Autorize o acesso à galeria para adicionar fotos ao perfil.",
      );
      return;
    }

    try {
      setPickingPhoto(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsMultipleSelection: false,
        quality: 0.7,
        base64: true,
        exif: false,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      const validation = validatePickedPhoto(asset);
      if (!validation.ok) {
        Alert.alert("Foto inválida", validation.message);
        return;
      }

      setPhotos((current) => [
        ...current,
        {
          uri: asset.uri,
          base64: asset.base64,
          mimeType: asset.mimeType || "image/jpeg",
          order: current.length,
        },
      ]);
    } catch (error) {
      Alert.alert("Erro", error?.message || "Falha ao selecionar a foto.");
    } finally {
      setPickingPhoto(false);
    }
  };

  const removePhoto = (index) => {
    setPhotos((current) =>
      current.filter((_, i) => i !== index).map((photo, order) => ({ ...photo, order })),
    );
  };

  const save = async () => {
    if (photos.length < 1) {
      Alert.alert("Atenção", "Mantenha ao menos uma foto no perfil.");
      return;
    }

    try {
      setSaving(true);
      await updateProfile({
        photos: photos.map((photo, order) => ({ ...photo, order })),
      });
      Alert.alert("Salvo", "Fotos atualizadas.");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Erro ao salvar", formatApiError(error, "Não foi possível atualizar as fotos."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title="Fotos"
        subtitle="1 principal e até 4 secundárias. Toque para adicionar da galeria."
        onBack={() => navigation.goBack()}
        large
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.helper}>{photos.length}/5 fotos</Text>
        {photos.map((photo, index) => (
          <View key={`${photo.uri}-${index}`} style={styles.slot}>
            <Image source={{ uri: photo.uri }} style={styles.thumb} />
            <View style={styles.slotInfo}>
              <Text style={styles.slotText}>
                {index === 0 ? "Principal" : `Secundária ${index}`}
              </Text>
              <TouchableOpacity
                onPress={() => removePhoto(index)}
                style={styles.removeBtn}
                hitSlop={8}
              >
                <Feather name="trash-2" size={16} color={colors.coral} />
                <Text style={styles.removeText}>Remover</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        {photos.length < 5 ? (
          pickingPhoto ? (
            <View style={styles.pickerLoading}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : (
            <PrimaryButton title="+ Adicionar foto" variant="ghost" onPress={addPhoto} />
          )
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <PrimaryButton title="Salvar" onPress={save} loading={saving} disabled={saving} />
      </View>
    </SafeAreaView>
  );
}
