const execute = async interaction => {
    await interaction.reply("pong");
}

const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    execute,
    handler: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!')
}