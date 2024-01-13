const command = {
    
    name: "ping",
    description: "Pong!",
    async execute(interaction) {
        await interaction.reply("Pong!");
    }
};

export default command;