
---
## 🟢 PROMPT 1 

> Quero criar o onboarding da nossa aplicação, ele precisa conter instruções sobre nosso aplicativo em tres ou quarto telas, e na tela final vamos ter a mensagem de boas vindas e as opções de login social com appleid com google e continuar como usuário convidado. Pra fazer a interface, o visual desse componente quero usar a IA do figma, então preciso definir com você esse componente pra podermos gerar um prompt pra IA do Figma gerar o design, não precisa incluir informações sobre tema, porque a IA do figma já tem nosso projeto de design então já sabe dessas coisas.

>Tem alguma dúvida que precise esclarecer? se não já pode gerar o prompt pra IA do figma, não se preocupe inicialmente com o conteúdo (texto, animações) isso a gente define depois   
---

### 🧠 resposta

Perfeito — como você vai usar a IA do **Figma** e ela já tem acesso ao design system do projeto, o ideal é dar um prompt **estrutural e comportamental**, focado em layout, estados e componentes reutilizáveis (sem tema, cor ou tipografia).

Antes de gerar, só duas dúvidas rápidas que impactam bastante o layout:

1. **Mobile only?** (imagino que sim, já que você trabalha com React Native)
2. **Quantas telas prefere no onboarding:** 3 ou 4?

   * 3 → mais direto (recomendado na maioria dos apps)
   * 4 → permite explicar melhor funcionalidades

Se quiser, posso ajustar depois, mas abaixo já deixo um **prompt otimizado** que funciona bem com IA de UI.

---

# Prompt para IA do Figma

Crie um **fluxo de onboarding mobile** para um aplicativo, composto por **3 a 4 telas horizontais navegáveis** (swipe ou botão de próximo).

O objetivo do onboarding é **apresentar rapidamente o aplicativo para novos usuários** e ao final permitir que eles entrem no app usando login social ou como convidado.

## Estrutura geral

Criar um **componente reutilizável de onboarding** com paginação.

Cada tela deve conter:

* Área principal com **ilustração ou visual representativo**
* **Título**
* **Texto curto de descrição**
* **Indicador de progresso/paginação** (dots)
* **Botão primário de próxima etapa**

As telas devem permitir **navegação por swipe horizontal**.

Também incluir um botão discreto de **“Pular” (Skip)** no topo.

---

## Layout base das telas 1–3 (informativas)

Estrutura vertical:

1. Topo

   * Botão "Pular"

2. Área central

   * Grande espaço para **ilustração ou mock visual**

3. Área de conteúdo

   * Título
   * Texto descritivo curto

4. Rodapé

   * Indicador de páginas (dots)
   * Botão **Próximo**

O layout deve priorizar **clareza, espaçamento generoso e leitura rápida**.

---

## Tela final (Login / Boas-vindas)

Estrutura:

1. Ilustração ou visual principal
2. Título de boas-vindas
3. Texto curto explicando que o usuário pode entrar ou continuar como convidado

Abaixo apresentar **3 opções de entrada:**

* Botão **Continuar com Apple**
* Botão **Continuar com Google**
* Botão **Continuar como convidado**

Regras de layout:

* Botões empilhados verticalmente
* Login social com destaque visual
* Opção de convidado com estilo secundário

Também incluir:

* Indicador de páginas
* Possibilidade de voltar para telas anteriores

---

## Componentes que devem ser criados

Criar componentes reutilizáveis para:

* **Onboarding page**
* **Progress indicator (dots)**
* **Botões sociais**
* **Botão primário**
* **Botão secundário**

---

## Requisitos de UX

* Layout otimizado para **mobile**
* Estrutura preparada para **3 ou 4 páginas**
* Design focado em **conversão e simplicidade**
* Elementos preparados para **animações futuras**

---

Se quiser, eu também posso te ajudar com mais três coisas que **melhoram MUITO o resultado da IA do Figma**:

1️⃣ **Versão do prompt otimizada para Figma AI (mais curta e assertiva)**
2️⃣ **Definir o conteúdo ideal das 3 telas** (copywriting que converte)
3️⃣ **Definir microinterações e animações** para o onboarding (isso deixa o app com cara de produto grande).


## 🟢 PROMPT 2

> Vamos agora definir nossos textos do onboarding, vamos tentar colocar em 4 paginas, precisamos explicar o máximo do nosso app em poucas palavras que precisam criar expectativa no usuário, Precisamos explicar além das funcionalidades o contexto, (O usuário é um alienígena que veio ao planeta terra para coletar/recrutar jogadores pra disputar partidas de futebol da RocketLeague) ai vamos explicar do mapa, das trocas de cartas e das batalhas de cartas. Mas lembre, em poucas palavras precisamos explicar e gerar vontade de jogar.  
---

