## 🟢 PROMPT 1

> Estamos criando esse projeto e pro nosso mobile vamos usar expo, estou te entegrando um arquivo com as especificações basica do nosso projeto @go_rocket_league_project_specification_context.md  e tbm uma pasta @UI_React_para_referencia com uma referencia desenvolvida em react/html de toda nossa interface grafica, quero que vc analise os documentos e gere um todo.md que vai nos orientar na construção do nosso aplicativo mobile, é importamte ressaltar que diferente do projeto react que te dei como exemplo, não vamos usar dependencias externas para componentes, queremos criar do zero para termos controle de todo o visual do nosso aplicativo. Organize as fases de forma que possamos testar em vários pontos, app expo criado, depois navegação, depois paginas individuais, vamos por etapas..

---

### 🧠 resposta 

## Criei o arquivo todo.md com o plano de desenvolvimento do aplicativo mobile GoRocketLeague.

Resumo do que foi criado:
O documento está organizado em 7 fases principais, cada uma testável antes de avançar:

### Fase 0: Setup inicial
* Criação do projeto Expo
* Estrutura de pastas
* Configuração de dependências básicas

### Fase 1: Sistema de Design
* Tema e cores
* Componentes base (Button, Card, Badge, ProgressBar, Input, Icon)
* Componentes comuns (HUD, FuelIndicator, XPLevelIndicator)

### Fase 2: Navegação
* Bottom Tab Navigator
* Estrutura básica de todas as telas

### Fase 3: Telas principais (uma por vez)
* ProfileScreen (mais simples - começar aqui)
* AchievementsScreen
* CollectionScreen
* TradesScreen
* MapScreen (mais complexa - deixar por último)
### Fase 4: Telas modais
* CardRevealScreen
* CardDetailsScreen
* CreateTradeScreen
* EditProfileScreen
### Fase 5: Integração e funcionalidades
* Gerenciamento de estado
* Sistemas de Fuel, XP, Cards, Trades, Achievements
* Integração com backend
### Fase 6: Polimento
* Animações
* Performance
* Acessibilidade
* Testes
### Fase 7: Produção
* Build e deploy
* Assets
* Documentação
### Destaques do plano:
* Testável em cada fase: cada fase tem um checkpoint claro
* Incremental: uma fase depende da anterior
* Componentes do zero: sem bibliotecas de UI externas
* Ordem sugerida: começar pelas telas mais simples
* Detalhamento: cada tarefa é específica e acionável
O arquivo está pronto para orientar o desenvolvimento. Comece pela Fase 0 e avance fase por fase, testando cada uma antes de prosseguir.


## 🟢 PROMPT 2

> Limitamos o uso de dependencias externas de componentes prontos, mas fique à vontade para usar dependencias de estilo, como tailwind, para gerenciamento de estados vamos usar context api ou zustand então adicione isso também ao todo.md fazendo os ajustes na parte de estilos, vale lembrar que para nosso tema, nossa paleta de cores principalmente, vc deve usar o que já te forneci na pasta de referencia@UI_React_para_referencia/src/styles/theme.css 

---

### 🧠 resposta 

### Atualizações concluídas. Resumo das mudanças:
### Atualizações realizadas
### 1. Fase 0 - Setup Inicial
* Adicionada configuração do NativeWind (Tailwind CSS para React Native)
* Instruções para configurar o tema baseado em theme.css
* Opções de gerenciamento de estado (Zustand ou Context API)
### 2. Fase 1.1 - Tema e Estilos
* Configuração do tema no tailwind.config.js baseada no theme.css
* Mapeamento das cores oklch do dark theme
* Definição de cores de raridade (Legendary, Rare, Common)
* Radius base e variações
### 3. Fase 5.1 - Gerenciamento de Estado
* Especificação de Zustand (recomendado) ou Context API
* Estrutura de stores/contexts por domínio
* Hooks customizados para facilitar uso
### 4. Seção de Paleta de Cores
* Nova seção no início do documento com a paleta completa
* Cores principais do dark theme
* Cores de destaque e raridade
* Referência ao arquivo de origem
### 5. Dependências Permitidas/Não Permitidas
* NativeWind e Tailwind CSS adicionados como permitidos
* Zustand ou Context API como opções
* Lista atualizada de dependências não permitidas
### 6. Princípios de Desenvolvimento
* Adicionado princípio sobre uso do NativeWind
* Tema dark como padrão
* Referência à paleta do theme.css
### O documento está atualizado e pronto para orientar o desenvolvimento com:
* NativeWind para estilização
* Paleta de cores baseada no theme.css fornecido
* Zustand ou Context API para gerenciamento de estado
* Componentes criados do zero, sem bibliotecas de UI prontas

Tudo documentado e organizado por fases testáveis.