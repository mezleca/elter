import axios from 'axios';
import fs from 'fs';
import ytdl from 'ytdl-core';
import ffmpeg from 'fluent-ffmpeg';

function cortar(url, inicio, fim) {
    // TODO
};

export const recognize_song = (url) => {
    // TODO
};

export const embed_message = async (title, description, interaction, image) => {

    const embed = {
        title: title,
        color: 0x2F3136
    };

    if (!image) {
        embed.description = description;
    } else {
        embed.image = {
            url: description
        };
    };

    await interaction.editReply({embeds: [embed]});  
};