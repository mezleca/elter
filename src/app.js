import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import { cmds_file, commands } from "./setup.js";

dotenv.config([
    "../.env"
]);

const user_db = process.env.DB_USER;
const password_db = process.env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${user_db}:${password_db}@cluster0.1rcvrlu.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log("conectado a db");
    /* initialize(); */
});

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates]});

client.on("ready", () => {
    console.log("bot iniciado");
});

client.on("interactionCreate", async (interaction) => {
    try {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const cmd_exist = cmds_file.find(cmd => cmd === `${interaction.commandName}.js`);
        const cmds = await commands;

        if (process.env.ROLE_ID) {    
            if (!interaction.member.roles.cache.has(process.env.ROLE_ID)) {
                return await interaction.reply({content: "voce nao tem permissao para usar esse comando. manda o rel te dar o cargo ai pra tu poder usar", ephemeral: true});
            }
        }

        if (cmd_exist) {

            const module = cmds[cmds_file.indexOf(cmd_exist)];
            const { default: cmd } = await module;

            await cmd.execute(interaction);
        }

    } catch (err) {
        console.log(err);
    }
});

client.login(process.env.DISCORD_TOKEN);