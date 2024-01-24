import fs from "node:fs";
import * as dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";

let cmds = [];

dotenv.config([
    "../.env"
]);

export const cmds_file = fs.readdirSync("./src/commands/").filter(file => file.endsWith(".js"));

for (let i = 0; i < cmds_file.length; i++) {
    console.log(`importando ${cmds_file[i]}`);
    cmds.push(import(`./commands/${cmds_file[i]}`));
};

export const commands = cmds;
export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessageReactions] });

client.login(process.env.DISCORD_TOKEN);