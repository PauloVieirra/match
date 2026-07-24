/**
 * Mensagens amigáveis para erros da API (ApiError ou Error genérico).
 */
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

  if (apiDescription && apiDescription !== 'Internal Server Error') {
    return apiDescription;
  }

  if (error.statusCode === 401) {
    return 'Sessão expirada. Faça login novamente.';
  }

  if (error.statusCode === 408 || error.statusCode === 0) {
    return 'Sem conexão com o servidor. Verifique a internet e tente de novo.';
  }

  return technical || fallback;
}
