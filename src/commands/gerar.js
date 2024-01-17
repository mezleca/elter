import { types } from "../utils/types.js";
import { generate_text, generate_image, get_prompt } from "../utils/openai.js";
import { History } from "../utils/models/History.js";

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
    
            const enhanced_prompt = await generate_text(prompt_enhancer, prompt_text, history);
    
            history.push({
                timestamp: Date.now(),
                role: "user",
                name: interaction.user.username,
                content: prompt_text
            });
    
            const new_history = new History({
                timestamp: Date.now(),
                role: "user",
                name: interaction.user.username,
                content: prompt_text
            });
    
            await new_history.save();
    
            const image = await generate_image(enhanced_prompt);
    
            await interaction.editReply(`prompt: ${enhanced_prompt}\n${image}`);
        } catch(err) {
            await interaction.editReply("Erro ao gerar imagem:", err);
        }
    }
};

export default command;