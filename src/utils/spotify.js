import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({
    path: "../.env"
});

const clientId = process.env.SPOTIFY_ID, clientSecret = process.env.SPOTIFY_SECRET;

export const spotify = new SpotifyWebApi({
    clientId: clientId,
    clientSecret: clientSecret
});

const data = new URLSearchParams();
data.append('grant_type', 'client_credentials');
data.append('client_id', clientId);
data.append('client_secret', clientSecret);

axios.post('https://accounts.spotify.com/api/token', data, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })
  .then(response => {
    spotify.setAccessToken(response.data.access_token);
  })
  .catch(error => {
    console.error('Erro ao obter o token de acesso:', error.message);
});