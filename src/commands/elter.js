import { types } from "../utils/types.js";
import { History } from "../utils/models/History.js";
import { generate_text, generate_vision } from "../utils/openai.js";
import { get_prompt } from "../utils/openai.js";

let history = [], history_max_size = 10;

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

        await interaction.reply("...");

        try {
            const elter_prompt = get_prompt("elter.prompt");
            const vision_prompt = get_prompt("vision.prompt");

            const message_content = interaction.options.getString("mensagem");
            const image_content = interaction.options.getAttachment("imagem");

            const date = new Date();

            // pega os ultimos 10 elementos do banco de dados.
            history = await History.find({}, null, { sort: {timestamp: -1} });

            history.unshift({
                timestamp: Date.now(),
                role: "user",
                name: interaction.user.username,
                content: message_content      
            });

            const user_history = new History({
                timestamp: Date.now(),
                date: date.getDate(),
                role: "user",
                name: interaction.user.username,
                content: message_content
            });

            await user_history.save();

            if (history.length > 10) {
                history = history.slice(0, 5);
            };

            // return await interaction.editReply("```" + history + "```");

            let text = "";

            if (!image_content) {
                text = await generate_text(elter_prompt, message_content, history);
            }
            else {
                text = await generate_vision(vision_prompt, message_content, image_content.url, history);
            }

            const new_history = new History({
                timestamp: Date.now(),
                date: date.getDate(),
                role: "system",
                name: "elter",
                content: text
            });

            await new_history.save();

            await interaction.editReply(text);
        } catch(err) {
            //console.log(err);
            await interaction.editReply(err);
        }
    }
};

export default command;