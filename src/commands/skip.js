import { Queue, Queues } from "../utils/music/queue.js";

const command = {
    name: "skip",
    description: "pula a musica atual",
    async execute(interaction) {

        await interaction.deferReply({ephemeral: false});

        if (!interaction.member.voice.channelId) {
            return await interaction.editReply("voce precisa estar em um canal de voz!");
        }

        if (!Queues.has(interaction.guildId)) {
            return await interaction.editReply("nao estou tocando nada");
        }

        /** @type {Queue} */
        const queue = Queues.get(interaction.guildId);

        if (queue.length === 0) {
            return await interaction.editReply("nao estou tocando nada");
        }

        queue.skip();

        return await interaction.editReply("musica atual pulada");
    }
};

export default command;