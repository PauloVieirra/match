/**
 * Mensagens amigáveis (PT-BR) para erros da API (ApiError ou Error genérico).
 */

const AUTH_PHRASE_MAP = [
  [/invalid credentials/i, 'E-mail ou senha incorretos.'],
  [/email already registered/i, 'Este e-mail já está cadastrado.'],
  [/user account is deactivated/i, 'Conta desativada. Entre em contato com o suporte.'],
  [/invalid login payload/i, 'Dados de login inválidos. Confira e-mail e senha.'],
  [/invalid register payload/i, 'Dados de cadastro inválidos. Confira os campos.'],
  [/failed to login/i, 'Não foi possível entrar. Tente novamente.'],
  [/failed to register user/i, 'Não foi possível criar a conta. Tente novamente.'],
  [/invalid or expired refresh token/i, 'Sessão expirada. Faça login novamente.'],
  [/password must be at least \d+ characters/i, 'A senha deve ter pelo menos 8 caracteres.'],
  [/password must contain an uppercase letter/i, 'A senha precisa de uma letra maiúscula.'],
  [/password must contain a lowercase letter/i, 'A senha precisa de uma letra minúscula.'],
  [/password must contain a number/i, 'A senha precisa de um número.'],
  [/password is required/i, 'Informe a senha.'],
  [/email is required/i, 'Informe o e-mail.'],
  [/name is required/i, 'Informe o nome.'],
  [/network request failed/i, 'Sem conexão com o servidor. Verifique a internet e tente de novo.'],
  [/request timeout/i, 'O servidor demorou para responder. Tente novamente.'],
  [/request failed/i, 'Não foi possível concluir a operação.'],
];

function translatePhrase(text) {
  if (!text || typeof text !== 'string') return null;
  const trimmed = text.trim();
  for (const [pattern, pt] of AUTH_PHRASE_MAP) {
    if (pattern.test(trimmed)) return pt;
  }
  return null;
}

export function formatApiError(error, fallback = 'Não foi possível concluir a operação.') {
  if (!error) return fallback;

  const body = error.body || {};
  const code = body.code || error.code;
  const apiDescription = body.description;
  const errors = Array.isArray(error.errors)
    ? error.errors.filter(Boolean)
    : Array.isArray(body.errors)
      ? body.errors.filter(Boolean)
      : [];

  const technical = errors[0] || error.message || fallback;

  if (code === 'STORAGE_RLS_DENIED' || /row-level security|rls policy/i.test(technical)) {
    return (
      apiDescription ||
      'Não foi possível enviar a foto: o storage do servidor está sem permissão. ' +
        'Tente novamente mais tarde.'
    );
  }

  if (code === 'STORAGE_MISCONFIGURED') {
    return apiDescription || 'Upload de fotos temporariamente indisponível. Tente mais tarde.';
  }

  if (code === 'PHOTO_TOO_LARGE' || /exceeds .* bytes|grande demais/i.test(technical)) {
    return apiDescription || 'A foto é grande demais. Use uma imagem de até 5 MB.';
  }

  if (code === 'STORAGE_UPLOAD_FAILED' || /Supabase upload failed/i.test(technical)) {
    if (apiDescription) return apiDescription;
    return technical.replace(/^Supabase upload failed:\s*/i, 'Falha ao enviar foto: ');
  }

  // Auth / mensagens técnicas em inglês → PT-BR (prioriza errors[] do campo)
  const fieldErrors = errors
    .map((msg) => translatePhrase(msg))
    .filter(Boolean);
  if (fieldErrors.length > 0) {
    return [...new Set(fieldErrors)].join('\n');
  }

  const translatedDescription = translatePhrase(apiDescription);
  if (translatedDescription) return translatedDescription;

  const translatedMessage = translatePhrase(error.message);
  if (translatedMessage) return translatedMessage;

  if (apiDescription && apiDescription !== 'Internal Server Error') {
    return translatePhrase(apiDescription) || apiDescription;
  }

  if (error.statusCode === 401) {
    return 'Sessão expirada. Faça login novamente.';
  }

  if (error.statusCode === 403) {
    return 'Conta desativada. Entre em contato com o suporte.';
  }

  if (error.statusCode === 408 || error.statusCode === 0) {
    return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  }

  const translatedTechnical = translatePhrase(technical);
  if (translatedTechnical) return translatedTechnical;

  return technical || fallback;
}
