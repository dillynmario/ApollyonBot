//Help function:
exports.help = (config, command, message, core) => {
    return `Returns an invite for the bot. \
					\nUsage: \`${config.prefix}${command}\``;
}
//Command logic:
exports.call = (args, info) => {
    info.bot.generateInvite(["ADD_REACTIONS", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "USE_EXTERNAL_EMOJIS", "CHANGE_NICKNAME", "MANAGE_ROLES"])
        .then(link => {
            info.message.channel.send(`You can invite me to your server using this link:\n<${link}>`);
        })
        .catch(err => {
            info.core.log(`Failed to generate invite. Error: ${err}`, "error");
            info.message.channel.send("Failed to generate invite. Oops!");
        });
}
