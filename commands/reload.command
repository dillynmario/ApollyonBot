// Help function:
exports.help = (config, command, message) => {
    return "Make me reload my markov generator, my commands or my entire being. \nUsage: \`" + config.prefix + command + " [markov|commands|core]\`";
}
// Command logic:
exports.call = (args, info) => {
    // If not by staff member, quit out.
    if (!info.core.isByStaffMember (info.message)) {
        return "You are not authorized to do this.";
    }
    var signals = [];
    var reload_string = "";
    info.core.commandBundle (args, {
        // Reload markov chain.
        markov: () => {
            var guild_temp = info.temp.guilds [info.message.guild.id];
            guild_temp.markov_state = undefined;
            guild_temp.markov_object = undefined;
            if (guild_temp.hasOwnProperty ("since_last_markov")) {
                guild_temp.since_last_markov = 0;
                guild_temp.current_chance = info.config.markov_chance;
            }
            reload_string = list (reload_string, "markov data");
        },
        commands: () => {
            if (info.core.isByBotAdmin (info.message)) {
                signals.push ("reload");
                reload_string = list (reload_string, "commands");
            }
        },
        all: () => {
            if (info.core.isByBotAdmin (info.message)) {
                signals = ["reset"];
                reload_string = list (reload_string, "the connection");
            }
        },
        core: function () {
            this.all ();
        },
        default: function () {
            this.commands ();
        }
    });
    if (reload_string !== "") {
        return {
            "msg": "Reloading " + reload_string + ".",
            "signals": signals,
        };
    } else {
        return "You didn't tell me what to reload.";
    }
}
// Constructs the reload_string.
function list (current_list, str) {
    if (current_list == "") {
        current_list = str;
    } else if (current_list.indexOf (" and ") === -1) {
        current_list = str + " and " + current_list;
    } else {
        current_list = str + ", " + current_list;
    }
    return current_list;
}
