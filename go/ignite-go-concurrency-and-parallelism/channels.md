# Avançando com Channels em Go: Padrões, Sincronização e Comunicação

Este guia aborda conceitos avançados sobre Channels, liberando novos padrões de concorrência sem vazar gorrotinas (*leaks*), além de explorar comportamentos de bloqueio, direcionalidade e sinalização via `close`.

-----

## Revisão: Comportamentos de Bloqueio (Blocking)

Operações em channels podem ser **blocking** (travam a execução) ou não, dependendo do estado do channel e da presença de buffers.

### Quando um Channel está pronto?

  * **Para Escrita (Write):**
      * Quando há ao menos um leitor pronto para ler.
      * Ou, se o channel for "buffered" (com buffer), quando há espaço disponível.
      * *Se estiver cheio ou sem leitor:* Torna-se **block**.
  * **Para Leitura (Read):**
      * Quando há ao menos um escritor pronto para escrever.
      * Ou, se houver dados armazenados no buffer.

-----

## Direcionalidade de Channels

Channels são **unidirecionais** (semelhantes a um *Unix pipe*). Diferente de uma linha telefônica (bidirecional), você não pode inverter as posições de quem escreve e quem lê no mesmo fluxo.

### Constraints (Limitadores)

O Go permite limitar o que uma função pode fazer com um channel através da sintaxe de tipos. Isso é considerado uma **boa prática** para segurança e clareza do código.

  * **Apenas Escrita (Write-only):** `chan<- Tipo`
      * Seta à direita.
  * **Apenas Leitura (Read-only):** `<-chan Tipo`
      * Seta à esquerda.

> **Nota:** Passar um channel sem especificar a direção (`chan Tipo`) permite leitura e escrita, o que muitas vezes é considerado má prática, pois perde-se o controle sobre quem é o dono ou quem deve fechar o canal.

-----

## Sintaxe de Leitura e o Idioma "Comma-ok"

Além da leitura padrão (`valor := <-canal`), channels em Go assemelham-se a mapas (*maps*). Quando lemos de um channel, podemos receber dois valores para verificar se o canal está aberto ou fechado.

### Sintaxe

```go
valor, ok := <-channel
```

  * **valor:** O dado recebido do channel.
  * **ok (Booleano):** Indica o estado do channel.

### Comportamentos de Retorno

| Estado do Channel | Valor Retornado | `ok` Return |
| :--- | :--- | :--- |
| **Aberto (com dados)** | Valor real enviado | `true` |
| **Fechado (Closed)** | Zero Value do tipo (ex: 0 p/ int) | `false` |

Isso é essencial para distinguir se um `0` recebido é um dado real enviado ou apenas o resultado de um channel fechado.

-----

## Deadlocks

Um **deadlock** ocorre quando o programa atinge um estado onde nenhuma goroutine consegue prosseguir. Todas estão dormindo, esperando por uma ação que nunca acontecerá.

  * **Exemplo Clássico:** Tentar escrever em um channel *unbuffered* sem ter nenhuma goroutine pronta para ler (ou vice-versa).
  * **Causa:** Geralmente resulta de uma tentativa falha de sincronização para evitar *Race Conditions* (condições de corrida). O programa trava tanto o acesso aos recursos que ninguém consegue acessá-los.
  * **Detector:** O Runtime do Go possui um detector de deadlock robusto que encerra o programa e aponta o erro (`fatal error: all goroutines are asleep - deadlock!`).

-----

## A Função `close` e Sinalização

A função `built-in` `close()` é usada para indicar que **nenhum valor mais será enviado**.

### Características

  * **Leitura em Channel Fechado:** É possível ler quantas vezes quiser de um channel fechado. Ele retorna imediatamente (não bloqueia), entregando o *zero value* e `ok = false`.
  * **Sinalização Universal:** Fechar um channel age como um sinal de transmissão (*broadcast*) para todos os leitores avisando que o trabalho acabou.
  * **Exemplo de Uso:**
      * Ao ler um arquivo linha a linha, ao invés de enviar um valor sentinela (como EOF), fecha-se o channel.
      * O *worker* que consome os dados verifica o `ok` e sabe a hora de parar.

Isso torna o código mais idiomático e expressivo, evitando complexidade desnecessária.

-----

## Relação entre `close` e `context.Done`

O comportamento de channels fechados explica como o `context.Done()` funciona para cancelamento e *timeout*.

1.  O `ctx.Done()` retorna um channel.
2.  Quando o contexto expira ou é cancelado, esse channel é **fechado**.
3.  Como canais fechados retornam imediatamente (são *non-blocking* para leitura), qualquer `select` que esteja escutando `case <-ctx.Done():` será acionado instantaneamente.
4.  Isso permite finalizar múltiplas goroutines simultaneamente sem precisar criar lógicas complexas de timeout para cada uma.