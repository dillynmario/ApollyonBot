//Help function:
exports.help = (config, command, message) => {
    return `The privacy policy. \
					\nUsage: \`${config.prefix}${command} [something]\``;
}

//Command logic:
exports.call = (args, info) => {
    return "https://github.com/Apollyon094/ApollyonBot"
}
