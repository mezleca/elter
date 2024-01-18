import axios from 'axios';
import { AttachmentBuilder } from 'discord.js';

function cortar(url, inicio, fim) {
    // TODO
};

export const recognize_song = (url) => {
    // TODO
};

export const embed_message = async (title, description, interaction, type) => {

    // LOL this code sucks

    const embed = {
        title: title,
        color: 0x2F3136
    };

    if (type == "default" || !type || type == true) {
        embed.description = description;
        return await interaction.editReply({ embeds: [embed] });
    }

    if (type == "audio") {
        return await interaction.editReply({files: [description]});
    }

    if (type == "buffer") {
        
        const attachment = new AttachmentBuilder(description, { name: "image.png" });

        embed.image = {
            url: "attachment://image.png"
        };

        return await interaction.editReply({ embeds: [embed], files: [attachment] });
    }
    else {
        embed.image = {
            url: description
        };

        return await interaction.editReply({ embeds: [embed] });
    }
};