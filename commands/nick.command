// Help function:
exports.help = (config, command, message) => {
    return "Set my nickname. \nUsage: \`" + config.prefix + command + " [new nickname]\`";
}
// Command logic:
exports.call = (args, info) => {
    // If not by staff member, quit out. I am not sure if this works.
    if (!info.core.isByStaffMember (info.message)) {
        return "You are not authorized to do this.";
    }
    // No response in DMs.
    if (!info.message.guild) {
        return "oof owie: you are a fucking idiot, i can't set nicknames in pm";
    } else {
        var new_name = args.join (" ");
        info.message.guild.me.setNickname (new_name)
            .then (() => {
                info.message.channel.send ("Set my nick to \`" + new_name + "\`.");
            })
            .catch (err => {
                info.message.channel.send ("Something went wrong while changing my nick.");
                info.core.log ("Error while setting nickname: " + err, "error");
            });
    }
}
