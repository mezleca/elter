import { types } from "../utils/types.js";
import { Queue, Queues } from "../utils/music/queue.js";
import { find_by_name, find_by_url, download } from "../utils/music/find_song.js";
import path from "path";
import fs from "node:fs";
import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, entersState, StreamType } from "@discordjs/voice";
import { embed_message } from "../utils/other.js";

const reset = async (interaction, player, connection, reason) => {

    if (!connection || !player) {
        await interaction.editReply("Ocorreu um erro... Tente novamente mais tarde");
    }

    if (reason === "disconnect") {
        return embed_message("disconnect", "fui desconectado", interaction);
    }
    else if (reason === "error") {
        await interaction.editReply("Sai da call por causa de um erro...");
    }
    else if (reason === "end") {
        await interaction.editReply("Acabou as musicas...");
    }

    if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
        connection.destroy();
    }

    player.stop();
    Queues.delete(interaction.guildId);

    await embed_message("end", "queue finalizada :3", interaction);
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

    await embed_message("tocando", queue.first.name, interaction);   

    player.play(next_resource);
};

const sla = (interaction, songs) => {
    return new Promise(async(resolve, reject) => {

        const embed = {
            title: "Musicas encontradas",
            description: songs.map((item, index) => { return `${index + 1} - **${item.title}** (${item.timestamp})` }).join("\n"),
            color: 0x2F3136
        };

        const message = await interaction.editReply({embeds: [embed]});

        const emotes = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣"];

        for (let i = 0; i < songs.length; i++) {
            await message.react(emotes[i]);
        }

        const filter = (reaction, user) => {
            return emotes.includes(reaction.emoji.name) && user.id === interaction.user.id;
        };

        try {

            console.log("indo prra porra da promisse");

            const collector = message.createReactionCollector({ filter: filter, time: 15_000 });
            collector.on('collect', async (reaction, user) => {
                const index = emotes.indexOf(reaction.emoji.name);
                let song = songs[index];
                song = await find_by_url("youtube", song.url)();
                resolve(song);
            });

            collector.on('end', async (collected) => {

                if (collected.size === 0) {
                    await embed_message("nao escolheu nada", "isso ai", interaction);           
                }

                let song = await find_by_url("youtube", songs[0].url)();
                reject(song);
            });
        } catch(err) {
            console.log(err);
            await embed_message("nao escolheu nada", "isso ai", interaction);     
        } 
    });
};

const command = {
    name: "play",
    description: "da play em uma musica",
    options: [
        {
            name: "song",
            description: "nome da musica / url",
            type: types.STRING,
            required: false,
        },
        {
            name: "name",
            description: "nome da musica",
            type: types.STRING,
            required: false,
        }
    ],
    async execute(interaction) {

        const url = interaction.options.getString("song");
        const name = interaction.options.getString("name");

        await interaction.deferReply({ephemeral: false});

        try {

            if (!interaction.member.voice.channelId) {
                return await embed_message("play", "voce precisa estar em um canal de voz!", interaction);
            }

            const songs = url ? await find_by_url("youtube", url)() : await find_by_name("youtube", name)();
            let song = null;

            song = url ? songs : await sla(interaction, songs);

            if (!song) {
                return await embed_message("play", "nao achei a musica ;-;", interaction);
            }
            
            if (!Queues.has(interaction.guildId)) {
                const queue = new Queue(interaction.guildId);
                Queues.set(interaction.guildId, queue);
            }

            /** @type {Queue} */
            const queue = Queues.get(interaction.guildId);

            const id = url ? url.split("v=")[1] : song.videoDetails.videoId;

            if (queue.length > 0) {

                if (queue.get(id)) {
                    return await embed_message("play", "essa musica ja esta na queue", interaction);
                }

                queue.add(song.videoDetails.videoId, song.videoDetails.title);

                return await embed_message("play", "musica adicionada a queue", interaction);
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

            const embed = {
                title: "tocando",
                description: queue.first.name,
                color: 0x2F3136
            };

            await interaction.editReply({embeds: [embed]});
            
        } catch (err) {
            console.log(err);
            await embed_message("error", "ocorreu um erro... tente novamente mais tarde", interaction);
        }
    }
};

export default command;