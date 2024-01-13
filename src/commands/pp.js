import { types } from "../utils/types.js"
import { get_map_pp } from "../utils/osu.js";

const command = {
    name: "pp",
    description: "Isso ai",
    options: [
        {
            name: "id",
            description: "id do mapa",
            type: types.STRING,
            required: true
        },
        {
            name: "mods",
            description: "mods",
            type: types.STRING,
            required: false
        }
    ],
    async execute(interaction) {
        const id = interaction.options.getString("id");
        const mods = interaction.options.getString("mods");

        await interaction.deferReply();

        const pp = await get_map_pp(id, mods);

        await interaction.reply(pp);
    }
};

export default command;