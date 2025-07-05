# 🎮 PokéAI

Um aplicativo React Native moderno para criar e gerenciar equipes Pokémon, com sistema de autenticação Firebase e recomendações inteligentes baseadas em sinergia de tipos e estatísticas.

## ✨ Funcionalidades

### 🔐 **Autenticação**
- Login e registro com Firebase Auth
- Reset de senha via email
- Verificação de email
- Perfil de usuário personalizável

### 📱 **Pokédex Interativa**
- Visualização dos primeiros 151 Pokémon
- Busca por nome ou ID
- Cards visuais com gradientes por tipo
- Detalhes completos de cada Pokémon
- Indicadores visuais para Pokémon na equipe

### 👥 **Gerenciamento de Equipes**
- Criação de equipes com até 6 Pokémon
- Sistema drag-and-drop para reorganizar
- Estatísticas da equipe em tempo real
- Salvar e carregar múltiplas equipes
- Análise de distribuição de tipos

### 🧠 **Sistema de Recomendações Inteligentes**
- Algoritmo ML para sugerir Pokémon
- Análise de sinergia entre tipos
- Complementaridade de estatísticas
- Cobertura defensiva da equipe
- Sistema de pontuação por compatibilidade

### 📊 **Análises Avançadas**
- Estatísticas médias da equipe
- Fraquezas e resistências comuns
- Diversidade de tipos
- Sugestões estratégicas

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

### **Backend & Dados**
- **Firebase Auth** - Autenticação de usuários
- **AsyncStorage** - Persistência local
- **PokéAPI** - Dados dos Pokémon
- **Axios** - Requisições HTTP

### **Arquitetura**
- **Context API** - Gerenciamento de estado
- **Custom Hooks** - Lógica reutilizável
- **TypeScript Interfaces** - Tipagem de dados
- **Modular Architecture** - Separação de responsabilidades

## 📁 **Estrutura do Projeto**

```
src/
├── components/          # Componentes reutilizáveis
│   ├── LoadingSpinner.tsx
│   ├── PokemonCard.tsx
│   ├── RecommendationCard.tsx
│   └── TeamSlot.tsx
├── context/             # Contextos React
│   └── AuthContext.tsx
├── hooks/               # Custom hooks
│   ├── usePokemon.ts
│   └── useTeam.ts
├── navigation/          # Configuração de navegação
│   └── AppNavigator.tsx
├── screens/             # Telas do aplicativo
│   ├── HomeScreen.tsx
│   ├── LoginScreen.tsx
│   ├── PokemonDetailScreen.tsx
│   ├── RecommendationsScreen.tsx
│   └── TeamScreen.tsx
├── services/            # Serviços e APIs
│   ├── authService.ts
│   ├── firebaseConfig.ts
│   ├── mlRecommendation.ts
│   ├── pokemonApi.ts
│   └── teamManager.ts
├── types/               # Definições TypeScript
│   ├── pokemon.ts
│   └── team.ts
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
git clone https://github.com/seu-usuario/pokemon-team-builder.git
cd pokemon-team-builder
```

### **2. Instale as dependências**
```bash
# Com Bun (recomendado)
bun install

# Ou com npm
npm install
```

