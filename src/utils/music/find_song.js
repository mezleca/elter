import ytdl from "ytdl-core";
import ytsr from "yt-search";
import path from "path";
import fs from "node:fs";
import { spotify } from "../spotify.js";

export const find_by_name = (method, name) => {

    return async () => {
        if (method === "youtube") {
            const result = await ytsr(name);
            // filter the array to contain only videos
            const filtered = result.videos.filter((video) => video.type === "video");

            return filtered.slice(0, 5);
        }
        else {
            return [];
        }
    };
};

export const find_by_url = (method, url) => {

    return async () => {
        if (method === "youtube") {
            const video = await ytdl.getBasicInfo(url);
            return video;
        }

        const track = await spotify.getTrack(url);
        return track;
    };
};

// TODO: rework
export const download = async (timestamp, method, url) => {

    try {

        let did_get_a_error = false, readable;

        if (method === "youtube") {

            await new Promise( (re, rej)=> {
                readable = ytdl(url, {
                    filter: "audioonly",
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25
                });
    
                readable.on("error", (error) => {      
                    did_get_a_error = true;
                    rej(error);
                });

                readable.on("finish", () => {
                    re();
                }); 
            });
            
            const temp_path = path.resolve("./temp");

            // caso o path nao exista, cria ele
            if (!fs.existsSync(temp_path)) {
                fs.mkdirSync(temp_path);
            }

            const writable = fs.createWriteStream(`./temp/${timestamp}.webm`);
            readable.pipe(writable);

            await new Promise((resolve, reject) => {
                writable.on("finish", () => { console.log("download feito com sucesso"); resolve(); } );
                writable.on("error", reject);
            });

            return true;
        } 
            
        return false;
        
    } catch(err) {
        console.log("ocorreu um erro", err);
        return false;
    }
};