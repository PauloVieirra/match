# Troubleshooting — integração com API Match Maromba (2026-07-22)

Branch: `feat/integracao-back-front`  
Backend: `tinder-academia` / `auth-supabase`

Changelog: [../CHANGELOG.md](../CHANGELOG.md)  
Backend (erros de storage/RLS): [`tinder-academia/docs/TROUBLESHOOTING-INTEGRACAO.md`](../../tinder-academia/docs/TROUBLESHOOTING-INTEGRACAO.md)

---

## 1. Configuração inicial

### 1.1 `EXPO_PUBLIC_API_URL` incorreta

| Ambiente | URL recomendada |
|----------|-----------------|
| Emulador Android | `http://10.0.2.2:3000` |
| iOS Simulator / Expo Web | `http://localhost:3000` |
| Celular físico (mesma Wi‑Fi) | `http://<IP-LAN-PC>:3000` |

**Sintoma:** `formatApiError` → *"Sem conexão com o servidor"* (`statusCode` 0 ou 408).

**Correção:** criar `.env` a partir de `.env.example` e reiniciar o Metro (`npx expo start -c`).

---

### 1.2 Backend não está rodando ou porta errada

**Sintoma:** mesmo erro de rede acima.

**Verificação:**
```bash
curl http://localhost:3000/health
# ou no PC, testar a URL que o app usa (10.0.2.2 no emulador Android)
```

---

## 2. Autenticação e sessão

### 2.1 Sessão expirada

**Sintoma:** *"Sessão expirada. Faça login novamente."* (401).

**Causa:** access token Supabase expirou; refresh automático ainda não implementado (`INT-C03` pendente).

**Correção atual:** fazer logout e login de novo via `EmailAuth`.

---

### 2.2 Senha esquecida

A senha **não** fica no app nem no Mongo — só no Supabase Auth.

**Recuperação (dev):** script no backend:
```bash
cd "D:\Meus Projetos\tinder-academia"
npm run script:change-password -- --email seu@email.com --password "NovaSenha123"
```

---

## 3. Fotos — seleção e upload

### 3.1 Mock Pexels removido

**Antes:** onboarding e tela `Photos` injetavam URLs aleatórias (Pexels).

**Agora:** `expo-image-picker` → `base64` → API → Supabase Storage → URL pública no perfil.

Se a UI ainda mostrar fotos “de stock”, confirme que está na branch `feat/integracao-back-front` e rebuild do app.

---

### 3.2 `expo-image-picker` — instalação e permissões

**Sintoma:** picker não abre, crash ou permissão negada.

**Correção:**
```bash
npx expo install expo-image-picker
```

`app.json` deve incluir o plugin com `photosPermission`. Após alterar plugins nativos, pode ser necessário rebuild do dev client (não só reload JS).

**No código:** `requestMediaLibraryPermissionsAsync()` antes de `launchImageLibraryAsync`.

---

### 3.3 Galeria vazia no emulador

**Sintoma:** galeria abre sem fotos para testar upload.

**Solução (Android):**
```bash
adb push "C:\Users\shado\OneDrive\Pictures\foto1.jpg" /sdcard/Pictures/match-test/foto1.jpg
adb push "C:\Users\shado\OneDrive\Pictures\foto2.jpg" /sdcard/Pictures/match-test/foto2.jpg
adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d file:///sdcard/Pictures/match-test/foto1.jpg
```

Reabra o app e tente adicionar foto de novo.

---

### 3.4 “Não foi possível ler a imagem”

**Sintoma:** Alert após selecionar foto; `asset.base64` vazio.

**Causa:** formato não suportado ou `base64: true` omitido no picker.

**Correção:** em `Photos` / onboarding, `launchImageLibraryAsync({ base64: true, quality: 0.7, mediaTypes: ['images'] })`.

---

### 3.5 Erro ao salvar fotos — RLS / storage

**Sintoma (Alert amigável):**
- *"Falha ao enviar foto: o storage do servidor está sem permissão..."*
- ou *"Upload de fotos temporariamente indisponível"*

**Causa:** problema no **backend** (chave Supabase anon em vez de service role). Não é bug do app.

**O que fazer:**
1. Ver [SUPABASE-STORAGE.md](../../tinder-academia/docs/SUPABASE-STORAGE.md) no backend.
2. Confirmar `SUPABASE_SERVICE_ROLE_KEY` no `.env` da API.
3. Reiniciar a API; log deve mostrar `keyMode: service_role`.

O app já trata esses erros via `formatApiError.js` (códigos `STORAGE_RLS_DENIED`, `STORAGE_MISCONFIGURED`).

---

### 3.6 Foto grande demais

**Sintoma:** *"A foto é grande demais. Use uma imagem de até 5 MB."*

**Causa:** limite no backend (`MAX_PHOTO_BYTES = 5 MB`).

**Correção:** escolher imagem menor ou reduzir `quality` no picker (já em `0.7`).

---

## 4. Perfil e onboarding

### 4.1 Onboarding reabre após completar

**Causa possível:** `onboardingCompleted` false na API ou boot não chama `fetchMyProfile`.

**Verificação:** `GET /api/v1/profile/me` com Bearer — campo `onboardingCompleted: true`.

---

### 4.2 Editar perfil não persiste

**Sintoma:** alterações somem ao reabrir app.

**Verificação:**
- `updateProfile` no `ContextAPI` chama `PATCH /api/v1/profile/me`.
- Token presente (`session.js` / AsyncStorage).
- Erros exibidos via Alert (não falha silenciosa).

---

### 4.3 Perfil público (ProfileDetail) não carrega

**Sintoma:** loading infinito ou fallback para mock local.

**Causa:** `userId` deve ser UUID Mongo (24 hex ObjectId string), não id numérico mock.

**Fluxo:** `getPublicProfile(userId)` → `GET /api/v1/profile/:userId`.

---

## 5. Erros de SDK / dependências

### 5.1 `expo-image-picker` incompatível com SDK Expo

**Sintoma:** warning ou erro na instalação / runtime após upgrade do Expo.

**Correção:** sempre usar:
```bash
npx expo install expo-image-picker
```
(não `npm install expo-image-picker` puro — versão pode divergir do SDK).

---

### 5.2 Metro cache desatualizado após mudar `.env`

**Sintoma:** app ainda usa URL antiga da API.

**Correção:**
```bash
npx expo start -c
```

Variáveis `EXPO_PUBLIC_*` são embutidas no bundle na build; reload simples pode não bastar.

---

## 6. Matriz — mensagem na UI → causa provável

| Mensagem (Alert) | Causa provável |
|------------------|----------------|
| Sem conexão com o servidor | URL errada, API off, firewall |
| Sessão expirada | Token expirado — relogin |
| Falha ao enviar foto (storage...) | Backend Supabase mal configurado |
| A foto é grande demais | > 5 MB |
| Permissão necessária (galeria) | Usuário negou permissão — abrir configurações |
| Limite 5 fotos | Regra de produto (1 principal + 4) |

---

## 7. Arquivos-chave da integração

| Arquivo | Papel |
|---------|--------|
| `src/services/api/client.js` | HTTP + `ApiError` |
| `src/services/api/auth.js` | login, onboarding |
| `src/services/api/profile.js` | GET/PATCH perfil |
| `src/utils/api/formatApiError.js` | mensagens amigáveis |
| `src/services/session.js` | tokens AsyncStorage |
| `contexts/ContextAPI.js` | boot + updateProfile |
| `src/screens/Photos/index.js` | upload real na edição |
| `src/screens/Onboarding/index.js` | fotos no cadastro |
