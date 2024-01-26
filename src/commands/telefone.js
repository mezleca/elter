import { types } from "../utils/types.js";
import { embed_message } from "../utils/other.js";
import axios from "axios";

const command = {
    name: "telefone",
    description: "test",
    options: [
        {
            name: "num",
            description: "tel do cara",
            type: types.STRING,
            required: true
        }
    ],
    async execute(interation) {

        await interation.deferReply();

        // TODO

    }
};

export default command;