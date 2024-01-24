import * as dotenv from "dotenv";
import mongoose from "mongoose";
import express from "express";

import { cmds_file, commands, client } from "./setup.js";

const app = express();

const user_db = process.env.DB_USER;
const password_db = process.env.DB_PASSWORD;

dotenv.config([
    "../.env"
]);

mongoose.connect(`mongodb+srv://${user_db}:${password_db}@cluster0.1rcvrlu.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log("conectado a db");
});

client.on("ready", () => {
    console.log("bot iniciado");
});

client.on("interactionCreate", async (interaction) => {
    try {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        const cmd_exist = cmds_file.find(cmd => cmd === `${interaction.commandName}.js`);
        const cmds = commands;

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

app.get("/", (req, res) => {
    res.send({ message: "elter" });
});

app.listen(3000, () => {
    console.log("server iniciado");
});