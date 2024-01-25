import { v2, auth, tools, mods } from 'osu-api-extended';
import { spotify } from './spotify.js';
import { openai } from './openai.js';
import { recognize_song } from './other.js';
import ytdl from 'ytdl-core';
import fs from 'fs';
import { levenshteinEditDistance } from 'levenshtein-edit-distance';

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
            
            const song = await recognize_song(message);

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

    if (!music_info.artist && !music_info.title) {
        return "nao foi possivel encontrar nenhum mapa com essas informacoes";
    }

    const name = music_info.title;
    const artist = music_info.artist;
  
    if (!name) {
        return "musica nao encontrada. envia o link correto viado"
    }
  
    await auth.login(process.env.OSU_ID, process.env.OSU_SECRET, ['public']);

    // qual o sentido de na pagina tu conseguir buscar em todas as sections mas na api nao???
    const sections = ["ranked", "loved", "pending", "graveyard"];
    let maps = [], found = false;

    for (let i = 0; i < sections.length; i++) {

        if (found) {
            break;
        }

        const section = sections[i];
        const map = await v2.beatmaps.search({ query: `${artist} ${name}`, mode: "osu", section: section });

        if (name) {
            map.beatmapsets.map((_map) => {
                const distance = levenshteinEditDistance(_map.title.toLowerCase(), name.toLowerCase());
                if (distance <= 1) {
                    console.log("found map, section:", sections[i]);
                    found = `https://osu.ppy.sh/beatmapsets/${_map.id}`;
                }  
            });
        }

        if (!map.beatmapsets[0]) 
            continue;

        maps.push(map.beatmapsets[0]);
    }

    if (found) {
        return found;
    }

    // remove os mapas duplicados
    maps = [...new Set(maps)];
  
    if (maps.length === 0) {
        throw new Error("no maps found");
    }

    let str = "";

    // se nao achar porra nenhuma retorna os 3 primeiros fds.
    for (let i = 0; i < 3; i++) {
        
        if (i >= maps.length) 
            break;

        const map_ = maps[i];
        str += `${i + 1}. ${map_.title} - ${map_.artist} (${map_.creator})\nhttps://osu.ppy.sh/beatmapsets/${map_.id}\n\n`;
    }
  
    return str;
};

export const get_map_pp = async (id, mod) => {

    const mod_id  = mods.id(mod);
    const data = await tools.pp.calculate(id, mod_id);

    const text = 
    `
**100%**: ${data.pp.acc['100']}PP
**98%**: ${data.pp.acc['98']}PP
**95%**: ${data.pp.acc['95']}PP
**90%**: ${data.pp.acc['90']}PP
    `

    const info = {
        title: `**${data.data.artist}** - **${data.data.title}** [ **${data.data.diff}** ]`,
        diff: `**${data.stats.star.pure}**★ **${mod ? `+${mod}` : "NM"}**`,
        text: text,
        thumb: data.other.bg
    };

    return info;
};