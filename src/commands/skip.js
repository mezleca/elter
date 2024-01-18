import { Queue, Queues } from "../utils/music/queue.js";
import { embed_message } from "../utils/other.js";

const command = {
    name: "skip",
    description: "pula a musica atual",
    async execute(interaction) {

        await interaction.deferReply({ephemeral: false});

        if (!interaction.member.voice.channelId) {
            return await embed_message("skip", "voce precisa estar em um canal de voz!", interaction);
        }

        if (!Queues.has(interaction.guildId)) {
            return await embed_message("skip", "nao tem nada tocando galado", interaction);
        }

        /** @type {Queue} */
        const queue = Queues.get(interaction.guildId);

        if (queue.length === 0) {
            return await embed_message("skip", "nao tem nada tocando galado", interaction);
        }

        queue.skip();

        await embed_message("skip", "musica pulada", interaction);
    }
};

export default command;