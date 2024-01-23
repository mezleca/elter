import { embed_message } from "../utils/other.js";

const command = {
    
    name: "ping",
    description: "Pong!",
    async execute(interaction) {

        await interaction.deferReply();

        const ping = Date.now() - interaction.createdTimestamp;
        await embed_message("classic", "Pong\n delay: " + ping + "ms", interaction);
    }
};

export default command;