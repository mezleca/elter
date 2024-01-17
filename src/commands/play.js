import { types } from "../utils/types.js";
import { Queue, Queues } from "../utils/music/queue.js";
import { find_by_name, find_by_url, download } from "../utils/music/find_song.js";
import path from "path";
import fs from "node:fs";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, StreamType } from "@discordjs/voice";

const reset = async (interaction, player, connection, reason) => {

    if (!connection || !player) {
        await interaction.editReply("Ocorreu um erro... Tente novamente mais tarde");
    }

    if (reason === "disconnect") {
        return await interaction.editReply("Fui desconectado da call...");
    }
    else if (reason === "error") {
        await interaction.editReply("Sai da call por causa de um erro...");
    }
    else if (reason === "end") {
        await interaction.editReply("Acabou as musicas...");
    }

    // se o connection nao foi destruido ainda, destrua ele
    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
        connection.destroy();
    }
    player.stop();
    Queues.delete(interaction.guildId);

    await interaction.editReply("sai da call galado");
}

const play_song = async (connection, interaction, queue, player, skip) => {

    if (player.state.status === AudioPlayerStatus.Playing) {
        player.stop();
    }

    if (queue.length === 0) {
        reset(interaction, player, connection, "end");
        return;
    }

    await download(queue.first.id, "youtube", await queue.first.id)();

    // caso nao consiga acessar o arquivo, remove ele da queue e da play na proxima
    if (!fs.existsSync(path.resolve(`./temp/${queue.first.id}.webm`))) {
        console.log("nao consegui acessar o arquivo");
        fs.unlinkSync(path.resolve(`./temp/${queue.first.id}.webm`));
        queue.remove();
        return play_song(connection, interaction, queue, player);
    }

    const next_resource = createAudioResource(fs.createReadStream(path.resolve(`./temp/${queue.first.id}.webm`)), { inputType: StreamType.Arbitrary });

    await interaction.editReply("tocando: " + queue.first.name);   

    player.play(next_resource);
};

const command = {
    name: "play",
    description: "da play em uma musica",
    options: [
        {
            name: "play",
            description: "nome da musica / url",
            type: types.STRING,
            required: true
        }
    ],
    async execute(interaction) {

        const name = interaction.options.getString("play");
        await interaction.deferReply({ephemeral: false});

        try {

            if (!interaction.member.voice.channelId) {
                return await interaction.editReply("voce precisa estar em um canal de voz!");
            }

            const song = await find_by_url("youtube", name)();

            // adiciona 2 links do youtube de test na queue
            // const song = await find_by_url("youtube", "https://www.youtube.com/watch?v=5qap5aO4i9A")();
            // const song2 = await find_by_url("youtube", "https://www.youtube.com/watch?v=5qap5aO4i9A")();
            
            if (!Queues.has(interaction.guildId)) {
                const queue = new Queue(interaction.guildId);
                Queues.set(interaction.guildId, queue);
            }

            /** @type {Queue} */
            const queue = Queues.get(interaction.guildId);

            const id = name.split("v=")[1];

            if (queue.length > 0) {

                if (queue.get(id)) {
                    return await interaction.editReply("essa musica ja esta na queue");
                }

                queue.add(song.videoDetails.videoId, song.videoDetails.title);

                return await interaction.editReply("adicionado a queue");
            } else {
                queue.add(song.videoDetails.videoId, song.videoDetails.title);
            }

            await download(queue.first.id, "youtube", queue.first.id)();

            const connection = joinVoiceChannel({
                channelId: interaction.member.voice.channelId,
                guildId: interaction.guildId,
                adapterCreator: interaction.guild.voiceAdapterCreator
            });

            const player = createAudioPlayer();

            const cu = fs.createReadStream(path.resolve(`./temp/${queue.first.id}.webm`));
            const resource = createAudioResource(cu, { inputType: StreamType.Arbitrary });

            connection.subscribe(player);
            player.play(resource);

            // caso a musica tenha acabado, remove ela da queue e da play na proxima
            player.on(AudioPlayerStatus.Idle, async () => {

                if (queue.skipped) {
                    return;
                }

                console.log("acabou a musica")
    
                fs.unlinkSync(path.resolve("./temp/" + queue.first.id + ".webm"));
            
                queue.remove();
            
                if (queue.length === 0) {
                    reset(interaction, player, connection, "end");
                    return;
                }
            
                await play_song(connection, interaction, queue, player);
            });

            // caso o bot seja desconectado, remove a queue e deleta o arquivo
            connection.on(VoiceConnectionStatus.Disconnected, () => {
                return reset(interaction, player, connection, "disconnect");
            });

            player.on(AudioPlayerStatus.Playing, () => {
                console.log("tocando");
            });

            player.on("error", error => {
                console.log(error.message);
                return reset(interaction, player, connection, "error");
            });

            queue.on("skip", () => {
                player.pause();
                play_song(connection, interaction, queue, player, true);
                queue.skipped = false;
            });

            queue.on("end", () => {
                return reset(interaction, player, connection, "end");
            });

            await interaction.editReply("tocando: " + queue.first.name);
            
        } catch (err) {
            console.log(err);
            await interaction.editReply("erro...");
        }
    }
};

export default command;