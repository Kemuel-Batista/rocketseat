# package context no Go

> **Entendendo profundamente contexto, cancelamento, timeouts e propagação de informações.**

Este documento explica por que o `package context` foi criado, como ele funciona, suas estruturas internas, boas práticas e armadilhas comuns.

---

## 📌 Introdução

No desenvolvimento concorrente com Go — especialmente em aplicações que lidam com múltiplas gorrotinas, microserviços ou tarefas encadeadas — precisamos de uma maneira unificada de:

* Propagar metadados entre diversas operações.
* Cancelar tarefas subordinadas.
* Definir timeouts e deadlines.
* Entender por que uma operação terminou.

Antes do `context` (pré-v1.7), esse controle era feito com canais ad-hoc (como `done` ou `stopper`), que eram limitados. O `package context` resolveu isso trazendo padronização, controle explícito/implícito e propagação estruturada.

---

## 📌 Por que o context existe?

Existem dois grandes motivos para a existência deste pacote:

1.  **Cancelamento e Timeout unificados.**
2.  **Propagação de contexto** entre gorrotinas e subtarefas.

Isso evita lógica espalhada, facilita a identificação de cancelamentos e torna o código compatível com bibliotecas externas.

---

## 📌 Contexto como árvore

O context é **imutável** e forma uma cadeia hierárquica (similar a uma árvore). Cada novo contexto aponta para um contexto pai.

```text
Background
   |
   +-- Context A (com timeout)
           |
           +-- Context B (com valor)
                   |
                   +-- Context C (cancelado)
```
Regra de Ouro: Cancelar um nó cancela automaticamente todos os nós abaixo dele (filhos).

## 1. Cancelamento
O context lida com o cancelamento de duas formas:

✔ Cancelamento explícito
Chamado manualmente através da função cancel() retornada.

```go
ctx, cancel := context.WithCancel(parent)
defer cancel() // Garante que recursos sejam liberados
```
Ao chamar cancel(), todas as gorrotinas subordinadas são finalizadas.

✔ Cancelamento implícito
Ocorre automaticamente quando:

Um timeout expira (context.WithTimeout).

Uma deadline é atingida (context.WithDeadline).

Exemplo: No caso de uso "GoBid", isso pode ser usado para fechar uma "auction room" quando o tempo do leilão acaba.

## 2. context.Done() e context.Err()
✔ Done()
Retorna um canal (<-chan struct{}) que é fechado quando o contexto é cancelado. É tipicamente utilizado dentro de um select:

```go
select {
case <-ctx.Done():
  // O contexto foi cancelado ou expirou
  return ctx.Err()
case result := <-work:
  // O trabalho foi concluído com sucesso
  return result
}
```

✔ Err()
Retorna o motivo do cancelamento após o canal Done ser fechado:

context.Canceled: Cancelamento manual.

context.DeadlineExceeded: Timeout ou deadline atingida.

## 3. Timeouts e Deadlines
Timeouts permitem abortar operações lentas para manter o sistema responsivo.

Cenário de exemplo:

Microserviço A chama B.

B demora 450ms (considerado muito lento).

O Context cancela a chamada a B.

O sistema tenta uma alternativa (B2) ou retorna erro.

## 4. Quando usar Background vs r.Context()
Uma dúvida comum em servidores HTTP (como no projeto GoBid):

r.Context(): O contexto morre assim que a requisição HTTP termina.

context.Background(): Contexto raiz, vazio e que nunca expira.

Cenário do Leilão (GoBid): Se a gorrotina da "auction room" deve durar até a data final do leilão (independente de quem fez a request), deve-se iniciar com context.Background(). Se usássemos r.Context(), a sala fecharia assim que o usuário desconectasse.

## 5. Propagação de Valores (WithValue)
O context.WithValue permite passar dados opcionais pela árvore de chamadas (ex: UserID, TraceID, Auth Tokens).

⚠ Performance (O(n))
O contexto não é um HashMap eficiente. Para buscar um valor, o Go percorre a árvore de baixo para cima:

```go
// Pseudocódigo da busca
for ctx != nil {
  if ctx.key == key { return value }
  ctx = ctx.parent
}
```

Com muitos nós ou muitos valores, a performance degrada.

⚠ Type Safety e Colisões
A chave do contexto é do tipo any. Para evitar que uma biblioteca sobrescreva a chave de outra (colisão), sempre use tipos struct customizados e não exportados como chave.

Forma incorreta:

```go
ctx = context.WithValue(ctx, "userID", 123) // Chave string genérica
```

Forma correta (Idiomática):

```go
type traceIDKeyType struct{}
var traceIDKey = traceIDKeyType{}

// Setar
ctx = context.WithValue(parent, traceIDKey, "uuid-123")
```

```go
type ctxKey string

func main() {
  doSomething(context.Background(), "rocket", "the best dev school")
}

func doSomething(ctx context.Context, name, desc string) {
  ctx = context.WithValue(ctx, ctxKey("schoolName"), name)
  ctx = context.WithValue(ctx, ctxKey("description"), desc)
  doSomethingElse(ctx)
}

func doSomethingElse(ctx context.Context) {
  fmt.Printf(
    "School %s is: %s\n", 
    getDesc(ctx, ctxKey("schoolName")),
    getDesc(ctx, ctxKey("description")),
  )
}

func getDesc(ctx context.Context, key ctxKey) string {
  return ctx.Value(key).(string)
}

```

## 6. Boas Práticas
O que NÃO colocar no Contexto
❌ Dados mutáveis.

❌ Estruturas grandes.

❌ Parâmetros opcionais de função.

❌ Lógica de negócio complexa.

O que colocar no Contexto
✔ Cancelamento coordenado.

✔ Deadlines entre microserviços.

✔ Traceamento distribuído (Tracing).

✔ Autenticação/Autorização (request-scoped).

✔ Metadados de telemetria.

## 7. Exemplo Prático Completo
Abaixo, um exemplo unindo timeout, cancelamento e verificação de erro.

```go
func HandleRequest(w http.ResponseWriter, r *http.Request) {
  // Cria um contexto que expira em 500ms
  ctx, cancel := context.WithTimeout(r.Context(), 500*time.Millisecond)
  defer cancel() // Boa prática: sempre chamar cancel no defer

  // Passa o ctx para a função de trabalho
  result, err := Work(ctx)
  
  if err != nil {
    // Verifica se o erro foi causado pelo timeout
    if ctx.Err() == context.DeadlineExceeded {
      http.Error(w, "Processamento demorou muito", http.StatusGatewayTimeout)
      return
    }
    http.Error(w, err.Error(), http.StatusInternalServerError)
    return
  }

  fmt.Fprintln(w, result)
}
```

Conclusão
O context torna o Go mais previsível, seguro e idiomático. Dominar seus conceitos de árvore, cancelamento e a forma correta de propagar valores é essencial para construir aplicações robustas e performáticas.