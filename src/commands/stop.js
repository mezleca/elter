import { Queues, Queue } from "../utils/music/queue.js";    
import { embed_message } from "../utils/other.js";

const command = {
    name: "stop",
    description: "para a musica",
    async execute(interaction) {
        
        const id = interaction.guildId;

        if (!Queues.has(id)) {
            return await embed_message("stop", "nao tem nada tocando", interaction);
        };

        // remove queue da lista de queues
        /** @type {Queue} */
        const queue = Queues.get(id);
        queue.end();

        await embed_message("stop", "queue finalizada :3", interaction);
    }
};

export default command;