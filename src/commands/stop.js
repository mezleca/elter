import { Queues } from "../utils/music/queue.js";    

const command = {
    name: "stop",
    description: "para a musica",
    async execute(interaction) {
        
        const id = interaction.guildId;

        if (!Queues.has(id)) {
            return await interaction.reply("nao tem nada tocando");
        };

        // remove queue da lista de queues
        Queues.delete(id);
    }
};

export default command;