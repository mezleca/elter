import axios from "axios";
import path from "path";
import fs from "node:fs";
import { fileTypeFromBuffer } from "file-type";
import { exec } from "child_process";
import { embed_message } from "../utils/other.js";
import { types } from "../utils/types.js";
import { Attachment, CommandInteraction } from "discord.js";
import Ffmpeg from "fluent-ffmpeg";

const command = {
    name: "nightcore",
    description: "transforma um áudio em nightcore",
    options: [
        {
            name: "audio",
            description: "audio para transformar em nightcore",
            type: types.ATTACHMENT,
            required: true
        }
    ],
    /** @param {CommandInteraction} interaction */
    async execute(interaction) {

        await interaction.deferReply({ ephemeral: false });

        try {
            /** @type {Attachment} */

            if (!fs.existsSync(path.resolve("./temp"))) {
                fs.mkdirSync(path.resolve("./temp"));
            }

            const audio = interaction.options.getAttachment("audio");
            const audio_url = await axios.get(audio.url, {
                responseType: "arraybuffer"
            });

            const data = await audio_url.data;
            const type = await fileTypeFromBuffer(data);

            const audio_path = path.resolve("./temp/audio." + type.ext);
            
            fs.writeFileSync(audio_path, data);

            Ffmpeg(audio_path)
                .audioFilters("asetrate=44100*1.25,aresample=44100,atempo=1.25")
                .outputOptions("-map 0:a")
                .save(path.resolve("./temp/nightcore.mp3"))
                .on("end", async () => {
                    await embed_message("nightcore", path.resolve("./temp/nightcore.mp3"), interaction, "audio");
                    fs.unlinkSync(audio_path);
                    fs.unlinkSync(path.resolve("./temp/nightcore.mp3"));
                });
            
        } catch(err) {
            console.log(err);
            await interaction.editReply({ content: "ocorreu um erro ao processar o áudio" });
        }
    }
};

export default command;