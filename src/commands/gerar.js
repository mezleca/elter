import { types } from "../utils/types.js";
import { openai, generate_text, generate_image, get_prompt } from "../utils/openai.js";
import fs from "fs";

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

        await interaction.deferReply({ephemeral: false});

        const prompt_text = interaction.options.getString("prompt"),
        prompt_enhancer   = get_prompt("enhancer.prompt");

        const enhanced_prompt = await generate_text(prompt_enhancer, prompt_text);

        console.log(enhanced_prompt);

        const image = await generate_image(enhanced_prompt);

        await interaction.editReply(image);
    }
};

export default command;