<<<<<<< HEAD
# 🎮 PokeAI - Pokémon Team Builder
=======
# 🎮 PokéAI
>>>>>>> origin/main

Um aplicativo React Native inteligente para criar e gerenciar equipes Pokémon, com sistema de recomendações baseado em IA e análise estratégica avançada.

<p align="center">
  <img src="https://i.ibb.co/8nJPNxQc/Pok-AI-05-07-2025-1.png" alt="PokéAI Banner" width="80%" />
</p>

## ✨ Funcionalidades

### 🧠 **Sistema de IA Avançado**
- Recomendações inteligentes baseadas em estratégias de equipe
- Análise de sinergia entre Pokémon
- Sistema de pontuação ML para compatibilidade
- Estratégias especializadas (Mono-type, Ofensiva, Defensiva, etc.)

### 📱 **Pokédex Interativa**
- Visualização dos primeiros 151 Pokémon (Geração I)
- Busca por nome ou ID
- Cards visuais com gradientes por tipo
- Detalhes completos de cada Pokémon
- Informações de localização e captura

### 👥 **Gerenciamento de Equipes**
- Criação de equipes com até 6 Pokémon
- Sistema drag-and-drop para reorganizar
- Estatísticas da equipe em tempo real
- Salvar e carregar múltiplas equipes
- Análise de distribuição de tipos

### 🎯 **Estratégias Especializadas**
- **Balanceada**: Equipe equilibrada com boa cobertura
- **Mono-type**: Focada em um único tipo
- **Ofensiva**: Alto dano e velocidade
- **Defensiva**: Resistência e controle
- **Speed**: Controle de velocidade
- **Stall**: Outlast através de recovery
- **Weather**: Aproveitamento de clima
- **Dual Core**: Construída ao redor de dois Pokémon principais

### 📊 **Análises Avançadas**
- Estatísticas médias da equipe
- Fraquezas e resistências comuns
- Adequação à estratégia escolhida
- Sugestões estratégicas personalizadas
- Sistema de avisos e alertas

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- **React Native** 0.79.5 - Framework mobile
- **Expo SDK** 53 - Desenvolvimento e build
- **TypeScript** - Tipagem estática
- **React Navigation** 7 - Navegação entre telas

### **UI/UX**
- **Expo Linear Gradient** - Gradientes visuais
- **React Native SVG** - Ícones vetoriais
- **@expo/vector-icons** - Biblioteca de ícones
- **Gesture Handler** - Interações touch
- **Safe Area Context** - Compatibilidade com diferentes telas

### **Dados & IA**
- **AsyncStorage** - Persistência local
- **PokéAPI** - Dados dos Pokémon
- **Axios** - Requisições HTTP
- **Sistema ML Proprietário** - Recomendações inteligentes

### **Arquitetura**
- **Context API** - Gerenciamento de estado
- **Custom Hooks** - Lógica reutilizável
- **TypeScript Interfaces** - Tipagem de dados
- **Modular Architecture** - Separação de responsabilidades

## 📁 **Estrutura do Projeto**

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ErrorBoundary.tsx
│   ├── LoadingSpinner.tsx
│   ├── PokemonCard.tsx
│   ├── RecommendationCard.tsx
│   ├── StrategySelector.tsx
│   ├── TeamSlot.tsx
│   └── Toast.tsx
├── context/             # Contextos React
│   └── ThemeContext.tsx
├── hooks/               # Custom hooks
│   ├── usePokemon.ts
│   ├── usePokemonLocation.ts
│   ├── useTeam.ts
│   └── useTeamStrategy.ts
├── navigation/          # Configuração de navegação
│   └── AppNavigator.tsx
├── screens/             # Telas do aplicativo
│   ├── HomeScreen.tsx
│   ├── EnhancedTeamScreen.tsx
│   ├── PokemonDetailScreen.tsx
│   └── EnhancedRecommendationsScreen.tsx
├── services/            # Serviços e APIs
│   ├── pokemonApi.ts
│   ├── pokemonLocationApi.ts
│   ├── teamManager.ts
│   ├── mlRecommendation.ts
│   └── enhancedMLRecommendation.ts
├── types/               # Definições TypeScript
│   ├── pokemon.ts
│   ├── pokemonLocation.ts
│   ├── team.ts
│   └── teamStrategy.ts
└── utils/               # Utilitários
    ├── constants.ts
    ├── typeColors.ts
    └── typeEffectiveness.ts
```

## 🚀 **Instalação e Configuração**

### **Pré-requisitos**
- **Node.js** 16+ ou **Bun**
- **Expo CLI**
- **Android Studio** (para Android)
- **Xcode** (para iOS - apenas macOS)

### **1. Clone o repositório**
```bash
git clone https://github.com/seu-usuario/pokeai.git
cd pokeai
```

### **2. Instale as dependências**
```bash
# Com Bun (recomendado)
bun install

