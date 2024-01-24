import { types } from "../utils/types.js";
import { client } from "../setup.js";
import { ChatInputCommandInteraction } from "discord.js";
import { embed_message } from "../utils/other.js";

const command = {
    name: "info",
    description: "pega as informacoes do usuario",
    options: [
        {
            name: "username",
            description: "nome do usuario",
            type: types.STRING,
            required: false
        }
    ],
    /** @param {ChatInputCommandInteraction} interaction  */
    async execute(interaction) {

        await interaction.deferReply();

        const user = interaction.options.getString("username");
        const test = client.users.fetch("753246726609043490");

        if (!user) {

            const piroca = await client.users.fetch(interaction.user.id);
            const date = new Date(piroca.createdTimestamp);

            return await embed_message(interaction.user.displayName, `Conta: ${piroca.username}\nCriado em: ${date.toLocaleDateString("pt-br")} as ${date.toLocaleTimeString("pt-br")}`, interaction, null, piroca.avatarURL(), { text: "foto do arrombado", url: piroca.avatarURL()});
        }
        
        await interaction.editReply(JSON.stringify(test));
    }
};

export default command;