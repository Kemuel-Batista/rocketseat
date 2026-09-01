
---

# Checklist de Qualidade para Apps React Native / Expo

Use este checklist antes de publicar uma versão do aplicativo ou entregar uma funcionalidade.

---

# Dispositivos físicos

☐ Testei o aplicativo em **um Android físico**

☐ Testei o aplicativo em **um iPhone físico**

Simuladores não reproduzem vários comportamentos reais como:

* teclado real 
* camera
* sensores
* performance 
* problemas de rede
* comportamento do sistema

Todo desenvolvedor mobile deveria ter **pelo menos um Android e um iPhone reais** para testar.

---

# Text

☐ Testei com **tamanho de fonte do sistema aumentado**

☐ Abri o simulador emulando tamanho real do dispositivo físico 

Usuários podem alterar o tamanho da fonte nas configurações do aparelho.
Isso pode quebrar layouts, botões e textos.

☐ Verifiquei **quebra de linha e truncamento**

* `numberOfLines`
* `ellipsizeMode`
* `adjustsFontSizeToFit`
* `allowFontScaling`
* `maxFontSizeMultiplier`
* `minFontSizeMultiplier`


☐ Defini cores explicitamente

Se a cor não for definida, o texto usa a **cor padrão do sistema**, o que pode gerar problemas no dark mode.

---

# TextInput

☐ Testei formulários com **teclado aberto**

Verificar se o teclado não cobre:

* inputs
* botões
* mensagens de erro
* autocorrect

☐ Configurei comportamento de envio do formulário

Exemplos importantes:

* `onSubmitEditing`
* `returnKeyType`
* foco no próximo campo

☐ Testei formulários em **diferentes tamanhos de tela**

---

# Orientação de tela

☐ Testei o aplicativo em **portrait e landscape**

OU

☐ Configurei explicitamente para **portrait only**

Se não for configurado, o usuário pode girar o aparelho e quebrar o layout.

---

# Dark Mode

☐ Testei o aplicativo com **tema escuro do sistema**

Verificar:

* textos visíveis
* ícones visíveis
* contraste adequado

Problema comum:

texto preto em fundo escuro.

---

# Navegação Android

☐ Testei o comportamento com **barra de navegação visível**

Alguns aparelhos Android têm:

* botões virtuais
* barra inferior

Ela pode **sobrepor a aplicação**.

☐ Testei o **botão voltar do Android**

Ele deve funcionar corretamente para:

* voltar telas
* fechar modais
* cancelar ações

Problema comum: botão voltar fecha o app inesperadamente.

---

# Status Bar

☐ Verifiquei se a **status bar está correta em todas as telas**

Problemas comuns:

* texto branco em fundo claro
* texto preto em fundo escuro

---

# Safe Area

☐ Testei telas em dispositivos com **notch**

Verificar se conteúdo não fica:

* atrás do notch
* colado no indicador de gesto

Usar:

* SafeAreaView
* ou bibliotecas de safe area

---

# APIs reais

☐ Testei o aplicativo usando **API real e não apenas localhost**

Problema comum:

A API funciona em localhost, mas **não conecta em produção**.

Possíveis causas:

* permissões de rede
* domínio não permitido
* HTTPS obrigatório
* configuração do backend

Também testar:

☐ comportamento com **rede lenta**
☐ comportamento com **API fora do ar**

---

# Deeplinks

☐ Testei todos os **deeplinks do aplicativo**

Problema comum:

A tela funciona na navegação interna, mas **quebra quando aberta via deeplink**.

Exemplo clássico:

Tela de detalhes recebe dados vindos de uma lista.

Na navegação interna:

lista → detalhes
os dados já estão carregados.

No deeplink:

app://usuario/123

A tela abre **sem os dados necessários**.

Boas práticas:

☐ verificar se todos os parâmetros necessários estão no deeplink

☐ buscar dados na API caso faltem informações

☐ validar parâmetros antes de renderizar a tela

---

# Estados de erro

☐ Testei erros de rede

☐ Testei timeout da API

☐ Testei respostas inválidas

A aplicação deve:

* mostrar erro claro
* permitir retry
* não quebrar a interface

---

# Estados offline

☐ Testei o aplicativo **sem internet**

Verificar:

* telas que dependem de API
* comportamento de formulários
* mensagens para o usuário

---

# Listas

☐ Testei listas com **muitos itens**

Verificar:

* scroll fluido
* renderização correta
* ausência de travamentos

---

# Permissões

Se o app usa recursos do aparelho:

☐ câmera

☐ localização

☐ microfone

☐ galeria

Testar cenários:

☐ usuário aceita

☐ usuário nega

☐ usuário nega permanentemente

O app não deve quebrar nesses casos.

---

# Performance básica

☐ Navegação entre telas está fluida

☐ Scroll de listas não trava

☐ Animações não engasgam

---

# Patches em dependências

☐ Verifiquei se existem **alterações feitas diretamente em dependências**

Durante o desenvolvimento, é comum encontrar bugs em bibliotecas e fazer ajustes diretamente dentro de `node_modules` para testar uma solução.

Exemplo comum:

Você encontra um problema em uma biblioteca como `react-native-calendars`, descobre a causa e faz a correção diretamente no código da dependência dentro de `node_modules`.

O problema é que a pasta `node_modules` **não faz parte do versionamento** e pode ser recriada a qualquer momento.

Situações que podem apagar essas alterações:

* instalar uma nova dependência (`npm install` ou `yarn add`)
* atualizar dependências
* remover `node_modules`
* rodar `npm install` em outro ambiente (CI/CD ou outro desenvolvedor)

Nesse caso, a biblioteca volta ao comportamento original, e a correção desaparece.

Isso pode gerar um problema difícil de detectar:
a funcionalidade funcionava no ambiente de desenvolvimento, mas quebra após uma nova instalação de dependências.

Exemplo de cenário real:

1. Um bug é corrigido manualmente em `node_modules`.
2. Uma nova dependência é adicionada ao projeto.
3. O `node_modules` é reinstalado.
4. A alteração no pacote é perdida.
5. Uma tela que dependia dessa correção volta a quebrar.
6. Se essa tela não for testada novamente, o erro pode ir para produção.

Boas práticas:

☐ Evitar alterar dependências diretamente em `node_modules`

Se for necessário modificar uma biblioteca, utilizar ferramentas como:

* `patch-package`
* fork da biblioteca
* pull request para o projeto original

`patch-package` permite registrar a alteração feita no `node_modules` e reaplicá-la automaticamente após cada instalação de dependências.

Isso garante que a correção continue funcionando mesmo após reinstalar o projeto.


