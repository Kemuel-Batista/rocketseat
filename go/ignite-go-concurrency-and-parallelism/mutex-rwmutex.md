# Sincronização em Go: Mutex e RWMutex

Este documento revisa a forma tradicional de sincronização em Go utilizando o pacote `sync`, comparando-a com channels, abordando boas práticas de encapsulamento, o uso de `defer` e a otimização de leituras com `RWMutex`.

-----

## Emulando Mutex com Channels (Semáforos)

Embora channels sejam primitivos de concorrência poderosos, é possível emular o comportamento de um Mutex utilizando um channel com buffer de 1. Isso garante que apenas uma goroutine tenha acesso a uma variável por vez.

```go
var (
  sema    := make(chan struct{}, 1) // Buffer de 1
  balance =  0
)

func Deposit(amount int) {
  sema <- struct{}{} // Acquire (Lock): Bloqueia se já tiver algo no buffer
  balance += amount
  <-sema             // Release (Unlock): Libera espaço no buffer
}
```

*Por debaixo do capô, channels utilizam mutexes. Por isso, usar `sync.Mutex` diretamente costuma ser mais performático para exclusão mútua simples.*

-----

## sync.Mutex

O padrão de exclusão mútua é tão comum que Go disponibiliza o `sync.Mutex`. Ele funciona como reservar um livro numa biblioteca: enquanto você está com ele (Lock), ninguém mais pode pegá-lo até que você devolva (Unlock).

```go
import "sync"

var mu sync.Mutex

func exemplo() {
  mu.Lock()   // Adquire o acesso (reserva)
  // Modifica a memória...
  mu.Unlock() // Devolve o acesso
}
```

Isso previne *Race Conditions* (condições de corrida) garantindo acesso único à variável compartilhada.

-----

## Área Crítica e Encapsulamento

"Área Crítica" é o termo usado para descrever o trecho de código entre um `Lock` e um `Unlock`.

### O Perigo da Promoção de Structs (Embedding)

Um erro comum é embutir o `sync.Mutex` diretamente na struct de forma exportada.

**Forma Perigosa (Evite):**

```go
type Account struct {
  sync.Mutex // Promove os métodos Lock/Unlock para Account
  balance int
}
// Risco: Permite que pacotes externos chamem myAccount.Lock()
// Resultando em deadlocks acidentais se chamado duas vezes ou fora de ordem.
func (a *Account) Deposit(amount int) {
  a.Lock()
  defer a.Unlock()
  a.balance += amount
}
```

**Boa Prática (Encapsulamento):**
Utilize o mutex como um campo privado (ex: `mu`). Crie métodos que lidam com a lógica de travamento internamente.

```go
type Account struct {
  mu      sync.Mutex // Privado
  balance int
}

func (a *Account) Deposit(amount int) {
  a.mu.Lock()
  defer a.mu.Unlock()
  a.balance += amount
}
```

Dessa forma, o controle da concorrência fica restrito ao pacote e aos métodos da struct.

-----

## O Uso do Defer

O `defer` é um grande aliado para garantir que o `Unlock` seja executado, mesmo se a função entrar em pânico (`panic`). Isso melhora a legibilidade e a corretude do código, evitando múltiplos `returns` manuais.

```go
func (a *Account) Metodo() {
  a.mu.Lock()
  defer a.mu.Unlock() // Garante a liberação
  // ... lógica complexa
}
```

### Quando NÃO usar Defer (Middlewares)

O `defer` executa apenas no final da função. Em middlewares HTTP, usar `defer mu.Unlock()` antes de chamar o `next.ServeHTTP` é um erro grave.

  * **Problema:** O recurso ficará travado durante **toda** a duração da requisição (que pode levar milissegundos ou horas).
  * **Solução:** Faça o `Lock`, realize a operação rápida necessária e dê o `Unlock` **imediatamente**, antes de passar para o próximo handler.

> **Regra:** Se não usar `defer`, documente claramente o motivo.

```go
type Account struct {
  mu      sync.Mutex // Privado
  balance int
}

func (a *Account) Deposit(amount int) {
  a.mu.Lock()
  defer a.mu.Unlock()
  a.balance += amount
}

func (a *Account) AquireValue() int {
  a.mu.Lock()
  defer a.mu.Unlock()
  // Área crítica
  return a.balance
}
```

-----

## RWMutex (Read/Write Mutex)

Imagine um cenário onde você tem uma rotina (ex: Cron) que lê o saldo (`balance`) milhares de vezes por segundo, mas depósitos (escrita) ocorrem raramente.

Usar um Mutex comum faria com que todas as leituras fossem sequenciais (uma fila), travando o desempenho. Leituras simultâneas são *Concurrent Safe* desde que nada esteja sendo modificado.

O `sync.RWMutex` resolve isso permitindo:

1.  **Múltiplos Leitores (RLock):** Várias goroutines podem ler ao mesmo tempo, desde que não haja escrita ocorrendo.
2.  **Um Escritor (Lock):** Quando alguém precisa escrever, ele bloqueia **todos** (leitores e escritores) até terminar.

### Implementação

```go
type Account struct {
  mu      sync.RWMutex // Mudança de tipo
  balance int
}

// Leitura (Muitos ao mesmo tempo)
func (a *Account) Balance() int {
  a.mu.RLock()         // Read Lock
  defer a.mu.RUnlock()
  return a.balance
}

// Escrita (Acesso Exclusivo)
func (a *Account) Deposit(amount int) {
  a.mu.Lock()          // Lock tradicional (exclusivo)
  defer a.mu.Unlock()
  a.balance += amount
}
```

O RLock() ele só é non-blocking quando a gente não tem nenhum writer, então quando a gente não tem nenhum writer num dado momento, ele é non-blocking, só é uma boa ideia usar um RWMutex em casos onde a maior parte das gorrotinas que temos executa leituras em um recurso e quando ela tem que esperar por várias outras leituras, como foi o exemplo que a gente acabou de dar.

### Trade-offs

  * **Vantagem:** Alta performance em cenários com muitas leituras e poucas escritas.
  * **Desvantagem:** É mais lento e complexo que o Mutex comum devido à lógica interna de controle.

> **Lembrete:** Não existe bala de prata. Use `RWMutex` apenas quando o perfil da aplicação (muito mais leituras que escritas) justificar o custo extra.