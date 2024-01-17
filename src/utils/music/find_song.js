import ytdl from "ytdl-core";
import path from "path";
import fs from "node:fs";
import { spotify } from "../spotify.js";
import { read } from "fs";

export const find_by_name = (method, name) => {

    return async () => {
        if (method === "youtube") {
            const result = await ytdl.search(name);
            const video = result.videos[0];
            return video;
        }

        const result = await spotify.search(name, { limit: 1, type: "track" });
        const track = result.body.tracks.items[0];
        return track;
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

export const download = (timestamp, method, url) => {

    return async () => {
        if (method === "youtube") {

            const readable = ytdl(url, {
                filter: "audioonly",
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });
            const temp_path = path.resolve("./temp");

            // caso o path nao exista, cria ele
            if (!fs.existsSync(temp_path)) {
                fs.mkdirSync(temp_path);
            }

            const writable = fs.createWriteStream(`./temp/${timestamp}.webm`);
            readable.pipe(writable);

            await new Promise((resolve, reject) => {
                writable.on("finish", resolve);
                writable.on("error", reject);
            });

            return;
        }
        else {
            return "Apenas youtube por enquanto galado"
        }
    };
};