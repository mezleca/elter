import axios from 'axios';
import { AttachmentBuilder, ButtonComponent, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

function cortar(url, inicio, fim) {
    // TODO
};

export const recognize_song = (url) => {
    // TODO
};

// LOL this code sucks
export const embed_message = async (title, description, interaction, type, thumbnail, button) => {

    const embed = {
        title: title,
        color: 0x2F3136,
        timestamp: new Date().toISOString(),
    };

    if (thumbnail) {
        embed.thumbnail = {
            url: thumbnail,
        }
    }

    if (type == "default" || !type || type == true) {

        embed.description = description;

        if (button) {
            const Button = new ButtonBuilder().setLabel(button.text).setURL(button.url).setStyle(ButtonStyle.Link);
            const row = new ActionRowBuilder().addComponents(Button);
            return await interaction.editReply({ embeds: [embed], components: [row] });
        }

        return await interaction.editReply({ embeds: [embed] });
    }

    if (type == "audio") {
        return await interaction.editReply({files: [description]});
    }

    if (type == "buffer") {
        
        embed.image = {
            url: description
        };

        return await interaction.editReply({ embeds: [embed] });
    }
    else {
        embed.image = {
            url: description
        };

        return await interaction.editReply({ embeds: [embed] });
    }

};