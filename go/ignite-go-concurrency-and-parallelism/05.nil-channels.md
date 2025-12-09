# Nil Channels e Padrões de Concorrência em Go

Este documento serve como referência sobre o comportamento de *Nil Channels*, gerenciamento de estado em canais, prevenção de *leaks* de goroutines e implementação de semáforos, conforme abordado na aula.

## Nil Channels

Um caso raro, mas possível, ocorre quando criamos um *channel* sem inicializar sua memória com o `built-in` `make`.

```go
var ch chan int // Não usei make
// ch == nil
```

Esses canais são definidos como `nil`. Embora `null` ou `undefined` sejam geralmente vistos como problemas, *new channels* podem ser úteis em casos específicos, mas com ressalvas.

### Comportamento Básico

  * **Leitura ou Escrita:** Se você tentar escrever ou ler de um *nil channel*, a operação vai **bloquear** (block) permanentemente.
  * **Deadlock:** Se for a única goroutine rodando, o programa entrará em *deadlock*.

### Nil Channels no `select`

A utilidade surge dentro de uma estrutura `select`. Se um dos `cases` tentar ler ou escrever em um canal que é `nil`, **esse case é ignorado**.

Isso permite desabilitar e habilitar *cases* dinamicamente em tempo de execução (*runtime*):

1.  Setar o channel como `nil` remove efetivamente aquele *case* do `select`.
2.  Restaurar o valor original do channel reabilita o *case*.

### ⚠️ Aviso sobre Complexidade

Embora seja possível usar essa técnica para suspender leituras temporariamente, **evite usar isso ao máximo**. Tentar ser "muito esperto" adiciona complexidade desnecessária e foge da filosofia idiomática de Go (clareza e simplicid ade).

> **Recomendação:** Se você precisa sinalizar que não haverá mais input, apenas **feche o channel** (`close`). É mais simples e comunica melhor a intenção do que manipular *nil channels*.

-----

## Tabela de Referência de Comportamento

Use esta referência para entender o resultado das operações em channels em diferentes estados.

| Estado do Channel | Operação | Resultado |
| :--- | :--- | :--- |
| **Aberto e Cheio** | Escrita (Write) | **Block** (Bloqueia a execução) |
| **Fechado** | Leitura (Read) | Retorna **Zero Value** e `false` |
| **Fechado** | Fechar (Close) | **Panic** |
| **Fechado (com Buffer)** | Leitura (Read) | Lê os valores restantes até esvaziar, depois retorna Zero Value/false |

**Nota sobre Buffered Channels Fechados:**
Fechar um channel com buffer **não deleta** os valores que estão dentro dele. O consumidor continuará recebendo os dados reais até que sejam drenados (semelhante a ler um arquivo até o EOF - *End of File*).

-----

## Dono do Channel (Ownership)

Para evitar *panics* (principalmente ao fechar canais já fechados), é fundamental definir o **Dono do Channel**. O fluxo deve ser unidirecional.

### Responsabilidades do Dono (Owner)

O dono (quem escreve) deve:

1.  **Criar o Channel** (Inicializar).
2.  **Escrever** no Channel (ou transferir a *ownership* momentaneamente).
3.  **Fechar (Close)** o Channel quando terminar o envio.
4.  **Encapsular** e expor apenas um canal de leitura (`<-chan`) para os consumidores.

**Vantagens:**

  * Elimina o risco de *deadlock* por *nil channel* (pois o dono inicializa).
  * Elimina o risco de *panic* por fechar duas vezes.
  * Permite que o **Static Check** (compilador) verifique leituras e escritas impróprias.

### Responsabilidades do Consumidor

O consumidor deve apenas:

1.  Saber quando o channel fechou.
2.  Lidar com *blocks* (operações bloqueantes).

-----

## Buffered vs Unbuffered Channels

Não existe bala de prata, mas há cenários específicos para o uso de *buffers*.

### Prevenindo Leaks de Goroutine

Se você lançar várias goroutines (ex: 30) escrevendo em um channel *unbuffered*, e a *main* ler apenas o primeiro resultado e sair, as outras 29 goroutines ficarão bloqueadas para sempre tentando escrever. Isso é um **Leak**.

