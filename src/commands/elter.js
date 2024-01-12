import { types } from "../utils/types.js";
import { History } from "../utils/models/History.js";
import { openai } from "../utils/openai.js";
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

        const elter_prompt = get_prompt();
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
    
            const response = await openai.chat.completions.create({
                model: "gpt-4-1106-preview",
                temperature: 0.85,
                max_tokens: 3200,
                messages: [
                    {
                        role:"system", content: elter_prompt + JSON.stringify([...history].reverse())
                    },
                    {
                        role:"user", content: message_content
                    }
                ]
            });
    
            const text = response.choices[0].message.content;
    
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
    
            interaction.editReply(text);
    }
};

export default command;