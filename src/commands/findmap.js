import { find_osu_map } from "../utils/osu.js";
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
            await interaction.editReply(map)
        }
        catch (error) {
            console.log(error);
            await interaction.editReply("nao foi possivel encontrar o mapa :c");
            return;
        }
    }
};

export default command;