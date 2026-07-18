import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import { colors } from "../../theme/colors";
import { styles } from "./style";

const COUNTRY_CODES = [
  { code: "+55", flag: "🇧🇷", label: "Brasil" },
  { code: "+351", flag: "🇵🇹", label: "Portugal" },
  { code: "+1", flag: "🇺🇸", label: "EUA" },
  { code: "+44", flag: "🇬🇧", label: "Reino Unido" },
];

function formatPhone(raw) {
  const digits = String(raw || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : "";
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function PhoneAuthScreen({ navigation }) {
  const [country, setCountry] = useState(COUNTRY_CODES[0]);
  const [showCodes, setShowCodes] = useState(false);
  const [phone, setPhone] = useState("");

  const sendCode = () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      Alert.alert("Atenção", "Informe um telefone válido com DDD.");
      return;
    }
    // Mock do envio de SMS — substituir pela API real (Supabase Auth OTP).
    const token = String(Math.floor(100000 + Math.random() * 900000));
    navigation.navigate("VerifyCode", {
      phone: `${country.code} ${phone}`,
      rawPhone: digits,
      token,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title="Seu telefone"
        subtitle="Enviaremos um código por SMS para confirmar seu número."
        onBack={() => navigation.goBack()}
        large
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Telefone</Text>

          <View style={styles.phoneRow}>
            <TouchableOpacity
              style={styles.countryBtn}
              activeOpacity={0.8}
              onPress={() => setShowCodes((v) => !v)}
            >
              <Text style={styles.countryFlag}>{country.flag}</Text>
              <Text style={styles.countryCode}>{country.code}</Text>
              <Feather
                name={showCodes ? "chevron-up" : "chevron-down"}
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="(61) 99999-9999"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={(t) => setPhone(formatPhone(t))}
              maxLength={15}
              autoFocus
            />
          </View>

          {showCodes ? (
            <View style={styles.codesList}>
              {COUNTRY_CODES.map((item) => (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.codeItem, item.code === country.code && styles.codeItemActive]}
                  activeOpacity={0.8}
                  onPress={() => {
                    setCountry(item);
                    setShowCodes(false);
                  }}
                >
                  <Text style={styles.countryFlag}>{item.flag}</Text>
                  <Text style={styles.codeItemLabel}>{item.label}</Text>
                  <Text style={styles.codeItemCode}>{item.code}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : null}

          <Text style={styles.hint}>
            Código do país carregado por padrão ({country.flag} {country.code}). O SMS é simulado no
            MVP.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton title="Receber código" onPress={sendCode} />
      </View>
    </SafeAreaView>
  );
}
