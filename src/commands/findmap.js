import { find_osu_map } from "../utils/osu.js";
import { embed_message } from "../utils/other.js";
import { types } from "../utils/types.js";

const command = {
    name: "findmap",
    description: "encontra um mapa do osu!",
    options: [
        {
            name: "info",
            description: "informacoes sobre a musica como titulo, link do spotify, link do youtube.",
            type: types.STRING
        }
    ],
    async execute(interaction) {

        await interaction.deferReply({ephemeral: false});

        const link = interaction.options.getString("info");

        try {
            const map = await find_osu_map(link);
            await embed_message("osu", map, interaction);
        }
        catch (error) {
            console.log(error);
            await embed_message("osu", "nao achei o mapa ;-;", interaction);
            return;
        }
    }
};

export default command;