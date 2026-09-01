## 🟢 PROMPT 1 

> Vamos agora criar um componente personalizado de toast pra nossa aplicação, vai ter a opção de ser clicável e redirecionar pra alguma página interna com parametros, vamos ter opções de success error, etc, texto, icone duração e o que mais for compatível pra esse tipo de componente, quero que me ajude a idealizar o componente e depois vamos jogar na IA do figma um prompt pra gerar esse componente com um design exclusivo que combine com nossa aplicação, com gradiente, animação etc.  
---

### 🧠 resposta

Boa ideia criar **um Toast próprio**, principalmente porque seu app já tem uma identidade visual forte (gradientes, game feel etc.). Um toast genérico de biblioteca provavelmente não vai combinar com a estética do jogo/app.

Vou dividir em **3 etapas**:

1️⃣ Definição da **API do componente** (como ele será usado no código)
2️⃣ Definição da **estrutura e comportamento**
3️⃣ Preparar o **prompt para a IA do Figma gerar o design**

---

# 1️⃣ API do componente (como vamos usar)

Primeiro precisamos imaginar **como o dev vai chamar o toast**.

Exemplo ideal de uso:

```ts
toast.show({
  type: "success",
  title: "Carta adquirida!",
  message: "Você desbloqueou Neymar 92 OVR",
  icon: "star",
  duration: 4000,
  route: {
    name: "PlayerDetails",
    params: { id: "neymar-92" }
  }
})
```

Outro exemplo:

```ts
toast.show({
  type: "error",
  title: "Falha na troca",
  message: "Não foi possível completar o trade",
})
```

Ou toast simples:

```ts
toast.show({
  message: "Conectando ao servidor..."
})
```

---

# 2️⃣ Interface do Toast

Sugestão de **type definition**

```ts
type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "reward"
  | "system"

type ToastRoute = {
  name: string
  params?: Record<string, any>
}

type ToastOptions = {
  id?: string

  type?: ToastType

  title?: string
  message: string

  icon?: string

  duration?: number

  route?: ToastRoute

  actionLabel?: string
  onPress?: () => void

  haptic?: boolean

  dismissible?: boolean

  progressBar?: boolean
}
```

---

# 3️⃣ Tipos de toast interessantes pro seu app

Como seu app é **game/social**, dá pra ter tipos além do básico.

### success

Ações concluídas

Ex:

* Carta adquirida
* Trade concluído

---

### error

Falhas

Ex:

* Falha no servidor
* Trade cancelado

---

### warning

Atenção

Ex:

* Inventário cheio
* Limite atingido

---

### info

Informativo

Ex:

* Novo evento disponível
* Atualização do jogo

---

### reward (importante pro seu jogo)

Ex:

* Nova carta
* XP ganho
* Item desbloqueado

---

### system

Ex:

* Reconectando
* Sincronizando dados

---

# 4️⃣ Comportamento do Toast

### posição

Sugiro:

**Top Center**

Mobile games usam muito isso.

---

### stack

Múltiplos toasts empilhados.

```
[Toast]
[Toast]
[Toast]
```

máximo:

```
maxToasts = 3
```

---

### dismiss automático

Exemplo:

| tipo    | duração |
| ------- | ------- |
| success | 3000ms  |
| info    | 3500ms  |
| warning | 4000ms  |
| error   | 5000ms  |
| reward  | 4500ms  |

---

### interação

Se tiver `route` ou `onPress`:

👉 toast vira **clicável**

```
cursor: pointer
```

---

### swipe dismiss

Opcional:

```
swipe up
```

ou

```
swipe right
```

---

### progress bar

Muito bom visualmente.

Mostra tempo restante.

---

# 5️⃣ Estrutura visual do componente

Sugestão de layout:

```
┌─────────────────────────────┐
│  ⭐  Carta desbloqueada!     │
│      Neymar 92 OVR          │
│                             │
│      Ver jogador →          │
│──────────── progress ───────│
└─────────────────────────────┘
```

Elementos:

```
container
icon
title
message
action
progress
```

---

# 6️⃣ Estrutura React Native

Arquitetura recomendada:

```
/components
   /toast
      ToastProvider.tsx
      ToastItem.tsx
      useToast.ts
      toast.types.ts
```

---

### ToastProvider

Gerencia estado global

```
const [toasts, setToasts]
```

---

### ToastItem

Renderiza cada toast.

Responsável por:

* animação
* layout
* click

---

### useToast

Hook para usar

```
const toast = useToast()
```

---

# 7️⃣ Animações recomendadas

Para seu app eu faria:

### entrada

```
slide from top
+
fade
+
scale 0.95 → 1
```

---

### saída

```
fade
+
slide up
```

---

### progress

barra animada

---

# 8️⃣ Estilo visual (importante)

Como seu app tem estética **futurista/game**, eu sugeriria:

