import { types } from "../utils/types.js";
import { History } from "../utils/models/History.js";
import { generate_text } from "../utils/openai.js";
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
        }
    ],
    async execute(interaction) {

        const elter_prompt = get_prompt("elter.prompt");
        const message_content = interaction.options.getString("mensagem");

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

            const text = await generate_text(elter_prompt, message_content, history);

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