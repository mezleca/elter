import { types } from "../utils/types.js";
import { openai } from "../utils/openai.js";

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

        const prompt = interaction.options.getString("prompt");
        const response = await openai.images.generate({
            prompt: prompt,
            model: "dall-e-3",
            quality: "hd",
            n: 1,
            style: "vivid"
        });

        const image = response.data[0].url;

        await interaction.editReply(image);
    }
};

export default command;