### 🧠 resposta

Perfeito. Como seu jogo tem **tema + mecânicas**, o ideal é que o onboarding siga uma lógica narrativa curta:

1️⃣ **Contexto (história)**
2️⃣ **Exploração do mapa**
3️⃣ **Coleção e trocas**
4️⃣ **Batalhas**

Assim o jogador entende **por que ele está fazendo aquilo**, o que aumenta muito o engajamento.

Vou manter **textos curtos (padrão mobile)**:

* **título forte**
* **1 frase curta explicativa**

---

# Textos do Onboarding

## Tela 1 — Contexto (história)

**Título**
Você veio à Terra em uma missão

**Texto**
Explore o planeta para recrutar os melhores jogadores de Rocket League e montar o time definitivo.

💡 Ideia de ilustração: alien olhando o planeta Terra / radar detectando jogadores.

---

## Tela 2 — O Mapa

**Título**
Explore o mapa do mundo real

**Texto**
Descubra jogadores espalhados pelo mapa e colete novas cartas enquanto explora diferentes lugares.

💡 Ideia de ilustração: mapa com cartas aparecendo.

---

## Tela 3 — Cartas e trocas

**Título**
Colecione e troque cartas

**Texto**
Encontre novos jogadores e faça trocas com outros usuários para completar sua coleção.

💡 Ideia de ilustração: cartas sendo trocadas entre jogadores.

---

## Tela 4 — Batalhas

**Título**
Desafie outros jogadores

**Texto**
Monte sua estratégia e dispute batalhas de cartas para provar que seu time é o melhor da galáxia.

💡 Ideia de ilustração: duas cartas duelando.

---

# Tela final (login)

**Título**
Bem-vindo à missão

**Texto**
Entre agora e comece a recrutar jogadores pelo planeta.

Botões:

* Continuar com Apple
* Continuar com Google
* Continuar como convidado

---

💡 **Dica de game design:**
Se quiser aumentar a vontade de jogar, podemos incluir uma frase de **recompensa inicial**, tipo:

> "Seu primeiro radar já está ativo."

ou

> "Seu primeiro jogador está esperando."

Isso aumenta muito a conversão no onboarding.

---

Se quiser, também posso te mostrar **uma técnica usada em jogos mobile grandes** (tipo Pokémon GO) para onboarding de **mapa + coleta**, que pode deixar o seu onboarding **muito mais viciante logo no começo**.


## 🟢 PROMPT 3

> quero gerar agora essas imagens em outra IA,  crie prompts para cada uma dessas 4 imagens tentando destacar que quero o fundo transparente, e eu vou compartilhar junto com seu prompt uma imagem de exemplo de avatares do nosso jogo .  
---

### 🧠 resposta

Perfeito. Como você vai enviar **uma imagem de referência dos avatares**, o prompt deve pedir para a IA **seguir o mesmo estilo visual**. Também é importante reforçar **PNG com fundo transparente**, porque muitos geradores ignoram isso se não for explícito.

Vou estruturar os prompts de forma que funcionem bem em IAs como **Midjourney**, **DALL·E**, **Stable Diffusion** ou **Leonardo AI**.

Use sempre junto com a imagem de referência do avatar.

---

# Imagem 1 — Alienígena chegando à Terra (contexto)

**Prompt**

Create a playful cartoon illustration of a small alien scout arriving at planet Earth to recruit Rocket League players.
The alien should look curious and excited, scanning the planet with a futuristic holographic radar device that detects players.

Style requirements:

* Match the **same visual style as the provided character reference**
* Cute stylized game art
* Rounded shapes and expressive character design
* Vibrant and friendly game illustration

Composition:

* The alien floating or standing while looking at a holographic projection of Earth
* The hologram showing player icons or card silhouettes
* Dynamic pose conveying discovery and mission

Technical requirements:

* **Transparent background**
* **PNG**
* **No background elements**
* Clean edges
* Illustration centered and isolated for UI use

---

# Imagem 2 — Exploração do mapa

**Prompt**

Create a playful cartoon illustration of an alien explorer discovering Rocket League player cards across a world map.

Scene concept:
The alien is interacting with a holographic world map where collectible player cards are appearing in different locations.

Style requirements:

* Match the **same visual style as the provided character reference**
* Cute stylized mobile game illustration
* Clean shapes and vibrant colors
* Friendly and playful tone

Composition:

* Alien pointing or interacting with a holographic map
* Player cards popping up from map locations
* Visual cues of exploration or scanning

Technical requirements:

* **Transparent background**
* **PNG**
* **No background scenery**
* Centered illustration for onboarding UI

---

# Imagem 3 — Troca de cartas

