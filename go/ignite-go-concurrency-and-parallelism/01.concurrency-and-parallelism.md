# Go: Concorrência e Paralelismo

Este documento resume os conceitos fundamentais de concorrência e paralelismo na linguagem Go, abordando desde a teoria de sistemas operacionais até os primitivos de sincronização da linguagem.

## 1. Concorrência vs. Paralelismo

Embora frequentemente confundidos, estes conceitos são distintos na ciência da computação e na filosofia do Go:

* **Concorrência (Estrutura):** É a composição de processos independentes. Trata-se de **lidar** com muitas coisas ao mesmo tempo. Caracteriza-se por execução não determinística e ordem parcial (*partial ordering*). Em um sistema de núcleo único (*single-core*), a concorrência é alcançada através de *context switching* (troca de contexto) rápida pelo Scheduler, criando a ilusão de simultaneidade.
* **Paralelismo (Execução):** É a execução simultânea de computações. Trata-se de **fazer** muitas coisas ao mesmo tempo. O paralelismo real depende de hardware com múltiplos núcleos (*multi-core*).



[Image of Concurrency vs Parallelism diagram]


> **Nota:** Concorrência habilita o paralelismo, mas concorrência sem paralelismo ainda é possível (e comum) via alternância de tarefas.

---

## 2. Evolução: De Sub-rotinas a Corrotinas

Para entender as Goroutines, é necessário compreender a evolução das rotinas de software:

* **Sub-rotinas:** Seguem um modelo hierárquico e sequencial. A função principal (main) chama uma função subordinada, aguarda sua conclusão (bloqueia) e retoma o controle apenas no retorno.
* **Corrotinas (Coroutines):** São "co-iguais" e cooperativas. Elas podem pausar sua execução (`yield`) para permitir que outras corrotinas rodem e retomar o estado posteriormente. Go utiliza este conceito através das Goroutines, onde o *Runtime* da linguagem gerencia o agendamento.

---

## 3. O Problema: Race Conditions (Condições de Corrida)

A execução concorrente e não determinística introduz riscos críticos quando há estado compartilhado. O problema mais comum é a **Race Condition**.

### O Ciclo Read-Modify-Write
Para alterar qualquer valor na memória (ex: uma operação `A++` ou um depósito bancário), a CPU executa obrigatoriamente três passos:

1.  **Read:** Ler o valor atual da memória para um registrador.
2.  **Modify:** Alterar o valor no registrador.
3.  **Write:** Escrever o novo valor de volta na memória.



### O Cenário de Data Race
Se duas goroutines executarem esse ciclo de forma intercalada (*interleaved*), uma sobrescreverá a alteração da outra, resultando em dados inconsistentes.

*Exemplo:* Duas goroutines tentam depositar R$ 50 e R$ 100 em uma conta com saldo R$ 100. Se ambas lerem "100" antes de qualquer uma escrever, o último a escrever vencerá ("Last write wins"), e um dos depósitos será perdido.

### Soluções para Race Conditions
Para garantir a integridade dos dados, deve-se adotar uma das seguintes estratégias:

* **Não compartilhar memória:** Evitar que múltiplas goroutines acessem o mesmo endereço de memória.
* **Imutabilidade:** Dados que não mudam podem ser lidos concorrentemente sem risco.
* **Restrição de Acesso (Sincronização):** Restringir o acesso a um único modificador por vez (ex: uso de Mutexes).
* **Atomicidade:** Garantir que o ciclo *Read-Modify-Write* seja indivisível (atômico). A operação ocorre totalmente ou não ocorre, sem possibilidade de interrupção no meio do ciclo.

---

## 4. O Modelo CSP (Communicating Sequential Processes)

Go baseia seu modelo de concorrência no paper de C.A.R. Hoare (1978). A linguagem encoraja o uso de comunicação entre processos sequenciais em vez de bloqueios de memória.

> *"Don't communicate by sharing memory, share memory by communicating."*
> (Não comunique compartilhando memória, compartilhe memória comunicando).

### Primitivos de Concorrência em Go

#### Goroutines
Funções iniciadas com a keyword `go`. São leves (*lightweight*), gerenciadas pelo Runtime do Go (não são threads de SO 1:1) e exigem definição clara de término para evitar *memory leaks*.

#### Channels (Canais)
Atuam como "tubos" (*pipes*) tipados que conectam goroutines.
* Permitem **enviar** e **receber** valores.
* Servem tanto para comunicação quanto para sincronização.
* Ao enviar um dado, transfere-se a **ownership** (propriedade) daquele dado, prevenindo Data Races de forma arquitetural.

#### Mutexes (Mutual Exclusion)
Primitiva clássica de sincronização (`sync.Mutex`). Utilizada para proteger seções críticas, garantindo acesso exclusivo a recursos compartilhados.

---

## 5. Decisão: Channels vs. Mutexes

Não existe "bala de prata". A escolha depende do contexto do problema:

| Ferramenta | Quando Utilizar |
| :--- | :--- |
| **Channels** | Preferível quando é necessário passar dados (transferir ownership), coordenar o fluxo de execução de múltiplas tarefas ou quando o design exige expressividade. |
| **Mutexes** | Preferível para proteção de estado simples (ex: contadores, caches, structs internos) onde a lógica é simples e o uso de channels adicionaria complexidade desnecessária. |

**Regra de Ouro (Rule of Thumb):** Use Channels se for mais expressivo para o fluxo do programa. Use Mutexes se for a solução mais simples para proteger o estado.