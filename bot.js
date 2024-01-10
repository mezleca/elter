import { Client, GatewayIntentBits } from "discord.js";
import * as dotenv from "dotenv";
import Openai from "openai";
import fs from "node:fs";
import path from "path";
import mongoose from "mongoose";

const openai = new Openai();
dotenv.config();

const user_db = process.env.DB_USER;
const password_db = process.env.DB_PASSWORD;

// console.log(user_db, password_db);

mongoose.connect(`mongodb+srv://${user_db}:${password_db}@cluster0.1rcvrlu.mongodb.net/?retryWrites=true&w=majority`).then(() => {
    console.log("conectado a db");
});

const History = mongoose.model("History", {
    timestamp: Number,
    role: String,
    name: String,
    content: String
});

let history = [], elter_prompt = "", prompt_path = path.resolve("./ai", "elter.prompt"), history_max_size = 8;

if (fs.existsSync(prompt_path)) {
    elter_prompt = fs.readFileSync(prompt_path, "utf-8");
} else {
    elter_prompt = fs.readFileSync(prompt_path, "utf-8");
};

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]});

client.on("ready", () => {
    console.log("bot iniciado");
});

client.on("interactionCreate", async (interaction) => {
    try {

        if (!interaction.isChatInputCommand()) {
            return;
        }

        if (interaction.commandName === "ping") {
            await interaction.reply("pong");
        };
    
        if (interaction.commandName === "elter") {

            const message_content = interaction.options.getString("mensagem");

            if (!history) { 

                history = await History.find({});

                if (history.length > history_max_size) {
                    history = history.slice(history.length - history_max_size, history.length);
                };

            }
            else {
                history.push({
                    timestamp: Date.now(),
                    role: "user",
                    name: interaction.user.username,
                    content: message_content
                });
            }

            await interaction.deferReply({ephemeral: false});
    
            const response = await openai.chat.completions.create({
                model: "gpt-4-1106-preview",
                temperature: 0.85,
                max_tokens: 3200,
                messages: [
                    {
                        role:"system", content: elter_prompt + JSON.stringify([...history].reverse())
                    },
                    {
                        role:"user", content: message_content
                    }
                ]
            });
    
            const text = response.choices[0].message.content;
    
            history.push({
                timestamp: Date.now(),
                role: "system",
                name: "elter",
                content: text
            });

            const new_history = new History({
                timestamp: Date.now(),
                role: "system",
                name: "elter",
                content: text
            });

            await new_history.save();
    
            interaction.editReply(text);
        }
    } catch (err) {
        console.error(err);
    }
});

client.login(process.env.DISCORD_TOKEN);