# Ou com npm
npm install
```

### **3. Execute o projeto**
```bash
# Iniciar o servidor de desenvolvimento
bun run start

# Para Android
bun run android

# Para iOS
bun run ios

# Para limpar cache
bun run clean
```

## 🤖 **Sistema de IA e Recomendações**

### **Algoritmo de Pontuação**
O sistema utiliza múltiplos fatores para calcular compatibilidade:

```typescript
score = (
  statScore * 0.3 +              // 30% - Adequação às stats da estratégia
  roleScore * 0.25 +             // 25% - Preenchimento de role necessário
  typeBalance * weightTypeBalance + // Peso variável - Balanceamento de tipos
  statComplement * weightStatComplement + // Peso variável - Complementaridade
  defensiveCoverage * weightDefensiveCoverage + // Peso variável - Cobertura defensiva
  offensiveSynergy * weightOffensiveSynergy + // Peso variável - Sinergia ofensiva
  strategyBonus                  // Bônus específico da estratégia
)
```

### **Tipos de Sinergia**
- **Type Balance**: Resistências que cobrem fraquezas
- **Stat Complement**: Stats que se complementam
- **Defensive Coverage**: Cobertura defensiva da equipe
- **Offensive Synergy**: Sinergia ofensiva
- **Role Distribution**: Distribuição equilibrada de papéis

### **Estratégias Especializadas**

#### **Mono-Type**
- Foco em um único tipo Pokémon
- Busca por tipos secundários que mitiguem fraquezas
- Diversidade de roles dentro do mesmo tipo
- Sistema de avisos para vulnerabilidades críticas

#### **Ofensiva/Speed**
- Priorização de alta velocidade e poder ofensivo
- Verificação de cobertura de movimentos
- Alertas para falta de tanques ou proteção

#### **Defensiva/Stall**
- Foco em HP, Defesa e Defesa Especial
- Verificação de win conditions
- Balanceamento entre sustentabilidade e poder ofensivo

## 📱 **Funcionalidades por Tela**

### **🏠 HomeScreen (Pokédex)**
- Listagem de todos os Pokémon da Geração I
- Busca em tempo real por nome ou ID
- Visualização em grid com cards animados
- Indicadores visuais para Pokémon na equipe
- Pull-to-refresh para atualizar dados
- Adição rápida à equipe com botão "+"

### **👥 EnhancedTeamScreen (Minha Equipe)**
- 6 slots organizados em grade 3x2
- Estatísticas da equipe em tempo real
- Análise de adequação à estratégia atual
- Ações: salvar, limpar, recomendações
- Seletor de estratégia integrado
- Distribuição de tipos e roles

### **🎯 EnhancedRecommendationsScreen**
- Recomendações baseadas na estratégia escolhida
- Score de compatibilidade com justificativas
- Análise de pontos fortes e fracos da equipe
- Dicas estratégicas personalizadas
- Sistema de avisos para problemas críticos
- Adição rápida à equipe

### **🔍 PokemonDetailScreen**
- Informações completas do Pokémon
- 4 abas: Estatísticas, Informações, Detalhes, Localização
- Gráficos de barras para stats
- Informações de captura e localização
- Ações de equipe (adicionar/remover)
- Design responsivo com gradientes por tipo

## 🎨 **Design System**

### **Cores por Tipo**
Cada tipo Pokémon possui gradientes únicos:
```typescript
TYPE_GRADIENTS = {
  fire: ['#F08030', '#FF6B35'],
  water: ['#6890F0', '#4FC3F7'],
  grass: ['#78C850', '#81C784'],
  electric: ['#F8D030', '#FFE082'],
  psychic: ['#F85888', '#F48FB1'],
  // ... e mais 13 tipos
}
```

### **Tema Adaptativo**
- Suporte a modo claro e escuro
- Cores adaptáveis por contexto
- Persistência de preferências
- Transições suaves entre temas

### **Componentes Visuais**
- Cards com gradientes dinâmicos por tipo
- Animações fluidas e responsivas
- Feedback visual consistente
- Toasts informativos com ações
- Modais com blur e overlay

## 📊 **Sistema de Localização**

### **Dados de Captura**
- Integração com PokéAPI para encontros
- Dados especiais para starters, lendários e presentes
- Informações de raridade e condições
- Compatibilidade com FireRed/LeafGreen
- Métodos de captura (Surf, Vara, Caminhada, etc.)

### **Raridade**
- **Comum**: 30%+ de chance
- **Incomum**: 15-29% de chance  
- **Raro**: 5-14% de chance
- **Muito Raro**: 1-4% de chance
- **Extremamente Raro**: <1% de chance

## 🔧 **Performance e Otimização**

### **Estratégias de Cache**
```typescript
CACHE_DURATION = {
  POKEMON_DATA: 1000 * 60 * 60,     // 1 hora
  TEAM_DATA: 1000 * 60 * 30,        // 30 minutos  
  RECOMMENDATIONS: 1000 * 60 * 15    // 15 minutos
}
```

### **Otimizações Implementadas**
- **Lazy Loading**: Carregamento sob demanda
- **Memoização**: Hooks otimizados com useMemo/useCallback
- **Virtualization**: FlatList para listas grandes
- **Debouncing**: Busca com delay para reduzir requests
- **Error Boundaries**: Tratamento de erros gracioso

## 🛡️ **Tratamento de Erros**

### **Error Boundary**
- Captura erros em toda a aplicação
- Fallback UI informativo
- Botão de retry automático
- Logs detalhados em desenvolvimento

### **Toast System**
- Notificações não-intrusivas
- 4 tipos: success, error, warning, info
- Ações opcionais (botões)
- Auto-dismiss configurável
- Gradientes por tipo de mensagem

## 🧪 **Debug e Desenvolvimento**

### **Logs Estruturados**
```typescript
console.log('🔍 Buscando localização para Pokémon', pokemonId);
console.log('✅ Encontrou dados da API para Pokémon', pokemonId);
console.log('⚠️ Pokémon não encontrado na natureza - provavelmente evolução');
```

### **Ferramentas de Debug**
- Flipper integration
- React DevTools compatibility
- Metro bundler logs
- Performance monitoring

## 🚀 **Build e Deploy**

### **Configuração EAS**
```bash
# Build de desenvolvimento
eas build --profile development --platform android

