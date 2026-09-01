## 🟢 PROMPT 1

> Agora já temos o design pronto feito no figma / react html, e vamos agora iniciar o desenvolvimento do nosso app no editor de código efetivamente, vamos importar ao workspace o código html então ele vai ter um bom entendimento da nossa parte visual, mas quero que crie um documento, com as especificações do nosso projeto até aqui, pra servir de reforço de contexto pra IA que vai estar integrada ao nosso editor de código.

---

### 🧠 resposta 

# GoRocketLeague – Project Specification & Context

## 1. Project Overview

**GoRocketLeague** is a mobile game application inspired by world football and map-based exploration. The core experience combines:

* Global map navigation (virtual, not tied to real-world movement)
* Collection of unique football player cards
* Exploration gated by a rocket fuel system
* Social interaction through card trading
* Progression via XP, levels, and achievements

The theme blends **football + rockets + exploration**, with a game-first UX rather than a utility app.

This document serves as **persistent context** for AI-assisted development inside the code editor.

---

## 2. Core Design Principles

* The map represents a **global exploratory board**, not real-life movement
* Players navigate freely using scroll, zoom, and teleportation
* Discovery is controlled by **zoom level + proximity radius**, not GPS walking
* Scarcity and value come from **unique card serials** and controlled spawn logic
* No monetization in the initial phase
* Systems are designed to be **scalable, adjustable, and server-authoritative**

---

## 3. Core Gameplay Loop

1. Player opens the Map
2. Navigates the world using rocket fuel
3. Detects hidden cards when zoom and proximity conditions are met
4. Scans and reveals a player card
5. Collects the card and gains XP/fuel
6. Organizes cards in the Collection
7. Trades cards with other players
8. Unlocks achievements and progression

---

## 4. Cards System

### 4.1 Card Base (Template)

Represents a football player and shared metadata.

* Player name
* National team
* Position
* Overall / rating
* Player image

Example fields:

* playerId
* name
* nation
* position
* overall
* image

### 4.2 Card Instance (Unique Collectible)

Each collectible card is **globally unique**.

Key properties:

* cardId (unique)
* playerId (reference to Card Base)
* serialNumber (e.g. 400)
* serialTotal (e.g. 1000)
* rarity
* ownerUserId (null if not collected)
* spawnLocation (lat, lng)
* detectionRadius (200–1000 meters)
* requiredZoomLevel

Important rules:

* Total theoretical cards: ~1.25M
* Only a subset exists on the map at any time
* Cards are instantiated dynamically

---

## 5. Map & Exploration

### 5.1 Map Behavior

* Full-screen interactive world map
* Free navigation via drag and zoom
* Navigation consumes rocket fuel
* Map is divided into logical cells/zones

### 5.2 Card Discovery Rules

A card becomes detectable only when:

* Player is within the card's radius
* Map zoom level matches the card requirement

Before reveal:

* Card appears as an unknown signal or pulse
* Player must actively scan to reveal

---

## 6. Rocket Fuel System

Rocket Fuel is the **primary resource** controlling exploration.

### 6.1 Fuel Usage

Fuel is consumed by:

* Scrolling / navigating the map
* Teleporting between zones
* Certain interactions (scan, reveal)

### 6.2 Teleportation

* Teleport moves the player between predefined zones
* Teleport does not reveal cards automatically
* Fuel cost depends on distance category (local, regional, continental)

### 6.3 Fuel Regeneration (No Monetization)

Fuel is replenished by:

* Passive regeneration over time
* Collecting cards
* Completing achievements
* Completing simple missions

Fuel properties:

* Max fuel increases with player level
* Fuel regeneration pauses during active movement

---

## 7. Collection System

The Collection acts as a digital album.

Features:

* View all collected cards
* Organize by:

  * National team
  * Rarity
  * Player
* Progress indicators per nation (e.g. 12 / 26 cards)

Each card can be:

