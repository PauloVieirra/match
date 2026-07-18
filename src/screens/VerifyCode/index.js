import React, { useContext, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenHeader from "../../Components/ui/ScreenHeader";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import { AppContext } from "../../../contexts/ContextAPI";
import { styles } from "./style";

const CODE_LENGTH = 6;

export default function VerifyCodeScreen({ navigation, route }) {
  const { loginWithPhone } = useContext(AppContext);
  const { phone, rawPhone, token } = route.params || {};
  const [code, setCode] = useState("");
  const [currentToken, setCurrentToken] = useState(token);
  const inputRef = useRef(null);

  const validate = async () => {
    if (code.length < CODE_LENGTH) {
      Alert.alert("Atenção", `Informe o código de ${CODE_LENGTH} dígitos.`);
      return;
    }
    if (code !== currentToken) {
      Alert.alert("Código inválido", "Confira o código recebido e tente novamente.");
      setCode("");
      return;
    }
    // Conta existente → login direto; número novo → cadastro (onboarding).
    const result = await loginWithPhone(rawPhone);
    if (!result.isNewAccount) {
      Alert.alert(
        "Bem-vindo(a) de volta",
        result.name ? `Que bom te ver de novo, ${result.name.split(" ")[0]}!` : "Login realizado."
      );
    }
  };

  const resend = () => {
    const next = String(Math.floor(100000 + Math.random() * 900000));
    setCurrentToken(next);
    setCode("");
    Alert.alert("Código reenviado", "Um novo código foi enviado por SMS (simulado).");
  };

  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => code[i] || "");

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title="Código de verificação"
        subtitle={`Enviamos um SMS para ${phone || "seu telefone"}.`}
        onBack={() => navigation.goBack()}
        large
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.boxesRow}
            activeOpacity={1}
            onPress={() => inputRef.current?.focus()}
          >
            {digits.map((d, i) => (
              <View
                key={i}
                style={[styles.box, i === code.length && styles.boxActive, d && styles.boxFilled]}
              >
                <Text style={styles.boxText}>{d}</Text>
              </View>
            ))}
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            keyboardType="number-pad"
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, CODE_LENGTH))}
            maxLength={CODE_LENGTH}
            autoFocus
          />

          <Text style={styles.mockHint}>Código (mock): {currentToken}</Text>

          <TouchableOpacity onPress={resend} activeOpacity={0.8}>
            <Text style={styles.resend}>Não recebeu? Reenviar código</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <View style={styles.footer}>
        <PrimaryButton
          title="Validar código"
          onPress={validate}
          disabled={code.length < CODE_LENGTH}
        />
      </View>
    </SafeAreaView>
  );
}
