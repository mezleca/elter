import { v2, auth } from 'osu-api-extended';
import { spotify } from './spotify.js';
import { openai } from './openai.js';
import ytdl from 'ytdl-core';
import fs from 'fs';

const osu_prompt = fs.readFileSync("./src/utils/prompts/osu.prompt", "utf-8") || "";

await auth.login(process.env.OSU_ID, process.env.OSU_SECRET, ['public']);

export const find_osu_map = async (message) => {

    // NOTE: This is a very bad way to do this, but it works for now ;-;.

    const message_arr = message.split("/");
    let method = "";

    const music_info = {
        artist: "",
        title: ""
    };

    if (message_arr.includes("www.youtube.com") || message_arr.includes("www.youtu.be")) {
        method = "youtube";
    }
    else if ((message_arr.includes("open.spotify.com" || message_arr.includes("spotify.com"))) && message_arr.length >= 4 && message_arr.length <= 7) {
        method = "spotify";
    }
    else {
        method = "gpt";
    }

    console.log("method:", method);

    switch (method) {
        case "youtube":

            const video_id = message_arr[message_arr.length - 1].split("=")[1];
            const youtube = await ytdl.getInfo(video_id, { });

            let title = youtube.videoDetails.media.song || youtube.videoDetails.title;
            let _artist = youtube.videoDetails.media.artist || "";

            if (title.includes("-")) {
                const split = title.split("-");
                if (split[1].startsWith(" ")) {
                    split[1] = split[1].substring(1);
                }
                title = split[1];
            }

            music_info.artist = _artist;
            music_info.title = title;

            break;
        case "spotify":
            const type = message_arr[message_arr.length - 2];

            console.log("processing:", type);

            if (type === "album") {

                const album = await spotify.getAlbum(message_arr[message_arr.length - 1]);
                const tracks = album.body.tracks.items;

                const track = tracks[0];

                const artist_ = track.artists[0].name || "";
                const name = track.name || "";

                music_info.artist = artist_;
                music_info.title = name;

                break;
            }

            if (type === "playlist") {

                const playlist = await spotify.getPlaylist(message_arr[message_arr.length - 1]);
                const tracks = playlist.body.tracks.items;

                const track = tracks[0].track;

                const artist_ = track.artists[0].name || "";
                const name = track.name || "";

                music_info.artist = artist_;
                music_info.title = name;

                break;
            }

            const track = await spotify.getTrack(message_arr[message_arr.length - 1]);
            
            const artist_ = track.body.artists[0].name || "";
            const name = track.body.name || "";

            music_info.artist = artist_;
            music_info.title = name;
            
            break;
        default:
            const response = await openai.chat.completions.create({
                model: "gpt-4-1106-preview",
                temperature: 0.85,
                max_tokens: 3200,
                messages: [
                    {
                        role:"system", content: osu_prompt
                    },
                    {
                        role:"user", content: message
                    }
                ]
            });

            let text = response.choices[0].message.content;

            const json_text = text.split("{")[1].split("}")[0];
            if (json_text) {
                text = `{${json_text}}`;
                console.log(text);
            }
            
            try {
                const json = JSON.parse(text);

                music_info.artist = json.artist;
                music_info.title = json.title;
            }
            catch (error) {
                music_info.artist = "";
                music_info.title = "";
                console.log(error)
            }

            break;
    }

    console.log(music_info, method);

    if (!music_info.artist && !music_info.title) {
        return "nao foi possivel encontrar nenhum mapa com essas informacoes";
    }

    const name = music_info.title;
    const artist = music_info.artist;
  
    if (!name) {
        return "musica nao encontrada. envia o link correto viado"
    }
  
    await auth.login(process.env.OSU_ID, process.env.OSU_SECRET, ['public']);
  
    const map = await v2.beatmaps.search({query: `${name} ${artist ? "artist" + artist : ""}`, mode: "osu", section: ""});
  
    if (map.beatmapsets.length === 0) {
        throw new Error("no maps found");
    }

    // faz um looping sobre map e verifica se algum deles possui o title igual ao da musica se sim retorna o link do mapa.
    for (let i = 0; i < map.beatmapsets.length; i++) {
        const map_ = map.beatmapsets[i];
        if (map_.title.toLowerCase() === name.toLowerCase()) {
            return `https://osu.ppy.sh/beatmapsets/${map_.id}`;
        }
    }

    let str = "";

    // se nao achar porra nenhuma retorna os 3 primeiros fds.
    for (let i = 0; i < 3; i++) {
        
        if (i >= map.beatmapsets.length) 
            break;

        const map_ = map.beatmapsets[i];
        str += `${i + 1}. ${map_.title} - ${map_.artist} (${map_.creator})\nhttps://osu.ppy.sh/beatmapsets/${map_.id}\n\n`;
    }
  
    return str;
};