# elter
<p style="color: rgb(190,190,1970); font-size: 28px;">
    source code do bot elter-eduardo ( wip ).
    <br>
    serve para conversar, gerar imagens, conseguir informacoes relacionadas a osu!, etc...

</p>

<h1 style="font-size: 40px">
    todo:
</h1>

- misc commands para o osu!
- comandos de musica ( queue de play e skip )

<h1>
    Setup
</h1>

- instale node.js/npm
- pegue o token do seu bot no discord a partir desse link: https://discord.com/developers/applications
- crie um arquivo .env na raiz do projeto e coloque o token, mongodb user/pass e api key do osu. exemplo:
```
 DISCORD_TOKEN = ...
 DISCORD_ID = ...
 DB_USER  = ...
 DB_PASSWORD  = ...
 OSU_SECRET = ...
 OSU_ID = ...
 SPOTIFY_ID = ...
 SPOTIFY_SECRET = ...
 ROLE_ID  = ... ( apenas caso voce queira que o bot seja disponvivel apenas para um cargo especifico no seu servidor )
```
- instale as dependencias com o comando: `npm install`
- inicie o bot com o comando: `npm start`

<h1>Dev</h1>

- a cada comando adicionado utilize o `npm run register` para registrar o comando antes de inicializar o bot!
