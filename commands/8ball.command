// Help function:
exports.help = (config, command, message) => {
    return "Magic 8 ball \nUsage: \`" + config.prefix + command + " [question]\`";
}
// Command logic:
exports.call = (args, info) => {
    const responses = [
        "It is certain",
        "It is decidedly so",
        "Without a doubt",
        "Yes – definitely",
        "You may rely on it",
        "As I see it",
        "Join cy33kkW",
        "Most Likely",
        "Outlook good",
        "Yes",
        "Signs point to yes",
        "<:desolate:551932632062230529>",
        "actual content of the church in the fool. The worms that is a book of the bath soaps and"
    ];
    const randomIndex = Math.floor (Math.random () * responses.length);
    return (responses [randomIndex]);
}
