### Observações:
>A funcionalidade de ownership desenvolvi fora das aulas, mas estou disponibilizando ainda assim para que vocês possam acompanhar ao máximo o desenvolvimento da aplicação. Muita coisa está sendo implementada pelo lado do backend, esses prompts não serão disponibilizados aqui, quem tiver curiosidade sobre essa parte, pode entrar em contato comigo diretamente, vai ser um prazer conhecer vocês.

## 🟢 PROMPT 1 

> Vamos adicionar uma funcionalidade de flag no nosso app no mapa, a flag vai estar no centro da cell res8 e o user que primeiro chegar vira o owner dessa cell, a flag precisa ser renderizada no mapa e quero experimentar uma animação, uma flag@mobile/gorocketleague/assets/animations/Flag.json , o posicionamento dela vai vir pelo colyseus não precisa se preocupar com isso agora, mas quero antes de implementar testar, então crie uma marker com uma lat lng fixa a mesma que nosso usuário inicia no app, só pra eu ver como vai comportar essa animaçÃo como marker, se vai funcionar bem

## 🟢 PROMPT 2

> @mobile/gorocketleague/assets/animations/Puffy.json Vamos rodar essa animaçÃo quando o user estiver na mesma cell res13 da bandeira, substitua a bandeira por esse puffy e depois que rodar uma vez, remove o puffy a ideia é dar a sensação de coleta da bandeira, ( vamos apenas testar primeiro, depois vamos remover essa implementação pra fazer corretamente pelo backend )

## 🟢 PROMPT 3

>[CellState] cell:88a88cdb35fffff {"users":{"PuDYr2bkF":{"id":"ef52ebc6-cb41-4b4b-9fba-d5dba3f652e6","username":"LuisReisDev","avatarId":"4","level":1,"xp":0,"fuel":87.25440216064453,"coverage":0,"lat":-19.914165496826172,"lng":-43.93463134765625,"h3UserCell":"89a88cdb357ffff","deltaKm":0.09709857404232025}},"owner":{"userId":""},"flag":{"lat":-19.912078857421875,"lng":-43.93039321899414,"isCaptured":false}} Agora no cell state temos as coordenadas da flag, vamos exibir a flag no mapa, a captura ocorre no backend que envia a seguinte mensagem this.broadcast("flagCaptured", payload) o payload é 
```
{
  h3RoomCell: this.roomCell ?? "",
  capturedByUserId: userId,
  ownerUserId: this.state.owner.userId,
}
```
> Se chegar essa mensagem e a flag tiver sido capturada pelo user logado, exiba um toast, depois vamos falar em animação pra essa parte a flag deve ser removida do mapa em troca de sala pra nÃo ficar acumulando flags  

## 🟢 PROMPT 4

>no userstate da cell agora temos mais duas informações flagsOwned: number;  ownedAreaKm2: number, vamos adicionar o flagsowned no dashboadsubstituindo a informação xpGained

## 🟢 PROMPT 5

>Vamos implementar um radar, como uma bussola apontando pra bandeira da cell, esse radar ele vai ser ativado pelo server, como um premio ou bonus, em caso de o usuário estar num celula que ainda nÃo tem owner e o usuário conseguir um card de ativar o radar. mas por enquanto, pra testes, vamos deixar sempre ativo, pra testar a funcionalidade vamos deixar ele por voltar do user uma seta azul sutil