```go
func main() {
  const numberOfRoutines = 30
  ch := make(chan int)

  for i := 0; i <= numberOfRoutines; i++ {
    go func(ch chan<- int, i int) {
      ch <- i
      fmt.Println("I am: ", i)
    }(ch, i)
  }

  time.Sleep(1 * time.Second)
  fmt.Println("Got value: ", <-ch)
  time.Sleep(1 * time.Second)

  for {
    fmt.Println("Go routines running: ", runtime.NumGoroutine() - 1)
    time.Sleep(250 * time.Millisecond)
  }
}
```

**Solução:** Usar um buffer com o tamanho exato do número de requisições/tarefas.

  * Isso garante que todas as goroutines consigam enviar seus valores e terminar, mesmo que ninguém leia todos os valores.

```go
func main() {
  const numberOfRoutines = 30
  ch := make(chan int, numberOfRoutines   )

  for i := 0; i <= numberOfRoutines; i++ {
    go func(ch chan<- int, i int) {
      ch <- i
      fmt.Println("I am: ", i)
    }(ch, i)
  }

  time.Sleep(1 * time.Second)
  fmt.Println("Got value: ", <-ch)
  time.Sleep(1 * time.Second)

  for {
    fmt.Println("Go routines running: ", runtime.NumGoroutine() - 1)
    time.Sleep(250 * time.Millisecond)
  }
}
```

### Performance

*Channels unbuffered* causam *delay* de sincronização (um escreve, espera o outro ler). Adicionar *buffer* permite "bursts" de escrita antes de bloquear.

> **Cuidado:** "Otimização prematura é a raiz de todo mal" (Tony Hoare/Donald Knuth).
> Adicionar buffers para performance pode esconder *race conditions*. Faça o código funcionar corretamente primeiro (sincronização), e adicione buffers para performance apenas se o *profiling* indicar necessidade.

### Semáforos

Semáforos gerenciam o acesso a recursos limitados. Quando o limite é atingido, novas tarefas esperam até que uma termine. Isso limita a quantidade de *workers* simultâneos, não o total.

**Implementação com Buffered Channels:**

1.  O tamanho do buffer define o número máximo de concorrência.
2.  **Acquire:** Tentar escrever no channel. Se estiver cheio, bloqueia (espera).
3.  **Release:** Ler do channel. Libera espaço para o próximo.

#### Exemplo de Código (Semáforo)

```go
type Semaphore struct {
    C chan struct{}
}

func NewSemaphore(maxConcurrent int) *Semaphore {
    return &Semaphore{
        C: make(chan struct{}, maxConcurrent),
    }
}

// Acquire: Sinaliza intenção de trabalhar. Bloqueia se atingiu o limite.
func (s *Semaphore) Acquire() {
    s.C <- struct{}{}
}

// Release: Libera o recurso.
func (s *Semaphore) Release() {
  select {
  case <-s.C:
    // Liberou espaço
    fmt.Println("Nothing to do. Continue.")
  default:
    // Nada para liberar
    fmt.Println("Nada para liberar")
  }
}

func worker(id int, sema *Semaphore, work func()) {
  sema.Acquire()
  go func() {
    defer sema.Release()
    work()
  }
  // defer sema.Release()

  // // Realiza o trabalho...
  // fmt.Printf("Goroutine %d iniciada\n", id)
  // time.Sleep(2 * time.Second)
  // fmt.Printf("Goroutine %d finalizada\n", id)
}

func main() {
  sema := NewSemaphore(3)

  for i := 1; i <= 30; i++ {
    id := 1
    worker(id, sema, func() {
      fmt.Println("Go routine iniciada", id)
      time.Sleep(2 * time.Second)
      fmt.Println("Go routine finalizada", id)
    })
  }

  time.Sleep(60 * time.Second)
}
```

-----

*Nota: Partes teóricas sobre concorrência e paralelismo exigem estudo constante. Nas próximas etapas, o foco mudará para exemplos práticos de Senders e Receivers idiomáticos.*