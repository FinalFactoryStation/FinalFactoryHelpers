const {COMANND_SCRIPTS, TOKEN, CLIENT_ID, GUILD_ID} = require("./bot-config.cjs");

const { Client, Events, GatewayIntentBits, SlashCommandBuilder, Collection } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });


const loadCommands = async commands => {
	for (let script of COMANND_SCRIPTS) {
		const {command, handler, buttonIds, buttonHandler } = await import(script);
		if (!!command && !!handler) {
			commands.set(command.name, handler);
		} else {
			console.log(`[WARNING] The command at ${script} is missing a required "command" or "handler" property.`);
		}
		if (!!buttonIds && !!buttonHandler) {
			for (let id of buttonIds) {
				commands.set(id, buttonHandler);
			}
		}
	}
	return commands;
}


client.on(Events.InteractionCreate, async interaction => {
    try {
		const command = interaction.commandName ?? interaction.customId.split(":")[0]
        const execute = interaction.client.commands.get(command);
        if (!execute) {
            console.error(`No command matching ${interaction.commandName} was found.`);
			await interaction.followUp({ content: 'Command missing implementation!', ephemeral: true });
        }
		await execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	} 
});

client.once(Events.ClientReady, async c => {
	c.commands = await loadCommands(new Collection());
	console.log(`Ready! Logged in as ${c.user.tag}`);
});


client.login(TOKEN);