### **3. Configure o Firebase**
1. Crie um projeto no [Firebase Console](https://console.firebase.google.com/)
2. Ative a **Authentication** com Email/Password
3. Baixe o `google-services.json` e coloque na raiz do projeto
4. Atualize as configurações em `src/services/firebaseConfig.ts`

### **4. Execute o projeto**
```bash
# Iniciar o servidor de desenvolvimento
bun run start

# Para Android
bun run android

# Para iOS
bun run ios
```

## 🔧 **Configuração do Firebase**

### **1. Configuração Web**
```typescript
const firebaseConfig = {
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto-id",
  storageBucket: "seu-projeto.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "seu-app-id"
};
```

### **2. Configuração Android**
- Adicione o `google-services.json` na raiz
- Configure o package name no Firebase Console
- Certifique-se de que o package name coincide com `app.json`

## 📱 **Funcionalidades por Tela**

### **🏠 HomeScreen (Pokédex)**
- Listagem de todos os Pokémon
- Busca em tempo real
- Visualização em grid
- Indicadores de equipe
- Pull-to-refresh

### **👥 TeamScreen (Minha Equipe)**
- 6 slots para Pokémon
- Estatísticas em tempo real
- Ações: salvar, limpar, recomendações
- Distribuição de tipos
- Drag-and-drop (futuro)

### **📊 RecommendationsScreen**
- Algoritmo ML de recomendações
- Score de compatibilidade
- Razões da recomendação
- Tipos de sinergia
- Adição rápida à equipe

### **🔍 PokemonDetailScreen**
- Estatísticas completas
- Informações detalhadas
- Ações de equipe
- Tabs organizadas
- Design responsivo

### **🔐 LoginScreen**
- Login/registro
- Validação de campos
- Reset de senha
- Design moderno
- Feedback visual

## 🤖 **Sistema de Recomendações**

### **Algoritmo de Pontuação**
O sistema utiliza múltiplos fatores para calcular compatibilidade:

```typescript
score = (
  typeBalance * 0.4 +           // 40% - Balanceamento de tipos
  statComplementarity * 0.3 +   // 30% - Complementaridade de stats
  defensiveCoverage * 0.2 +     // 20% - Cobertura defensiva
  diversity * 0.1               // 10% - Diversidade geral
)
```

### **Tipos de Sinergia**
- **Type Balance**: Resistências que cobrem fraquezas
- **Stat Complement**: Stats que se complementam
- **Defensive Wall**: Pokémon defensivos
- **Offensive Core**: Pokémon ofensivos
- **Move Coverage**: Cobertura de movimentos (futuro)

## 🎨 **Design System**

### **Cores por Tipo**
Cada tipo Pokémon possui gradientes únicos:
- **Fire**: `#F08030` → `#FF6B35`
- **Water**: `#6890F0` → `#4FC3F7`
- **Grass**: `#78C850` → `#81C784`
- E muito mais...

### **Componentes Visuais**
- Cards com gradientes dinâmicos
- Animações suaves
- Feedback visual consistente
- Design Material/iOS adaptativo

## 📈 **Performance**

### **Otimizações Implementadas**
- **Cache de API**: Resultados da PokéAPI são cacheados
- **Lazy Loading**: Carregamento sob demanda
- **Memoização**: Hooks otimizados com useMemo/useCallback
- **Virtualization**: FlatList para listas grandes
- **Debouncing**: Busca com delay para reduzir requests

### **Estratégias de Cache**
```typescript
// Cache de 1 hora para dados Pokémon
POKEMON_DATA: 1000 * 60 * 60

// Cache de 30 minutos para dados de equipe
TEAM_DATA: 1000 * 60 * 30

// Cache de 15 minutos para recomendações
RECOMMENDATIONS: 1000 * 60 * 15
```

## 🧪 **Testes e Debug**

### **Debug Mode**
```bash
# Ativar debug no Metro
bun run start --dev

# Logs detalhados
__DEV__ && console.log('Debug info')
```

### **Ferramentas de Debug**
- **Flipper** - Debug React Native
- **React DevTools** - Inspeção de componentes
- **Firebase Console** - Logs de autenticação

## 🚀 **Build e Deploy**

### **Development Build**
```bash
# Build de desenvolvimento
eas build --profile development

# Build preview
eas build --profile preview
```

### **Production Build**
```bash
# Build para produção
eas build --profile production

# Submit para stores
eas submit --platform android
eas submit --platform ios
```

## 🤝 **Contribuição**

### **Como Contribuir**
1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### **Padrões de Código**
- **TypeScript** obrigatório
- **ESLint** + **Prettier** para formatação
- **Conventional Commits** para mensagens
- **Component-driven** development

## 📄 **Licença**

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🙏 **Agradecimentos**

- **[PokéAPI](https://pokeapi.co/)** - Dados dos Pokémon
- **[Firebase](https://firebase.google.com/)** - Backend e autenticação
- **[Expo](https://expo.dev/)** - Framework de desenvolvimento
- **Comunidade Pokémon** - Inspiração e feedback

## 📞 **Contato**

- **Desenvolvedor**: [Seu Nome]
- **Email**: seu.email@exemplo.com
- **LinkedIn**: [Seu LinkedIn]
- **GitHub**: [Seu GitHub]

---

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white" />
  <img src="https://img.shields.io/badge/Expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37" />
</div>

<div align="center">
  <h3>Feito com ❤️ para a comunidade Pokémon</h3>
  <p>Gotta code 'em all! 🚀</p>
</div>
