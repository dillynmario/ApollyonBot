//Help function:
exports.help = (config, command, message) => {
    return `Make me say something. \
					\nUsage: \`${config.prefix}${command} [something]\``;
}
//Command logic:
exports.call = (args, info) => {
    return args.join(" ")
        .replace('@everyone', 'everyone')
        .replace('@here', 'here');
}
