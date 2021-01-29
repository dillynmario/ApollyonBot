// Help function:
exports.help = (config, command, message) => {
    return "The privacy policy. \nUsage: \`" + config.prefix + command + "\`";
}

// Command logic:
exports.call = (args, info) => {
    return "All data this bot can see is logged for the markov chain algorithm. If you do not want any data collected, the only way is for it to leave the server and it will be cleared after 2 days automatically. If you want the data reset, ask apollyon#2728."
}
