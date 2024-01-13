import Openai from "openai";
import path from "path";
import fs from "fs";

export const openai = new Openai();

export const get_prompt = (name) => {

    const prompt_path = path.resolve(path.resolve("src", "utils", "prompts", name));
    if (fs.existsSync(prompt_path)) {
        return fs.readFileSync(prompt_path, "utf-8");
    }

    return "";
};

export const generate_text = async (prompt, message, history) => {
    const history_ = history ? JSON.stringify([...history].reverse()) : "";
    const response = await openai.chat.completions.create({
        model: "gpt-4-1106-preview",
        temperature: 0.85,
        max_tokens: 3200,
        messages: [
            {
                role:"system", content: prompt + history_
            },
            {
                role:"user", content: message
            }
        ]
    });

    return response.choices[0].message.content;
};

export const generate_vision = async (system, question, url, history) => {
  
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      temperature: 0.90,
      max_tokens: 3000,
      messages: [
        {
          role: "system",
          content: [
            { 
              type: "text", text: system         
            }
          ]
        },
        {
          role: "user",
          content: [
            { type: "text", text: question },
            { type: "image_url", image_url: url }
          ],
        }
      ]
    });
  
    return response.choices[0].message.content;
};

export const generate_image = async (prompt) => {
    
    const response = await openai.images.generate({
        prompt: prompt,
        model: "dall-e-3",
        quality: "hd",
        n: 1,
        style: "vivid"
    });

    return response.data[0].url;
};