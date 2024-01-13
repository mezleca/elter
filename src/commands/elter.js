import { types } from "../utils/types.js";
import { History } from "../utils/models/History.js";
import { generate_text, generate_vision } from "../utils/openai.js";
import { get_prompt } from "../utils/openai.js";

const history = [], history_max_size = 10;

const command = {

    name: "elter",
    description: "comando para falar com o elter",
    options: [
        {
            name: "mensagem",
            type: types.STRING,
            description: "mensagem para o elter",
            required: true
        },
        {
            name: "imagem",
            type: types.ATTACHMENT,
            description: "imagem para anexar",
            required: false
        }
    ],
    async execute(interaction) {

        const elter_prompt = get_prompt("elter.prompt");
        const vision_prompt = get_prompt("vision.prompt");

        const message_content = interaction.options.getString("mensagem");
        const image_content = interaction.options.getAttachment("imagem");

        if (!history) { 

            history = await History.find({});

            if (history.length > history_max_size) {
                history = history.slice(history.length - history_max_size, history.length);
            };

        }
        else {
            history.push({
                timestamp: Date.now(),
                role: "user",
                name: interaction.user.username,
                content: message_content
            });
        }

        await interaction.deferReply({ephemeral: false});

        let text = "";

        if (!image_content) {
            text = await generate_text(elter_prompt, message_content, history);
        }
        else {
            text = await generate_vision(vision_prompt, message_content, image_content.url, history);
        }

        history.push({
            timestamp: Date.now(),
            role: "system",
            name: "elter",
            content: text
        });

        const new_history = new History({
            timestamp: Date.now(),
            role: "system",
            name: "elter",
            content: text
        });

        await new_history.save();
        await interaction.editReply(text);
    }
};

export default command;