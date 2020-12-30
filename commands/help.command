//Help function:
exports.help = (config, command, message) => {
     return `Commands:\na!hook\na!invite\na!markov\na!say\na!invite\na!fakeword\na!8ball\na!do\na!status\na!nick\na!botinvite\na!crab\na!lobster\na!scromble\nMore info for commands can be found using the following syntax:\n\`${config.prefix}${command} [command name]\`\n\`bot developer: apollyon#2728, privacy policy: a!privacypolicy, source code: a!github\``
}
exports.call = (args, info) => {
    //If the command is called blank, explain it.
    if (args.length === 0) {
        return info.core.getHelpString(info.command, info.message);
    }
    //If the command exists, get its help and check if it had any.
    if (info.core.hasCommand(args[0])) {
        var help_string = info.core.getHelpString(args[0], info.message);
        if (help_string && help_string !== "") {
            return help_string;
        } else {
            return `There is no help available for the \`${args[0]}\` command, oops!`;
        }
    } else {
        return `There is no \`${args[0]}\` command.`;
    }

}