# Build preview para teste
eas build --profile preview --platform all

# Build de produção
eas build --profile production --platform all
```

### **Configurações de Build**
- **Development**: Debug habilitado, desenvolvimento interno
- **Preview**: APK para testes, sem debug
- **Production**: Otimizado para stores oficiais

## 📱 **Compatibilidade**

### **Plataformas Suportadas**
- **Android**: API 21+ (Android 5.0+)
- **iOS**: iOS 13.0+
- **Web**: Todos os navegadores modernos

### **Recursos de Acessibilidade**
- Contraste adequado para leitura
- Markup semântico correto
- Suporte a leitores de tela
- Navegação por teclado

## 🤝 **Contribuição**

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/NovaFuncionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/NovaFuncionalidade`)
5. Abra um Pull Request

### **Padrões de Código**
- **TypeScript** obrigatório para type safety
- **ESLint** + **Prettier** para formatação consistente
- **Conventional Commits** para mensagens padronizadas
- **Component-driven** development
- Testes unitários para lógica crítica

### **Estrutura de Commits**
```
feat: adiciona sistema de recomendações por estratégia
fix: corrige bug na navegação entre telas
docs: atualiza README com novas funcionalidades
style: ajusta cores do tema escuro
refactor: reorganiza estrutura de pastas
test: adiciona testes para hook useTeam
```

## 🙏 **Agradecimentos**

- **[PokéAPI](https://pokeapi.co/)** - API completa de dados Pokémon
- **[Expo](https://expo.dev/)** - Framework de desenvolvimento React Native  
- **[React Navigation](https://reactnavigation.org/)** - Navegação fluida
- **Comunidade Pokémon** - Inspiração e feedback constante
- **Desenvolvedores Open Source** - Bibliotecas e ferramentas

<<<<<<< HEAD
## 📞 **Contato e Suporte**

- **Issues**: [GitHub Issues](https://github.com/seu-usuario/pokeai/issues)
- **Discussões**: [GitHub Discussions](https://github.com/seu-usuario/pokeai/discussions)
- **Email**: pokeai.suporte@exemplo.com

## 🔮 **Roadmap Futuro**

### **v2.0 - Expandindo Gerações**
- [ ] Suporte às Gerações II-IV
- [ ] Sistema de movimentos e habilidades
- [ ] Batalhas simuladas
- [ ] Breeding e IVs/EVs

### **v2.1 - Social e Competitivo**
- [ ] Compartilhamento de equipes
- [ ] Rankings e leaderboards
- [ ] Torneios online
- [ ] Sistema de amigos

### **v2.2 - IA Avançada**
- [ ] Machine Learning mais sofisticado
- [ ] Análise de meta-game
- [ ] Predições de matchups
- [ ] Recomendações contextuais

=======
>>>>>>> origin/main
---

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37" />
  <img src="https://img.shields.io/badge/AI_Powered-FF6B6B?style=for-the-badge&logo=brain&logoColor=white" />
</div>

<div align="center">
<<<<<<< HEAD
  <h3>🚀 Feito com ❤️ e IA para a comunidade Pokémon</h3>
  <p><strong>Gotta build 'em all!</strong> 🎮✨</p>
</div>
=======
  <h3>Feito com ❤️ para a comunidade Pokémon</h3>
  <p>Gotta code 'em all! 🚀</p>
</div>
>>>>>>> origin/main
