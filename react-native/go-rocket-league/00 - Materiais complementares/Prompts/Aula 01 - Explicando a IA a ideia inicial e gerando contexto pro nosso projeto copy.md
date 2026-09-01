
# 📘 GoRocketLeague – Histórico Estruturado de Prompts

---

## 🟢 PROMPT 1 

> Olá, meu nome é Luís sou desenvolvedor React Native e quero uma ajuda na criação de um aplicativo, como é ano de copa do mundo, quero criar algo relacionado com o tema. A minha ideia inicial é criar um app/jogo que vai ser parecido com um pokemon Go, porém sem AR e vai ser de encontrar cartas de jogadores de seleções. A copa do mundo de 2026 vai ser composta com 48 seleções aproximadamente 1250 jogadores, quero lançar 1000 cartas unicas de cada jogador ex: Neymar 1/1000 ou Messi 400/1000 então cada carta vai ser única, as cartas vão ser espalhadas no mapa, apenas em terra firme de forma aleatória e vamos definir um raio de ação para cada carta, o jogador não precisa sair fisicamente pra buscar como no pokemon go, ele pode navegar pelo mapa, porém só vai encontrar a carta se estiver dentro do raio da carta e no zoom específico que vamos definir, o usuário vai coletando as cartas e depois pode fazer trocas, ex: quero uma carta do Neymar posso cadastrar uma troca mostrando o que eu ofereço e o jogador que tem a carta que me interessa pode aceitar ou não a troca, os usuários tbm podem organizar as cartas por seleção e ir montando a sua coleção, o jogo também vai ter XP pra conquistas específicas, troféus etc

---

### 🧠 resposta

Oi Luís! 👋
Ideia **muito boa** — dá pra sentir fácil o apelo de Copa + coleção + mapa + troca social. Isso tem cara de app viciante se bem executado 😄⚽🃏
Vou te ajudar a **organizar a ideia**, transformar em algo **tecnicamente viável** e já pensando como um **dev React Native**.

Vou dividir em blocos pra ficar claro:

---

## 1. Conceito refinado (pra não virar um monstro impossível)

Você já tem o núcleo do jogo, que é ótimo. Vou só ajustar termos e lógica pra ficar mais “produto”:

**Core loop do jogador**

1. Abre o mapa
2. Navega virtualmente
3. Encontra cartas (se estiver no raio + zoom correto)
4. Coleta cartas únicas
5. Organiza coleção (por seleção, raridade etc)
6. Troca com outros jogadores
7. Ganha XP, troféus e progresso

Esse loop é sólido 👍

---

## 2. Cartas: estrutura e raridade

### 2.1 Cartas únicas (1/1000)

Aqui vai um ponto importante:

> **1000 cartas únicas por jogador x ~1250 jogadores = 1.250.000 cartas únicas**

Isso é possível, **mas pesado** se não for bem modelado.

👉 Sugestão:
Separar **Carta Base** de **Carta Instância**

### Carta Base (template)

```ts
{
  playerId: "neymar",
  nome: "Neymar Jr",
  seleção: "Brasil",
  posição: "Atacante",
  overall: 91,
  imagem: "neymar.png"
}
```

### Carta Instância (única)

```ts
{
  cardId: "neymar-001-1000",
  playerId: "neymar",
  serial: 1,
  total: 1000,
  rarity: "lendária",
  ownerUserId: null,
  location: {
    lat: -23.55,
    lng: -46.63
  },
  radius: 300, // metros
  zoomLevel: 15
}
```

Assim você:

* Evita duplicar dados
* Facilita balanceamento
* Facilita eventos futuros

---

## 3. Espalhamento das cartas no mapa 🌍

### 3.1 Apenas terra firme

Aqui entra um detalhe técnico importante.

**Opções**:

1. Pré-processar pontos válidos (mais simples)
2. Usar API de land mask (mais caro)

👉 Recomendo para MVP:

* Criar um **grid mundial** (ex: pontos a cada X km)
* Filtrar manualmente:

  * Sem oceanos
  * Sem polos extremos
* Armazenar só pontos válidos

Depois você pode evoluir.

---

### 3.2 Raio + zoom (mecânica muito boa 👌)

Exemplo de regra:

* Raio da carta: 200m a 1000m
* Zoom obrigatório: entre 14 e 17

Lógica:

```ts
if (distance(user, card) <= card.radius && mapZoom === card.zoomLevel) {
  mostrarCarta()
}
```

Isso:

* Evita “varrer o mapa”
* Dá sensação de descoberta
* Te permite criar cartas mais difíceis

---

## 4. Navegação sem andar fisicamente 🧭

Ótima decisão, porque:

* Não depende de GPS real
* Evita problemas legais
* Aumenta retenção

Você pode:

* Travar velocidade de navegação
* Consumir “energia” pra mover grandes distâncias
* Usar cooldown pra evitar spam

---

## 5. Sistema de trocas 🔁

Aqui mora o **lado social**, então vale caprichar.

### 5.1 Modelo de troca

```ts
{
  tradeId: "trade-123",
  fromUserId: "userA",
  toUserId: null, // aberto
  offeredCards: ["neymar-123"],
  wantedCards: ["messi-400"],
  status: "open" | "accepted" | "rejected"
}
```

Fluxo:

1. Usuário cria troca
2. Outros usuários veem
3. Quem tem a carta aceita ou ignora
4. Backend valida ownership
5. Swap atômico (muito importante)

👉 **Nunca confie no client** nessa parte.

---

## 6. Coleção e organização 📚

Features simples que dão muito valor:

* Filtro por seleção
* % de coleção completa
* Álbum por país
* Destaque de cartas raras
* “Faltam X cartas para completar o Brasil”

Isso gera **dopamina pura** 😄

---

## 7. XP, troféus e conquistas 🏆

Sugestão de conquistas:

* Primeira carta
* Primeira lendária
* Completar uma seleção
* 10 / 50 / 100 trocas
* Encontrar carta com zoom perfeito

Modelo simples:

```ts
{
  achievementId: "complete_brazil",
  unlocked: true,
  unlockedAt: Date
}
```

---

## 8. Stack técnica (pensando em React Native)

### Frontend

* React Native + Expo (se possível)
* react-native-maps
* Zustand ou Redux Toolkit
* Reanimated (animações de carta 👀)

### Backend

* Node.js + NestJS ou Fastify
* PostgreSQL (cartas, usuários, trades)
* Redis (cache de mapa / proximidade)
* WebSocket (trocas em tempo real)

### Infra

* Cloud Functions pra eventos
* Jobs pra respawn de cartas
* Rate limit (anti-bot)

---

## 9. MVP REALISTA (muito importante)

Pra não travar no meio, eu faria assim:

### MVP 1

* 5 seleções
* 50 jogadores
* 2000 cartas
* Mapa + coleta
* Coleção local

### MVP 2

* Trocas
* XP básico
* Raridade

### MVP 3

* Escala global
* Eventos de Copa
* Cartas especiais

---

## 10. Próximo passo (te ajudo nisso)

Se você quiser, no próximo passo eu posso:

* 📐 Desenhar a **arquitetura completa**
* 🧠 Criar o **algoritmo de spawn das cartas**
* 🗺️ Pensar na **UX do mapa**
* 🧾 Modelar o **schema do banco**
* 🎮 Ajudar no **balanceamento do jogo**

Me diz:
👉 **você quer focar agora mais na parte técnica ou no game design/balanceamento?**


---

