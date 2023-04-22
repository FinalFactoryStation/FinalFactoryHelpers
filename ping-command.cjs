const handler = async interaction => {
    await interaction.reply("pong");
}

const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    handler,
    command: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
}