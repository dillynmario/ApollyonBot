//Help function:
exports.help = (config, command, message) => {
    return `Example help function. \
					\nUsage: \`${config.prefix}${command}\``;
}
//Command logic:
exports.call = (args, info) => {
    return {
        "log": "New command called.",
        "msg": "No response set."
    };
}
