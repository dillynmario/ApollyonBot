// Help function:
exports.help = (config, command, message) => {
    return "Set my status message to some sort of video. \nUsage: \`" + config.prefix + command + " [what my status should be]\`";
}
// Command logic:
exports.call = (args, info) => {
    var str = args.join (" ");
    info.bot.user.setActivity (str, {
        type: "PLAYING"
    });
    return {
        msg: "Your status has been set.",
        memory: {
            activity: {
                type: "PLAYING",
                string: str
            }
        }
    };
}
