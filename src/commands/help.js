import { types } from "../utils/types.js";
import { embed_message } from "../utils/other.js";
import pkg_json from "../../package.json" with { type: "json" };

const commands = {
    help: {
        value: "retorna os comandos ou mostra como funciona caso voce passe o parametro name."
    },
    elter: {
        value: "elter e um chatbot que e usado para conversar/tirar duvidas."
    },
    findmap: {
        value: "encontra mapas do osu utilizando um metodo de busca no yt/spotify para encontrar o nome e retornar o mapa."
    },
    info: {
        value: "retorna informacoes sua ou de um usuario."
    },
    nightcore: {
        value: "retorna a musica que voce enviou em modo nightcore."
    },
    ping: {
        value: "cusado para verificar a latencia do usuario ao servidor."
    },
    play: {
        value: "da play em musicas."
    },
    stop: {
        value: "para a queue de musica atual."
    },
    queue: {
        value: "mostra as musicas que estao na queue."
    },
    skip: {
        value: "pula a musica atual."
    },
    recreate: {
        value: "recria a foto que voce enviou."
    },
    ytdl: {
        value: "baixa musicas do youtube"
    }
}

const command = {
    name: "help",
    description: "yep",
    options: [ 
        {
            name: "name",
            description: "command name",
            type: types.STRING
        },
    ],
    async execute(interaction) {

        await interaction.deferReply();

        const name = interaction.options.getString("name");
        const text = commands[name];

        if (name && !text.value) {
            return await interaction.editReply("comando nao encontrado");
        }

        if (!name) {

            let text = "";

            for (let i = 0; i < Object.keys(commands).length; i++) {

                console.log("command:", Object.keys(commands).at(i));

                text += `- **${Object.keys(commands).at(i)}**\n`
            }

            return await embed_message("commands", text + `\n**bot version**: **${pkg_json.version}**`, interaction);
        }

        return await embed_message("help", text.value, interaction);
    }
};

export default command;