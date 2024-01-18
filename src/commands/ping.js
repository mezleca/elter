import { embed_message } from "../utils/other.js";

const command = {
    
    name: "ping",
    description: "Pong!",
    async execute(interaction) {
        await embed_message("classic", "Pong!", interaction);
    }
};

export default command;