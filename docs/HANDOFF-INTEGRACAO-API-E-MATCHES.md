# Handoff: Integração API e próximos passos

## O que foi atualizado

- Discover agora busca usuários próximos via API (`/api/v1/location/nearby`).
- Cliente HTTP faz refresh automático de sessão em `401`.
- Mocks de usuário removidos das telas principais:
  - Discover
  - ProfileDetail
  - Matches
  - Chat
  - MatchCelebration

## Estado atual do app

- Fluxo de login/sessão: funcional com refresh.
- Fluxo de proximidade: funcional (depende de localização e backend com usuários).
- Fluxo de matches/chat: MVP local ainda temporário (sem endpoint real).
- Ranking/Home: continua demonstrativo.

## Próxima tarefa sugerida

1. Integrar endpoint real de matches:
   - criar `src/services/api/matches.js`
   - substituir estado local de `ContextAPI`.
2. Integrar chat real por endpoint ou websocket.
3. Migrar ranking/check-in para dados de backend.
4. Revisar UX para estado vazio do Discover e permissões de GPS.

## Checklist rápido para você continuar

- [ ] Validar refresh automático com token expirado.
- [ ] Validar Discover em dois devices diferentes com GPS ativo.
- [ ] Implementar adapter para endpoint de matches quando backend ficar pronto.
- [ ] Remover mocks restantes de ranking/check-in após API correspondente.
