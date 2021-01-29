// Help function:
exports.help = (config, command, message) => {
    return "Send the invite of another bot. If you want my invite do a!botinvite at me or a!invite\nUsage: \` " + config.prefix + command + "\`";
}
// Command logic:
exports.call = (args, info) => {
    function isEmpty (a) {
        return "" === a || 0 === a || null === a || void 0 === a ? !1 : !0;
    }
    if(!isEmpty (args)) {
        var send1 = "https://discordapp.com/oauth2/authorize?client_id=" + args.toString ().replace (/[\\<>@#&!]/g, "") + "&scope=bot";
        return send1
    }
}
