# elter
<p style="color: rgb(190,190,1970); font-size: 28px;">
    source code do bot elter-eduardo ( wip ).
    <br>
    serve para conversar, gerar imagens, conseguir informacoes relacionadas a osu!, etc...

</p>

<h1 style="font-size: 40px">
    todo:
</h1>

- add agent ( detectar quando o usuario pedir uma foto/imagem/etc )
- add comando exclusivo para gerar imagens.
- add osu map finder ( pelo nome da musica ).

<h1>
    Setup
</h1>

- instale node.js/npm
- pegue o token do seu bot no discord a partir desse link: https://discord.com/developers/applications
- crie um arquivo .env na raiz do projeto e coloque o token, mongodb user/pass e api key do osu. exemplo:
```
 TOKEN=seu_token_aqui
 DISCORD_TOKEN = ...
 DISCORD_ID = ...
 DB_USER  = ..
 DB_PASSWORD  = ..
 OSU_API_KEY = ...
 OSU_API_ID = ...
```
- instale as dependencias com o comando: `npm install`
- inicie o bot com o comando: `npm start`

<h1>Dev</h1>

- a cada comando adicionado utilize o `npm run register` para registrar o comando antes de inicializar o bot!