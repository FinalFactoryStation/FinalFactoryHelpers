const {COMANND_SCRIPTS, TOKEN, CLIENT_ID, GUILD_ID} = require("./bot-config.cjs");
const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const rest = new REST().setToken(TOKEN);

const commands = COMANND_SCRIPTS.map(script => {
    const {command, handler} = require(script);
    return command ? command.toJSON() : undefined;
}).filter(Boolean);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.error(error);
	}
})();