### container

```
glass / neon card
```

---

### gradiente

ex:

success

```
#22c55e → #4ade80
```

error

```
#ef4444 → #f87171
```

reward

```
#7c3aed → #a78bfa
```

info

```
#0ea5e9 → #38bdf8
```

---

### glow

leve glow nas bordas

---

### borda

```
1px gradient border
```

---

# 9️⃣ Microinterações

Isso deixa o toast MUITO mais premium.

### hover / press

```
scale 1 → 0.98
```

---

### reward

efeito:

```
sparkles
```

ou

```
pulse
```

---

### haptic

quando aparece:

```
Haptics.notificationAsync()
```

---

# 10️⃣ Coisas avançadas que valem muito a pena

### toast com avatar

Ex:

```
Fulano enviou trade
```

---

### toast com mini card

Ex:

```
Carta desbloqueada
```

com mini carta.

---

### toast persistente

Ex:

```
Reconectando...
```

---

# 11️⃣ Agora o Prompt para IA do Figma

Depois de idealizar o componente, podemos pedir pra IA gerar o design.

Prompt sugerido:

```
Create a modern mobile toast notification component for a futuristic football game application.

The design should feel premium, playful and slightly sci-fi, matching the aesthetic of a competitive online game.

Style:
- Mobile game UI
- Futuristic but clean
- Soft glowing gradients
- Slight glassmorphism effect
- Dark UI background
- Bold shapes
- Subtle neon lighting
- Smooth rounded corners

Component structure:
- Icon on the left
- Title
- Message text
- Optional action button
- Animated progress bar indicating remaining time

Variants to design:
1. Success
2. Error
3. Warning
4. Info
5. Reward (special highlight)

Visual details:
- Each variant should have a unique gradient color
- Slight glow around the card
- Subtle shadow for depth
- Gradient border or glow effect
- Progress bar using a gradient
- Icon container with soft background glow

Interaction states:
- Normal
- Pressed / clickable state
- Multiple stacked toasts

Animation ideas to suggest in the design:
- Slide from top
- Fade in
- Slight scale pop
- Progress bar decreasing over time

Background context:
The app is a mobile game where players collect and trade Rocket League player cards, so the component should feel energetic and game-like.

Important:
The component must feel unique and not like a generic UI library toast.
```

---

# Se quiser, posso também te mostrar

1️⃣ **A arquitetura ideal do ToastProvider**
2️⃣ **Implementação com Reanimated + Gesture** (fica absurdo de bom)
3️⃣ **Sistema global `toast.success()`, `toast.error()` estilo API de libs modernas**
4️⃣ **versão com Skia glow igual você usou no FlatList**

E honestamente… dá pra fazer um **toast MUITO bonito pro seu app**. 🚀

### Com o prompt acima geramos no figma o design + html e trouxemos como referencia ao cursor onde os prompts foram os seguintes: 

## 🟢 PROMPT 1 
>Vamos agora criar um componente de toast personalizado pra nossa aplicação, vou te passar a referencia@High-fidelity mobile game UI/src/app/components/toast , crie tbm uma página de demostração como no exemplo @High-fidelity mobile game UI/src/app/components/ToastDemo.tsx , pra conseguirmos testar o componente, siga essa tipagem

type ToastType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "reward"
  | "system"

type ToastRoute = {
  name: string
  params?: Record<string, any>
}

type ToastOptions = {
  id?: string

  type?: ToastType

  title?: string
  message: string

  icon?: string

  duration?: number

  route?: ToastRoute

  actionLabel?: string
  onPress?: () => void

  haptic?: boolean

  dismissible?: boolean

  progressBar?: boolean
}


## 🟢 PROMPT 2

>No componente de toast em vários lugares tem cores hardcoded não podemos usar assim, precisa vir do tema da aplicação, cadastre as cores lá e depois utilize, o toast tbm nào pode ter o background transparente está com uma opacidade muito baixa, tente 95% se não ficar bom deixamos com cor sólida posteriormente

## 🟢 PROMPT 3

>O ajuste funcionou, mas ainda vou preferir a cor sólida mesmo, entretando encontre um equivalente sólido pra cor que estava no primeiro momento note que quando aumentou a opacidade a cor ficou muito mais forte e não é interessante, então tente encontrar um equivalente sólido pra o nível de transparência que estava no primeiro momento

## 🟢 PROMPT 4

>Vamos usar o skia pra gerar no background um gradiente suave, o mesmo pro botÃo de acao do toast, um gradiente suave deslocando apenas uns 10 a 15% da cor

## 🟢 PROMPT 5

>Vamos implementar agora o swipe to dismiss, vamos inicialmente deixar pra direita ou para cima

## 🟢 PROMPT 6

>@mobile/gorocketleague/assets/animations/Space.json vamos tentar usar essa animação lottie como background pro nosso toast 