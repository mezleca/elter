import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";
import { commands } from "../setup.js";
import path from "path";

dotenv.config({ path: path.resolve() + "/.env" });

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

export const initialize = async () => {

    try {

        const filterd_commands = [];
    
        for (let i = 0; i < commands.length; i++) {

            const { execute, ...command } = await commands[i];

            const command_name = command.default.name;
            const command_description = command.default.description;
            const command_options = command.default.options;

            const obj = {
                name: command_name,
                description: command_description,
                options: []
            };

            if (command_options) {
                obj.options.push(...command_options);
            }
            else {
                delete obj.options;
            }

            filterd_commands.push(obj);
        }
    
        await rest.put(Routes.applicationCommands(process.env.DISCORD_ID), { body: filterd_commands });

        return "slash commands registrados";

    } catch(err) {
        console.error(err);
    };
};

initialize().then(console.log);