**Prompt**

Create a cartoon style illustration showing a card trading moment between players in a collectible card game.

Scene concept:
Two Rocket League player cards floating in the air while the alien character facilitates a trade using a futuristic device.

Style requirements:

* Match the **same visual style as the provided character reference**
* Stylized mobile game art
* Friendly, playful, and colorful
* Smooth shapes and expressive design

Composition:

* Two cards moving toward each other as if being traded
* Alien controlling the trade with a holographic interface
* Energy or visual effect suggesting exchange

Technical requirements:

* **Transparent background**
* **PNG**
* **No background environment**
* Clean edges and centered composition

---

# Imagem 4 — Batalha de cartas

**Prompt**

Create a dynamic cartoon illustration representing a card battle between Rocket League players.

Scene concept:
Two powerful player cards facing each other in a dramatic duel while the alien character watches the battle with excitement.

Style requirements:

* Match the **same visual style as the provided character reference**
* Stylized mobile game art
* Energetic and exciting
* Bold shapes and expressive characters

Composition:

* Two cards colliding with energy effects
* Alien reacting to the battle
* Visual effects suggesting competition and action

Technical requirements:

* **Transparent background**
* **PNG**
* **No background scenery**
* Illustration centered and isolated for onboarding use

---

💡 **Dica importante para IA de imagem (isso melhora MUITO o resultado):**

Adicione no final do prompt:

```
mobile game illustration, onboarding illustration, vector style, clean shapes, transparent background, png, isolated
```

---

Se quiser, também posso te ajudar com algo que **vai deixar seu onboarding muito mais profissional**:

* Criar um **guia de consistência visual das 4 imagens** (ângulo da câmera, pose do alien, proporção etc.)

Isso faz parecer que as artes foram feitas por **um único artista**, não por IA. 🎮👽--

---
--- CURSOR ---

## PROMPT 4 

>Quer agora implementar o componente de Onboarding na nossa aplicação, vou te passar a referência do design, e quero que crie conforme a referência, inclusive com a separação dos componentes @High-fidelity mobile game UI (1)/src/app/components/OnboardingScreen.tsx , lembre de usar apenas cores que estão no nosso tema, se precisar criar uma nova cor, crie no arquivo correspondente, e os textos precisar seguir o padrão i18n que estamos adotando, inicialmente não precisa cadastrar os textos de conteúdo do onboarding nas traduções porque ainda não estão definidos

## PROMPT 5

>o runOnJS está obsoleto se precisar usar use o scheduleOnRN do worklets

## PROMPT 6

>Pra esse momento, quero que o Onboardin inicie toda vez que eu recarrgegar a aplicação, para que eu possa desenvolver o componente sem matar a sessão toda vez, após a conclusão desse componente aí vamos implementar a funcionalidade de visto na userStore

## PROMPT 7

Agora já tenho os textos do Onboarding, podemos agora implementar ja no padrão i18n

## Tela 1 — Contexto (história)

**Título**
Você veio à Terra em uma missão

**Texto**
Explore o planeta para recrutar os melhores jogadores de Rocket League e montar o time definitivo.

💡 Ideia de ilustração: alien olhando o planeta Terra / radar detectando jogadores.

---

## Tela 2 — O Mapa

**Título**
Explore o mapa do mundo real

**Texto**
Descubra jogadores espalhados pelo mapa e colete novas cartas enquanto explora diferentes lugares.

💡 Ideia de ilustração: mapa com cartas aparecendo.

---

## Tela 3 — Cartas e trocas

**Título**
Colecione e troque cartas

**Texto**
Encontre novos jogadores e faça trocas com outros usuários para completar sua coleção.

💡 Ideia de ilustração: cartas sendo trocadas entre jogadores.

---

## Tela 4 — Batalhas

**Título**
Desafie outros jogadores

**Texto**
Monte sua estratégia e dispute batalhas de cartas para provar que seu time é o melhor da galáxia.

💡 Ideia de ilustração: duas cartas duelando.

---

# Tela final (login)

**Título**
Bem-vindo à missão

**Texto**
Entre agora e comece a recrutar jogadores pelo planeta.
Seu primeiro jogador está esperando.

Botões:

* Continuar com Apple
* Continuar com Google
* Continuar como convidado

## PROMPT 8

>as imagens não tem fundo transparente então não está muito legal, deixe ela ocupando toda a largura da tela e use um gradiente skia para fazer melhor a mescla entre a imagem e o background da area de baixo 


## PROMPT 9

>As animações não estÃo funcionado em todo swipe e em todo next no obording, toda vez que navego para uma tela, seja pelo next, seja pelo swipe, indo ou voltando, a animação da imagem deve rodar