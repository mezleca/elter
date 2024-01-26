import { download } from "../utils/music/find_song.js";
import { types } from "../utils/types.js";
import { embed_message } from "../utils/other.js";
import Ffmpeg from "fluent-ffmpeg";
import path from "path";
import fs from "node:fs";

const command = {
    name: 'ytdl',
    description: "utilize esse comando para baixar audios do youtube",
    options: [
        {
            name: "url",
            description: "url para baixar o audio",
            type: types.STRING,
            required: true
        }
    ],
    async execute(interaction) {

        const timestamp = Date.now();
        const url = interaction.options.getString("url");
        const audio_path = path.resolve("./temp/" + timestamp + ".webm");

        await interaction.deferReply({ephemeral: false});

        try {
            await download(timestamp, "youtube", url)();

            if (!fs.existsSync(path.resolve("./temp/" + timestamp + ".mp3"))) {
                return await interaction.editReply("video nao encontrado arrombado");
            }

            const promise = new Promise((r, rj) => {
                Ffmpeg(audio_path)
                .audioBitrate(128)
                .save(path.resolve("./temp/" + timestamp + ".mp3"))
                .on("end", () => {
                    r();
                });
            });

            await promise;

            fs.unlinkSync(audio_path);

            const mp3_path = path.resolve("./temp/" + timestamp + ".mp3");

            await embed_message("audio", mp3_path, interaction, "audio");

            fs.unlinkSync(mp3_path);

        } catch(err) {
            console.log(err);
            await interaction.editReply("ocorreu um erro ao baixar o audio");
        }
    }
};

export default command;