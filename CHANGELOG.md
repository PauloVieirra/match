# Changelog

Todas as mudan�as not�veis deste reposit�rio s�o documentadas neste arquivo.

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).
Versionamento: [SemVer](https://semver.org/lang/pt-BR/).

Vers�o can�nica: campo `version` em [`package.json`](package.json).

---

## [Unreleased]

### Added

- Cliente de localiza��o da API: `src/services/api/location.js`.
- Refresh autom�tico de sess�o no cliente HTTP (`401 -> /auth/refresh -> retry`).
- Discover agora consome perfis por proximidade via backend (sem `mockUsers`).
- Novo handoff para continuidade: `docs/HANDOFF-INTEGRACAO-API-E-MATCHES.md`.

### Changed

- Telas `Discover`, `ProfileDetail`, `Matches`, `Chat` e `MatchCelebration` removem depend�ncia direta de dados mocados de usu�rio.
- `ContextAPI` passa a usar `ensureFreshSession` no boot e simplifica fluxo local de conex�o at� o backend de matches ficar pronto.
- `ProfileGrid` suporta `refreshControl` e mensagens customizadas de estado vazio.

### Security

- App passa a respeitar renova��o de sess�o sem for�ar relogin frequente.
- Fluxos de sess�o alinhados ao endpoint real de refresh no backend.

### Planejado

- OAuth Google via Supabase no app
- Endpoint real de matches/chat para substituir MVP local de conex�o
- Migra��o final de ranking/check-in para dados de API

---
## [1.1.2] — 2026-07-24

Limite de 5 MB por foto e regras de projeto.

### Added

- Validação local de tamanho de foto (**máx. 5 MB**) no onboarding e na tela Photos (`photoLimits.js`)
- `.cursor/rules/profile-photos.mdc`
- RF03 / RB02b em `PARAMETROS_DO_PROJETO.md` — 5 fotos, 5 MB cada

---

## [1.1.1] — 2026-07-24

Persistência dos filtros de descoberta no backend.

### Added

- Persistência de `profile.filters` via `PATCH /profile/me`
- Tela Filtros salva na API (não só AsyncStorage); boot hidrata filtros do perfil remoto
- Loading/erro amigável ao aplicar filtros

---

## [1.1.0] — 2026-07-22

Branch `feat/integracao-back-front` — primeira integração real com a API `tinder-academia` (`auth-supabase`).

### Added

#### Cliente HTTP e sessão

- `src/services/api/client.js` — fetch centralizado, envelope `{ message, statusCode, data }`, Bearer automático, `ApiError` com `code`
- `src/services/api/auth.js` — register, login, refresh, logout, `completeOnboarding`
- `src/services/api/profile.js` — `fetchMyProfile`, `updateMyProfileOnApi`, `fetchPublicProfile`
- `src/services/api/mappers.js` — `mapSwipeProfileToLocal` (API → UI)
- `src/services/session.js` — persistência de tokens e usuário em AsyncStorage
- `src/utils/api/formatApiError.js` — mensagens amigáveis (400/401/409/500, códigos de storage)
- `src/utils/validation/authSchemas.js` — validação local de email/senha
- `.env.example` — `EXPO_PUBLIC_API_URL` (emulador, device, localhost)

#### Telas / fluxos

- `src/screens/EmailAuth/` — cadastro e login por email (alternativa ao fluxo telefone mock)
- Onboarding reescrito — envia perfil + fotos base64 para `POST /auth/complete-onboarding`
- `Photos` — seleção real com `expo-image-picker` (galeria/câmera); removido mock Pexels
- `EditProfile` — `PATCH /profile/me` com loading e tratamento de erro
- `ProfileDetail` — carrega perfil público remoto por UUID (`GET /profile/:userId`)
- `Location` / `TermsConsent` — ajustes alinhados ao fluxo integrado

#### Contexto global

- `contexts/ContextAPI.js` — boot com `fetchMyProfile`; `updateProfile`, `refreshMyProfile`, `getPublicProfile` via API

### Changed

- `SignIn` — entrada para fluxo email + OAuth futuro
- `routes/Auth.routes.js` — rota `EmailAuth`
- `app.json` — plugin `expo-image-picker` (permissões câmera/galeria)
- `package.json` — `expo-image-picker`, dependências de integração
- `PARAMETROS_DO_PROJETO.md` — nota de integração com backend `tinder-academia`
- `.gitignore` — entradas adicionais de ambiente local

### Removed

- Mock de fotos (URLs Pexels) no onboarding e na tela `Photos`

### Fixed

- Erros da API (ex.: RLS no upload) exibidos na UI em vez de falha silenciosa
- Mock Pexels removido do onboarding **e** da tela `Photos` (edição de perfil)
- `expo-image-picker` instalado via `npx expo install` + plugin no `app.json`
- Permissão de galeria solicitada antes de abrir o picker
- Mensagens técnicas (`Supabase upload failed...`) substituídas por `formatApiError`
- `ApiError` passa a expor `code` da API (`STORAGE_RLS_DENIED`, etc.)

### Problemas documentados (integração)

Registro completo: **[docs/TROUBLESHOOTING-INTEGRACAO.md](docs/TROUBLESHOOTING-INTEGRACAO.md)**

| # | Problema | Resumo da correção |
|---|----------|-------------------|
| 1 | Fotos mockadas (Pexels) | `expo-image-picker` + base64 para API |
| 2 | Picker sem permissão / plugin | `app.json` + `requestMediaLibraryPermissionsAsync` |
| 3 | Galeria vazia no emulador | `adb push` para `/sdcard/Pictures/` |
| 4 | `localhost` no Android emulador | `EXPO_PUBLIC_API_URL=http://10.0.2.2:3000` |
| 5 | Erro RLS aparecia cru na UI | `formatApiError` + códigos do backend |
| 6 | Foto sem base64 após pick | `launchImageLibraryAsync({ base64: true })` |
| 7 | SDK Expo / picker incompatível | `npx expo install expo-image-picker` (não npm puro) |
| 8 | `.env` do app cacheado no Metro | `npx expo start -c` após mudar URL |

---

## [1.0.0] — 2026-07 (retrospectivo)

Primeira entrega do app Match Maromba (Expo) — UI completa com dados locais/mocks.

### Added

- Fluxo auth (telefone mock), onboarding multi-step, perfil fitness
- Discover (grid/swipe), ranking, mapa/check-in, chat mock
- Tema visual, animações, likes em fotos, loading pós-onboarding
- IBGE cidades, split login/signup, match flow inicial

### Notes

- Sem consumo real da API — estado 100% local até a branch `feat/integracao-back-front`

---

## Legenda de tipos

- **Added** — funcionalidade nova
- **Changed** — mudança em algo existente
- **Deprecated** — ainda funciona, mas será removido
- **Removed** — removido
- **Fixed** — correção de bug
- **Security** — correção/hardening de segurança

Ao liberar uma versão: mova itens de `[Unreleased]` para uma seção `## [X.Y.Z] — AAAA-MM-DD` e atualize `package.json`.
