import { REST, Routes } from "discord.js";
import * as dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const rest = new REST({version: "10"}).setToken(process.env.DISCORD_TOKEN);

const types = {
    "STRING": 3,
    "INTEGER": 4,
    "BOOLEAN": 5,
    "USER": 6,
    "CHANNEL": 7,
    "ROLE": 8,
    "MENTIONABLE": 9,
    "NUMBER": 10
};

const commands = [
    {
        name: "ping",
        description: "cleide"
    },
    {
        name: "elter",
        description: "comando para falar com o elter",
        options: [
            {
                name: "mensagem",
                type: types.STRING,
                description: "mensagem para o elter",
            }
        ]
    }
];

try {
    console.log("inicio de registro de comandos");

    await rest.put(Routes.applicationCommands(process.env.DISCORD_ID), { body: commands });

    console.log("comandos registrados");
} catch(err) {
    console.error(err);
};