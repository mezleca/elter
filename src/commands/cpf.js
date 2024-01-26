import { types } from "../utils/types.js";
import { embed_message } from "../utils/other.js";
import axios from "axios";
import * as dotenv from "dotenv";

dotenv.config({
    path: "../../.env"
});

const command = {
    name: "cpf",
    description: "test",
    options: [
        {
            name: "cpf",
            description: "cpf do cara",
            type: types.STRING,
            required: true
        }
    ],
    async execute(interation) {

        await interation.deferReply();

        try {

            if (!process.env.API_URL) {
                return await interation.editReply("api para busca de cpf nao encontrada, verifique se voce colocou no .env");
            }
            
            const cpf = interation.options.getString("cpf");
            const api_url = process.env.API_URL;
            const response = await axios.get(api_url + cpf, {});

            if (response.status = "success") {
                return await embed_message("...", JSON.stringify(response.data, null, 4), interation);
            }

            await embed_message("...", "cpf nao encontrado", interation);
            
        } catch(err) {
            console.log(err);
            await interation.editReply("ocorreu um erro...");
        }

    }
};

export default command;