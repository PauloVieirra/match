import * as Yup from "yup";

const passwordRules = Yup.string()
  .required("Informe a senha.")
  .min(8, "A senha precisa ter pelo menos 8 caracteres.")
  .matches(/[A-Z]/, "A senha precisa conter uma letra maiúscula.")
  .matches(/[a-z]/, "A senha precisa conter uma letra minúscula.")
  .matches(/[0-9]/, "A senha precisa conter um número.");

const emailRules = Yup.string()
  .trim()
  .email("Informe um e-mail válido.")
  .required("Informe o e-mail.");

export const loginSchema = Yup.object({
  email: emailRules,
  password: Yup.string().required("Informe a senha."),
});

export const registerSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "O nome precisa ter pelo menos 2 caracteres.")
    .required("Informe o nome."),
  email: emailRules,
  password: passwordRules,
});
