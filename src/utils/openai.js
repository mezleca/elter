import Openai from "openai";
import path from "path";
import fs from "fs";

export const openai = new Openai();
const prompt_path = path.resolve(path.resolve("src", "utils", "prompts", "elter.prompt"));

export const get_prompt = () => {

    if (fs.existsSync(prompt_path)) {
        return fs.readFileSync(prompt_path, "utf-8");
    }

    return "";
};
