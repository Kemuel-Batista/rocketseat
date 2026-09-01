# Go Rocket League (Mobile)

Aplicativo mobile do projeto Go Rocket League, construído com Expo + React Native.

Este app **usa módulos nativos** (ex.: mapas, anúncios, autenticação Apple), então o fluxo não é apenas Expo Go: em parte do desenvolvimento você vai precisar de **prebuild + run nativo**.

## Stack principal

- Expo SDK 54 + React Native
- Expo Router (rotas por arquivos)
- TypeScript
- Zustand (estado global)
- i18n (`i18n-js`)
- SQLite local
- Integrações nativas: `react-native-maps`, `react-native-google-mobile-ads`, `expo-apple-authentication`

## Pré-requisitos

- Node.js LTS
- npm
- Xcode (para iOS, macOS)
- Android Studio + SDK (para Android)
- Ambiente React Native/Expo configurado

## Instalação

No diretório `mobile/gorocketleague`:

```bash
npm install
```

## Configuração de ambiente

As chaves do projeto são carregadas via `.env` e consumidas por `app.config.ts`.

Exemplo mínimo:

```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/
EXPO_PUBLIC_ADMIN_API_KEY=sua_chave
EXPO_PUBLIC_COLYSEUS_WS_URL=http://localhost:3000

MAPS_API_KEY=sua_chave_google_maps
APPLE_TEAM_ID=seu_team_id
IOS_BUNDLE_IDENTIFIER=com.gorocketleague
ANDROID_PACKAGE=com.gorocketleague
APP_SCHEME=com.gorocketleague

ADMOB_APP_ID_ANDROID=...
ADMOB_APP_ID_IOS=...
ADMOB_REWARDED_AD_UNIT_ID_IOS=...
ADMOB_REWARDED_AD_UNIT_ID_ANDROID=...

GOOGLE_IOS_CLIENT_ID=...
GOOGLE_ANDROID_CLIENT_ID=...
GOOGLE_EXPO_CLIENT_ID=...
```

## Como rodar no dia a dia

### 1) Subir o bundler

```bash
npx expo start
```

### 2) Abrir no dispositivo/emulador

- `a` para Android (com emulador aberto)
- `i` para iOS (com Simulator, no macOS)

Ou rode direto:

```bash
npm run android
npm run ios
```

## Quando usar prebuild

Use `prebuild` quando houver mudanças de configuração nativa, como:

- alterações no `app.config.ts` que impactam nativo
- inclusão/remoção de plugins Expo
- inclusão/remoção de libs nativas
- mudanças em permissões/identificadores de app

Comando:

```bash
npx expo prebuild
```

Depois execute:

```bash
npm run android
# ou
npm run ios
```

## Importante: Expo Go vs Development Build

Como este projeto depende de recursos nativos, **nem tudo funciona no Expo Go**.
Para testar funcionalidades como mapas/ads e demais integrações nativas, use **development build** (`expo run:android` / `expo run:ios`).

## Scripts úteis

- `npm run start` - inicia o Metro/Expo
- `npm run android` - build/run Android nativo
- `npm run ios` - build/run iOS nativo
- `npm run web` - roda versão web
- `npm run lint` - executa lint
- `npm run seed:copy` - copia seed local de dados (quando disponível)

## Estrutura resumida

- `app/` - telas e rotas (Expo Router)
- `components/` - componentes reutilizáveis
- `lib/` - integrações, APIs, utilitários e regras de domínio
- `store/` - estado global
- `i18n/` - traduções
- `assets/` - imagens, fontes e arquivos estáticos

## Troubleshooting rápido

- Mudou plugin/config nativa e quebrou build? Rode `npx expo prebuild` novamente.
- Mudou `.env` e não refletiu? Reinicie com cache limpo:

```bash
npx expo start -c
```
