import { Queue, Queues } from "../utils/music/queue.js";

const command = {
    name: "queue",
    description: "mostra a lista de queue formatada",
    async execute(interaction) {

        const id = interaction.guildId;

        await interaction.deferReply({ephemeral: false});

        if (!Queues.has(id)) {
            return await interaction.reply("nao tem nada tocando");
        };

        /** @type {Queue} */
        const queue = Queues.get(id);

        const embed = {
            title: "Queue",
            description: queue.queue.map((item, index) => {
                return `${index + 1} - ${item.name}`;
            }).join("\n"),
            color: 0x2F3136
        };

        await interaction.editReply({embeds: [embed]});
    }
};

export default command;