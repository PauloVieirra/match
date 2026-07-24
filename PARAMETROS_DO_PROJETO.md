ESPECIFICAÇÃO DE REQUISITOS – MVP
MATCH MAROMBA

> **Nota de integração (2026-07-18):** o backend canônico em desenvolvimento é o monorepo `tinder-academia` (Express + Prisma + PostgreSQL + Socket.IO). Supabase, neste momento, entra só como OAuth Google opcional — não como stack completa abaixo. Estado do app: UI/mocks locais; API ainda não consumida. Ver `tinder-academia/docs/PLANEJAMENTO-MVP.md`.

Objetivo
Este documento descreve os requisitos funcionais, não funcionais, regras de negócio, fluxos, métricas e riscos do MVP (Produto Mínimo Viável) do aplicativo Match Maromba, uma plataforma social de descoberta focada no público fitness, inicialmente validada em Brasília e com potencial de expansão nacional.

1. Visão Geral do Projeto
O Match Maromba é um aplicativo mobile inspirado em plataformas de descoberta social por geolocalização, adaptado ao contexto de academias e estilo de vida fitness. O objetivo é
conectar pessoas com afinidade de rotina de treino, frequência e objetivos físicos.

A infraestrutura de backend **alvo original** deste documento era Supabase full:
- Autenticação (Supabase Auth)
- Banco de dados PostgreSQL
- Extensão geográfica PostGIS
- Storage para mídia
- Realtime para chat

*(Alvo operacional atual: API `tinder-academia` — decisão de produto em aberto no planejamento.)*

2. Escopo do MVP

2.1 Funcionalidades incluídas no MVP
- Cadastro e login
- Criação e edição de perfil fitness
- Upload de fotos
- Geolocalização e descoberta de perfis
- Sistema de swipe
- Geração de match
- Chat em tempo real entre matches
- Filtros básicos de busca
- Bloqueio e denúncia de usuários
- Aceite de termos e política de privacidade

2.2 Funcionalidades fora do MVP (futuras melhorias)
- Monetização (assinaturas, anúncios)
- Stories, vídeos ou reels
- Verificação de identidade por documento
- Chamadas de voz ou vídeo
- Algoritmos avançados de recomendação por IA
- Integração direta com academias




3. Personas e Hipótese de Valor

3.1 Persona Primária (fictícia)
Nome: Lucas Andrade  
Idade: 27 anos  
Localização: Brasília – DF  
Perfil: Frequenta academia 4 a 5 vezes por semana, utiliza aplicativos de relacionamento,
mas sente dificuldade em encontrar pessoas com estilo de vida compatível.

3.2 Hipótese de Valor
- Pessoas fitness preferem se conectar com quem compartilha rotina e objetivos similares.
- A afinidade de treino reduz fricção social e aumenta a qualidade das conexões.

4. Requisitos Funcionais (RF)

RF01 – Autenticação de Usuário  
Cadastro e login via e-mail/senha ou provedores sociais.

RF02 – Perfil Fitness  
Nome (imutável), data de nascimento, nível de treino, frequência semanal, estilo de vida,
exercícios preferidos e biografia curta.

RF03 – Gestão de Mídia  
1 imagem principal e até 4 imagens secundárias (máximo **5 fotos** no total).  
Cada foto: no máximo **5 MB**. Validação no app (`photoLimits.js`) e na API (`PHOTO_TOO_LARGE`).  
Storage: bucket público `public-bucket` (URL legível no swipe); upload somente via backend autenticado.

RF04 – Descoberta e Swipe  
Visualização de perfis próximos com ações de curtir ou passar.

RF05 – Match  
Match automático quando houver curtida mútua.

RF06 – Chat em Tempo Real  
Mensagens de texto entre usuários com match ativo.

RF07 – Filtros de Busca  
Filtro por distância, nível de treino e frequência de academia.

RF08 – Termos e Privacidade  
Aceite obrigatório no primeiro acesso.

RF09 – Bloqueio e Denúncia  
Usuários podem bloquear ou denunciar outros perfis ou mensagens.

5. Regras de Negócio (RB)

RB01 – Limite de Likes  
Usuários podem realizar até 20 curtidas por dia e no máximo 100 curtidas por mês.

RB02 – Imutabilidade do Nome  
O nome não pode ser alterado após a criação do perfil.

RB02b – Limite de Fotos  
Máximo 5 fotos por perfil; cada arquivo até **5 MB**. Acima disso a API retorna `PHOTO_TOO_LARGE`.

RB03 – Exclusão de Conta  
Ao excluir a conta, todos os dados são removidos em até 30 dias.

RB04 – Bloqueio  
Usuários bloqueados não aparecem mais para quem realizou o bloqueio.

RB05 – Match e Chat  
O chat só é habilitado após a geração de um match.

6. Requisitos Não Funcionais (RNF)

RNF01 – Geolocalização  
Uso de latitude e longitude com precisão mínima urbana.(GPS - API Google v3)

RNF02 – Performance  
Consultas geográficas otimizadas via PostGIS.

RNF03 – Segurança  
Uso de Row Level Security (RLS) para todos os dados sensíveis.

RNF04 – Interface  
Design mobile-first, priorizando ações no terço inferior da tela.


7. Arquitetura de Dados (Resumo)

- profiles
- media
- swipes
- matches
- messages


8. Fluxos Principais do MVP

- Onboarding: Cadastro → Perfil → Fotos → Localização
- Descoberta: Lista de perfis → Swipe
- Match: Notificação → Acesso ao chat
- Chat: Envio e recebimento de mensagens
- Perfil: Edição → Salvar → Feedback visual
- Conta: Exclusão e logout


9. Critérios de Aceite (Exemplos)

RF04 – Swipe
Dado um usuário autenticado,
Quando ele curtir ou passar um perfil,
Então a ação deve ser salva e o perfil não deve reaparecer.

RF06 – Chat
Dado um match válido,
Quando uma mensagem é enviada,
Então o destinatário deve recebê-la em tempo real.


10. Moderação e Segurança

- Denúncia de perfil
- Denúncia de mensagem
- Bloqueio de usuário
- Registro de denúncias para análise manual


11. Métricas de Sucesso do MVP

- Taxa de conclusão de perfil
- Swipes por usuário/dia
- Taxa de match
- Matches que geram conversa
- Retenção D1 e D7
- Usuários ativos por região


12. Compliance e LGPD (Versão MVP)

- Consentimento explícito de localização
- Direito de exclusão de dados
- Política de retenção mínima
- Transparência sobre uso de dados pessoais


13. Riscos e Dependências Técnicas

- Precisão limitada de GPS em ambientes fechados
- Custos iniciais de storage e realtime
- Limites de conexões simultâneas
- Dependência da infraestrutura do Supabase




