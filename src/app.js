import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import fs from "node:fs";

const cmds_file = fs.readdirSync("./src/commands").filter(file => file.endsWith(".js"));
let cmds = [];

dotenv.config([
    "../.env"
]);

const user_db = process.env.DB_USER;
const password_db = process.env.DB_PASSWORD;

mongoose.connect(`mongodb+srv://${user_db}:${password_db}@cluster0.1rcvrlu.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log("conectado a db");
});

export const History = mongoose.model("History", {
    timestamp: Number,
    role: String,
    name: String,
    content: String
});

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});

client.on("ready", () => {

    for (let i = 0; i < cmds_file.length; i++) {
        cmds.push(import(`./commands/${cmds_file[i]}`));
    }

    console.log("bot iniciado");
});

client.on("interactionCreate", async (interaction) => {
    try {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const cmd_exist = cmds_file.find(cmd => cmd === `${interaction.commandName}.js`);

        if (cmd_exist) {

            const module = cmds[cmds_file.indexOf(cmd_exist)];
            const { default: cmd } = await module;

            await cmd.execute(interaction);
        }

    } catch (err) {
        console.error(err);
    }
});

client.login(process.env.DISCORD_TOKEN);