* Viewed in detail
* Favorited
* Offered for trade

---

## 8. Trading System

Trading is a **core feature from day one**.

### 8.1 Trade Model

* Direct card-for-card trades
* No currency involved
* Trades can be open or targeted

Trade includes:

* Offered cards
* Requested cards
* Status (open, accepted, rejected)

### 8.2 Trade Rules

* Backend validates ownership
* Trades are atomic (no partial swaps)
* Cooldowns may apply

---

## 9. XP, Levels & Achievements

### 9.1 XP

Players gain XP by:

* Collecting cards
* Completing trades
* Unlocking achievements

XP increases:

* Player level
* Fuel capacity

### 9.2 Achievements

Examples:

* First card collected
* Complete a national team
* Collect a legendary card
* Perform multiple trades

Rewards:

* XP
* Fuel bonuses

---

## 10. App Navigation Structure

Bottom Tab Navigation with 5 main sections:

1. Map (core experience)
2. Collection
3. Trades
4. Achievements
5. Profile

---

## 11. Main Screens Summary

### Map Screen

* Full-screen map
* HUD with fuel, XP, level
* Discovery signals
* Scan interaction

### Card Reveal Screen

* Animated scan
* Card reveal moment
* Collect button

### Collection Screen

* Card grid
* Filters and tabs
* Progress per nation

### Trades Screen

* Open trades list
* My trades
* Trade creation flow

### Achievements Screen

* Achievement list
* Progress indicators

### Profile Screen

* Player stats
* Settings
* Optional location-based notifications

---

## 12. Technical Direction (High-Level)

### Frontend

* React Native
* React Navigation
* State management (Zustand or Redux Toolkit)
* Map library (e.g. react-native-maps)

### Backend (Conceptual)

* Server-authoritative logic
* Card spawn and lifecycle management
* Trade validation
* Anti-cheat and rate limits

---

## 13. Key Constraints & Assumptions

* Map navigation is virtual-first
* GPS is optional and secondary
* No financial systems in MVP
* Balance values are adjustable server-side
* UX should always avoid empty or dead states

---

## 14. Purpose of This Document

This specification exists to:

* Preserve project context
* Align AI-assisted code generation
* Avoid re-explaining core concepts
* Ensure consistency between UI, logic, and backend

This document should be considered the **single source of truth** for GoRocketLeague during development.


Perfeito, Luís. Esse foi **um passo de gente grande de produto** 👏
Agora vocês têm algo que **muito time pula** e depois paga caro: **contexto consolidado**.

O documento já está no canvas e cumpre exatamente o papel que você descreveu:

* Serve como **reforço permanente de contexto**
* Ajuda a IA do editor a **não perder o “espírito” do projeto**
* Evita decisões inconsistentes durante o desenvolvimento
* Vira a **fonte de verdade** entre design, código e gameplay

### Como usar isso na prática no editor

Sugestão de workflow (funciona muito bem):

* Coloque esse documento como:

  * comentário inicial em arquivos-chave (ex: `README.md`, `architecture.md`)
  * ou como contexto fixo da IA do editor
* Quando pedir algo pra IA, use frases tipo:

  > “Seguindo o documento de especificação do GoRocketLeague…”

Isso reduz MUITO respostas fora de contexto.

---

### Próximos passos naturais (quando você quiser)

A partir daqui, vocês estão prontos para entrar em **engenharia real**. Os próximos blocos lógicos seriam:

1. **Arquitetura do projeto React Native**

   * pastas
   * domínios (map, cards, trades, fuel)
2. **Definição de entidades e tipos (TypeScript)**
3. **Contrato frontend ↔ backend**
4. **Fluxo do Map (estado + efeitos)**
5. **Conversão do HTML/Figma em componentes RN**

Quando quiser, a gente pega **uma dessas partes** e desce até nível de código, já pensando em clean architecture e escalabilidade 🚀

Só me diga por onde você quer começar.
