import React, { useContext, useState } from "react";
import { useFormik } from "formik";
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
import ScreenHeader from "../../Components/ui/ScreenHeader";
import PrimaryButton from "../../Components/ui/PrimaryButton";
import { AppContext } from "../../../contexts/ContextAPI";
import { ApiError } from "../../services/api/client";
import { loginSchema, registerSchema } from "../../utils/validation/authSchemas";
import { styles } from "./style";

export default function EmailAuthScreen({ navigation, route }) {
  const { registerWithEmail, loginWithEmail } = useContext(AppContext);
  const initialMode = route?.params?.mode === "register" ? "register" : "login";

  const [mode, setMode] = useState(initialMode);
  const isRegister = mode === "register";

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: isRegister ? registerSchema : loginSchema,
    enableReinitialize: false,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      const credentials = {
        email: values.email.trim().toLowerCase(),
        password: values.password,
      };

      try {
        if (isRegister) {
          await registerWithEmail({
            ...credentials,
            name: values.name.trim(),
            termsAccepted: true,
          });
        } else {
          await loginWithEmail(credentials);
        }
        // Routes.js troca de stack conforme user / onboardingCompleted
      } catch (err) {
        const message =
          err instanceof ApiError
            ? err.errors?.length
              ? err.errors.join("\n")
              : err.message
            : err?.message || "Falha na autenticação";
        helpers.setStatus(message);
        Alert.alert(isRegister ? "Cadastro" : "Login", message);
      }
    },
  });

  const changeMode = (nextMode) => {
    setMode(nextMode);
    formik.setTouched({});
    formik.setErrors({});
    formik.setStatus(undefined);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right", "bottom"]}>
      <ScreenHeader
        title={isRegister ? "Criar conta" : "Entrar"}
        subtitle="Use e-mail e senha para conectar com a API Match Maromba."
        onBack={() => navigation.goBack()}
        large
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.modeRow}>
            <TouchableOpacity
              style={[styles.modeBtn, !isRegister && styles.modeBtnOn]}
              onPress={() => changeMode("login")}
              activeOpacity={0.85}
            >
              <Text style={[styles.modeText, !isRegister && styles.modeTextOn]}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, isRegister && styles.modeBtnOn]}
              onPress={() => changeMode("register")}
              activeOpacity={0.85}
            >
              <Text style={[styles.modeText, isRegister && styles.modeTextOn]}>Cadastrar</Text>
            </TouchableOpacity>
          </View>

          {isRegister ? (
            <>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                value={formik.values.name}
                onChangeText={formik.handleChange("name")}
                onBlur={formik.handleBlur("name")}
                placeholder="Como quer ser chamado"
                placeholderTextColor="rgba(255,255,255,0.35)"
                autoCapitalize="words"
              />
              {formik.touched.name && formik.errors.name ? (
                <Text style={styles.fieldError}>{formik.errors.name}</Text>
              ) : null}
            </>
          ) : null}

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={formik.values.email}
            onChangeText={formik.handleChange("email")}
            onBlur={formik.handleBlur("email")}
            placeholder="voce@email.com"
            placeholderTextColor="rgba(255,255,255,0.35)"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {formik.touched.email && formik.errors.email ? (
            <Text style={styles.fieldError}>{formik.errors.email}</Text>
          ) : null}

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            value={formik.values.password}
            onChangeText={formik.handleChange("password")}
            onBlur={formik.handleBlur("password")}
            placeholder={isRegister ? "Mín. 8 caracteres" : "Sua senha"}
            placeholderTextColor="rgba(255,255,255,0.35)"
            secureTextEntry
          />
          {formik.touched.password && formik.errors.password ? (
            <Text style={styles.fieldError}>{formik.errors.password}</Text>
          ) : null}

          {isRegister ? (
            <Text style={styles.hint}>
              Senha com pelo menos 8 caracteres, incluindo maiúscula, minúscula e número.
            </Text>
          ) : (
            <Text style={styles.hint}>Conta nova? Troque para Cadastrar acima.</Text>
          )}

          {formik.status ? <Text style={styles.error}>{formik.status}</Text> : null}
        </ScrollView>

        <View style={styles.footer}>
          <PrimaryButton
            title={isRegister ? "Criar conta" : "Entrar"}
            onPress={formik.handleSubmit}
            loading={formik.isSubmitting}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
