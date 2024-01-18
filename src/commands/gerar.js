import { types } from "../utils/types.js";
import { generate_text, generate_image, get_prompt } from "../utils/openai.js";
import { History } from "../utils/models/History.js";
import { embed_message } from "../utils/other.js";

const command = {

    name: 'gerar',
    description: "utilize esse comando para gerar imagens",
    options: [
        {
            name: "prompt",
            description: "prompt para gerar a imagem",
            type: types.STRING
        }
    ],
    async execute(interaction) {

        try {
            await interaction.deferReply({ephemeral: false});
            const prompt_text = interaction.options.getString("prompt"),
            prompt_enhancer   = get_prompt("enhancer.prompt");
    
            let history = await History.find({});
    
            if (history.length > 10) {
                history = history.slice(history.length - 10, history.length);
            };
    
            const enhanced_prompt = await generate_text(prompt_enhancer, prompt_text, history[0]);
    
            history.unshift({
                timestamp: Date.now(),
                date: new Date().toLocaleString(),
                role: "user",
                name: interaction.user.username,
                content: prompt_text
            });
    
            const new_history = new History(history[0]);
    
            await new_history.save();
    
            const image = await generate_image(prompt_text);

            const bot_history = new History({
                timestamp: Date.now(),
                date: new Date().toLocaleString(),
                role: "bot",
                name: "elter",
                content: enhanced_prompt
            });

            await bot_history.save();
    
            await embed_message(`${enhanced_prompt}`, image, interaction, true);
        } catch(err) {
            await embed_message("error", String(err), interaction);
        }
    }
};

export default command;