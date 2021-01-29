// Help function:
exports.help = (config, command, message) => {
    return "Make me disconnect from Discord. \nUsage: \`" + config.prefix + command + "\`";
}
// Command logic:
exports.call = (args, info) => {
    if (info.core.isByBotAdmin (info.message)) {
        return {
            "signals": ["quit"],
            "msg": "Aight, bye."
        };
    } else {
        return "Nice try, dickhead.";
    }
    return {
        "log": "New command called.",
        "msg": "No response set."
    };
}
