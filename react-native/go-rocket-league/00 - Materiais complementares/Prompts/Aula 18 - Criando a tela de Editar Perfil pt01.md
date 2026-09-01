
---
## 🟢 PROMPT 1 

> Vamos criar agora a tela de editar perfil, @UI_React_para_referencia/src/app/components/EditProfileScreen.tsx , inicialmente vamos fazer so a parte do avatar e do username   
---

## 🟢 PROMPT 2 
>Vamos alterar o user name e avatar diretamente no servidor para atualizar o user a rota é url_base/user e o body contem nesse caso apenas o username e o avatarId, nenhum é obrigatório, os avatars são sequenciais, e vc já tem a url padrão. Para saber quantos avatars tem basta consultar na rota get/avatars que vai devolver a quantidade ex:  { "count": 69 }, e assim você consegue criar uma lista horizontal com os avatars disponiveis, a rota para post do user precisa ser autenticada, a de busca dos avatars não
---

## 🟢 PROMPT 3
>@profile.tsx (22-29) não vamos mais ter esse avatar colors então remova, tudo que não estamos usando, remova. A lista de avatars eu quero na mesma sessão do avatar do usuário, vai bustituir essas cores que estavam logo abaixo do avatar, e só devem ficar visíveis se o usuário clicar pra editar o avatar, no lugar onde era o icone de camera pra trocar o avatar, vai ser um icone de edição

---
## 🟢 PROMPT 4

>Vc implementou na tela de perfil, mas era pra implementar na tela de Editar perfil

---
## 🟢 PROMPT 5

>Nessa tela, Editar Perfil, eu quero o icone de editar no avatar, e quando clica nesse icone abre a lista de opções de avatar

---
## 🟢 PROMPT 6

>Agora vamos fazer alguns ajustes na lista de avatar, quero um fade nas extremidades, e quero que o tamanho do avatar fique ligeiramente maior equanto se aproxima do centro da tela, quero que implemente tbm o paginenabled e o haptics pra ter um melhor feedback e usabilidade nesse componente

---
## 🟢 PROMPT 7

>quero que quando abrir a lista o primeiro item esteja já alinhado à esquerda da tela, ele abriu centralizado e não ficou legal

---
## 🟢 PROMPT 8

>O haptics não está obedecendo a velocidade do scroll, pra cada item que passar pelo centro da tela, precisa dar um toque

---
## 🟢 PROMPT 9

>Na tela de perfil, todos os componentes,o card no topo da tela e os cards de stats,possuem uma animação que executa toda vez que a tela volta ao foco, estou compartilhando com você o arquivo de exemplo para você conseguir replicar as animações@UI_React_para_referencia/src/app/components/ProfileScreen.tsx 

---
## 🟢 PROMPT 10

>@UI_React_para_referencia/src/app/components/EditProfileScreen.tsx replique tbm as animações para os componentes da tela de editProfile

---
## 🟢 PROMPT 11

> runOnJS, está obsoleto, não devemos usar nada obsoleto no nosso código