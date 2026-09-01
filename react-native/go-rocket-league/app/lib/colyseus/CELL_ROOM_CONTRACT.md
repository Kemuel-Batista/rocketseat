# Contrato CellRoom (app ↔ backend)

Espelho do que o backend espera em `CellRoom.js` e nos states, para o app enviar e interpretar corretamente.

## Tamanho da sala (resRoomCell)

Cada sala = **uma célula H3 na resolução da sala** (ex.: 8). O “tamanho” é geográfico:

- **Área média por hexágono** (ex. res 8): ~**0,74 km²** (cerca de 860 m de “raio”).
- Para **mudar de sala** o centro do mapa precisa entrar noutra célula da sala, ou seja, deslocar **na ordem de 1 km ou mais** (depende da direção e da borda do hexágono).

Por isso é normal: mesmo movendo “uma grande distância” no mapa, se ainda estiver dentro do mesmo hexágono da sala, o dashboard continua a mostrar **a mesma sala** (ex.: `cell:88a88cdb3dfffff`). A sala só muda quando o servidor envia `changeRoom` (porque o novo `h3UserCell` do centro do mapa tem um “pai” na resolução da sala diferente). Se em algum momento **desconectar** (rede, etc.) e voltar a conectar, o join usa de novo o centro atual do mapa; se esse centro ainda cair na mesma célula da sala, a sala exibida será a mesma.

## Join (joinOrCreate)

- **Tipo da sala:** `"cell"` (matchmaking por `filterBy(["h3RoomCell"])`).
- **Options enviadas pelo app:**

| Campo       | Tipo   | Obrigatório | Descrição                          |
|-------------|--------|-------------|------------------------------------|
| userId      | string | sim         | ID do usuário (backend persiste no DB) |
| username    | string | sim         | Nome para exibição                 |
| avatarId    | string | sim         | ID do avatar (ex.: "1")            |
| level       | number | sim         | Nível do jogador                   |
| xp          | number | sim         | XP atual                           |
| fuel        | number | sim         | Combustível                        |
| lat         | number | sim         | Centro do mapa (nunca GPS)         |
| lng         | number | sim         | Centro do mapa (nunca GPS)         |
| h3UserCell  | string | sim         | Hex fino do jogador: `latLngToCell(lat,lng, H3_RES_USER_CELL)` (ex. res 9) |
| h3RoomCell  | string | sim         | Hex da **sala**: `cellToParent(h3UserCell, H3_RES_ROOM_CELL)` (ex. res 8) — **não** reutilizar o mesmo índice/res que `h3UserCell` |

O app deve enviar os dois campos coerentes: `h3RoomCell` é **sempre** o parent de `h3UserCell` na resolução da sala (coins, flag e `filterBy` assumem isso). Ver também `COINS_ROOM.md` (regra no topo).

## Mensagens app → servidor

### `updatePosition`

Enviada quando o usuário **para de mover o mapa** (centro do mapa mudou).

| Campo       | Tipo   | Descrição                    |
|-------------|--------|------------------------------|
| lat         | number | Nova lat (centro do mapa)    |
| lng         | number | Nova lng (centro do mapa)    |
| h3UserCell  | string | Célula do usuário dessas coords |
| fuel        | number | Fuel atual (para sync)       |

Se a célula da sala (parent de `h3UserCell`) for diferente da sala atual, o servidor envia **`changeRoom`**.

### `updateStats`

Enviada quando XP, level ou fuel mudam (ex.: após scan).

| Campo | Tipo   |
|-------|--------|
| xp    | number |
| level | number |
| fuel  | number |

## Mensagens servidor → app

### `changeRoom`

- **Payload:** `{ newRoom: "cell:<h3RoomCell>" }`
- **Ação no app:** sair da sala atual, fazer `joinOrCreate("cell", { ...opts, h3RoomCell })` com o `h3RoomCell` extraído de `newRoom`.

## State da sala (sync)

- **`state.users`:** `MapSchema<sessionId, UserState>`.
- **UserState (espelho do backend):**

| Campo       | Tipo   |
|-------------|--------|
| id          | string |
| username    | string |
| avatarId    | string |
| level       | number |
| xp          | number |
| fuel        | number |
| lat         | number |
| lng         | number |
| h3UserCell  | string |

O app ignora o próprio usuário (por `sessionId`) e usa os outros para marcadores no mapa.
