
module.exports = {
    "COMANND_SCRIPTS": ["./ping-command.cjs", "./blueprint-command.js"],
    "TOKEN": process.env.DISCORD_TOKEN,
    "CLIENT_ID": process.env.DISCORD_CLIENT_ID ?? "1099311743542509610",
    "GUILD_ID": process.env.DISCORD_CLIENT_ID ?? "530867164866150410",
    "CUTTLY_KEY": process.env.CUTTLY_KEY,
    "BLOB_ACCOUNT_NAME": process.env.BLOB_ACCOUNT_NAME ?? "finalfactoryblueprints",
    "BLOB_CONTAINER_NAME": process.env.BLOB_CONTAINER_NAME ?? "prints",
    "BLOB_SAS_TOKEN": process.env.BLOB_SAS_TOKEN
}