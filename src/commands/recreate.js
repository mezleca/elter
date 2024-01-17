import { types } from "../utils/types.js";
import { generate_text, generate_image, get_prompt, generate_vision } from "../utils/openai.js";
import { History } from "../utils/models/History.js";

const command = {

    name: 'recreate',
    description: "utilize esse comando para recriar imagens",
    options: [
        {
            name: "prompt",
            description: "prompt para gerar a imagem",
            type: types.STRING,
            required: true
        },
        {
            name: "imagem",
            type: types.ATTACHMENT,
            description: "imagem para anexar",
            required: true
        }
    ],
    async execute(interaction) {

        await interaction.deferReply({ephemeral: false});

        try {
            const image_content = interaction.options.getAttachment("imagem");
            const prompt_enhancer   = get_prompt("recreate.prompt");
    
            const message = interaction.options.getString("prompt");
            const enhanced_prompt = await generate_vision(prompt_enhancer, message, image_content.url, []);
    
            const image = await generate_image(enhanced_prompt);
            await interaction.editReply(`prompt: ${enhanced_prompt}\n${image}`);
        } catch(err) {
            await interaction.editReply("Erro ao gerar imagem:", err);
        }
    }
};

export default command;