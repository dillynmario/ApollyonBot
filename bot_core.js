// ApollyonBot is a project of leod and extended by apollyon094.
// grublus
const fs = require ('fs-extra');
const path = require (`path`);
const Discord = require ('discord.js');
const cleanup = require ('node-cleanup');
const merge = require ('deepmerge');
const randRange = require ('random-floating');
const events = require ('events');
const toHumanTime = require ('human-readable-time');
const longTimeout = require ('long-timeout');
const hc = require ('long-timeout');
const cheerio = require ("cheerio");
const request = require ("request");
// Setup data.
var config = JSON.parse (fs.readFileSync ('./config/config.json', 'utf8'));
var token = config.token;
delete config.token;
var bot = undefined;
var core = undefined;
var last_log_type = undefined;
var save_interval = undefined;
var blocking_input = true;
// Initial memory.
var commands = {};
var memory = {
    "users": {},
    "channels": {},
    "guilds": {},
    "activity": {
        "string": "",
        "type": "PLAYING",
    },
    "timeouts": {},
};
var temp = {};
// Initializes the entire bot.
function init () {
    //If you do this, you will be sent to the dock of shame.
    log ("APOLLYONBOT IS LICENSED UNDER GPL-3, ALL PUBLIC MODIFIED VERSIONS MUST BE OPEN SOURCED");
    log ("Booting...", "boot");
    // Create bot client.
    bot = new Discord.Client ();
    hookUpBot ();
    // Initialize temp memory.
    temp = {
        "users": {},
        "channels": {},
        "guilds": {},
        "timeouts": {},
    };
    // Create directories if they do not exist. If these don't exist, shit.
    if (!fs.existsSync (config.command_dir)) {
        fs.mkdirSync (config.command_dir);
    }
    if (!fs.existsSync (config.guilds_dir)) {
        fs.mkdirSync (config.guilds_dir);
    }
    if (!fs.existsSync (config.global_dir)) {
        fs.mkdirSync (config.global_dir);
    }
    // Load up all commands using my very own sexy command.
    reloadCommands ();
    // Load memory.
    loadMemorySync ();
    // Set up new secure core to pass to functions.
    core = new events.EventEmitter ();
    core.basePath = __dirname + "/";
    core.log = log;
    core.callCommand = callCommand;
    core.callFuncAsCommand = callFuncAsCommand;
    core.hasCommand = hasCommand;
    core.getHelpString = getHelpString;
    core.feedMarkov = feedMarkov;
    core.makeEmbed = makeEmbed;
    core.makeGuildDir = makeGuildDir;
    core.deleteGuildData = deleteGuildData;
    core.isByBotAdmin = isByBotAdmin;
    core.isByStaffMember = isByStaffMember;
    core.getCurrentName = getCurrentName;
    core.getNewID = getNewID;
    core.msToInterval = msToInterval;
    core.setPersistentTimeout = setPersistentTimeout;
    core.clearPersistentTimeout = clearPersistentTimeout;
    core.setHook = setHook;
    core.clearHook = clearHook;
    core.commandSwitch = commandSwitch;
    core.commandBundle = commandBundle;
    // Log in!
    bot.login (process.env.TOKEN);
    // Save memory to disc at an interval.
    save_interval = setInterval (commitMemory, config.save_interval);
}
// Cleans up the bot and logs out.
function exit () {
    log ("Cleaning up...", "shutdown");
    // Do not take any input any more, so as to not interfere with shutting down.
    blocking_input = true;
    // Clear the save interval.
    clearInterval (save_interval);
    // Kill old event handler.
    core = undefined;
    // Save memory to disc.
    commitMemorySync ();
    // Destroy bot client and log out!
    bot.destroy ();
    log ("Done cleaning up.", "shutdown");
}
// Latches our necessary behavior functions onto the bot's events.
function hookUpBot () {
    bot.on ("ready", () => {
        // Create data directory for every guild the bot is a part of.
        bot.guilds.array () . forEach (guild => {
            makeGuildDir (guild);
            initializeGuildMemory (guild);
        });
        // Create channel memory for every channel the bot is a part of.
        bot.channels.array () . forEach (channel => {
            initializeChannelMemory (channel);
        });
        // Load up hooks.
        reviveAllHooks ();
        // Set status to online.
        bot.user.setStatus ("online");
        // Restore "playing" state from memory.
        bot.user.setActivity (memory.activity.string, {
            type: memory.activity.type
        });
        // Load all persistent timeouts. Needs to be on ready, because it may want to send messages immediately.
        reviveAllPersistentTimeouts ();
        // Start allowing input now that the bot is fully ready.
        blocking_input = false;
        log ("Bot has started. Tag: " + bot.user.tag + ". Guilds: " + bot.guilds.size, "boot");
    });
    // When a guild is joined.
    bot.on ("guildCreate", guild => {
        // Create guild_data directory.
        makeGuildDir (guild);
        initializeGuildMemory (guild);
        // If there's a guild memory deletion queued up, cancel it.
        var guild_mem = memory.guilds [guild.id];
        if (guild_mem.hasOwnProperty ("queued_deletion")) {
            clearPersistentTimeout (guild_mem.queued_deletion);
            delete guild_mem.queued_deletion;
        }
        log ("Joined guild " + guild.name + " (id: " + guild.id + ") with " + guild.memberCount + " users.", "guild action");
    });
    // When a guild is left, or during an outage, queue a timer to delete its data.
    bot.on ("guildDelete", guild => {
        // When leaving a guild, set a persistent timer to delete it and its channels' data.
        memory.guilds [guild.id] . queued_deletion = setPersistentTimeout({
            "name": "deleteGuildData",
            "args": guild.id,
            "type": "core"
        }, config.guild_data_timeout_hours * 3600000);
        log ("Removed from guild " + guild.name + " (id: " + guild.id + "). Data will be deleted in " + config.guild_data_timeout_hours + " hours, unless the guild is rejoined.", "guild action");
    });
    toleave = client.get_server("890354908371484692")
await client.leave_server(toleave)
     });
    bot.on("channelCreate", channel => {
        if (channel.guild) {
            // Create channel memory.
            initializeChannelMemory (channel);
            log ("Entered channel " + channel.name + " (id: " + channel.id + ").", "guild action");
        }
    });
    bot.on ("channelDelete", channel => {
        const guild_subtext = channel.hasOwnProperty ("guild") ? " in guild " + channel.guild.name + " (id: " + channel.guild.id + ")" : "";
        log ("Removed from channel " + channel.name + " (id: " + channel.id + ")" + guild_subtext + ".", "guild action");
    });
    // Command handler.
    bot.on ("message", async message => {
        // If input is turned off, let's not confuse ourselves.
        if (blocking_input) {
            return;
        }
        // Ignore self.
        if (message.author.id === bot.user.id) {
            return;
        }
        // Create local config to use for the command that is affected by guild config overrides.
        var guild_config = getGuildConfig (message.guild);
        // Ignore other bots, if set to do so in the config.
        if (message.author.bot && guild_config.ignore_bots) {
            return;
        }
        // If the message went through, attempt to create temp memory for this guild.
        var guild_id = undefined;
        if (message.guild) {
            guild_id = message.guild.id;
            if (message.guild !== null && !temp.guilds.hasOwnProperty (guild_id)) {
                temp.guilds [guild_id] = {};
            }
        }
        // If the message did not use the bots' prefix, check for hooks.
        if (message.content.indexOf (guild_config.prefix) !== 0) {
            // If it is in a public text channel, scan the message for hooks or randomly markov.
            if (message.guild) {
                // Run any hooks the message might match.
                var matched_hooks = undefined;
                if (guild_config.allow_hooks) {
                    matched_hooks = matchHooks (message);
                }
                // If none were met, do random markov if that is enabled.
                if (!matched_hooks && guild_config.random_markov) {
                    // If it has no markov frequency temp mem right now, create it.
                    var guild_temp = temp.guilds [guild_id]
                    if (guild_temp.since_last_markov === undefined) {
                        guild_temp.since_last_markov = 0;
                        guild_temp.current_chance = guild_config.markov_chance;
                    }
                    // Only markov after a certain amount of messages, so as to not spam TOO much.
                    if (guild_temp.since_last_markov < guild_config.markov_min_messages) {
                        guild_temp.since_last_markov++;
                        // Try and fall into the random range.
                    } else if (randRange ({
                            "min": 1,
                            "max": guild_config.markov_chance,
                            "fixed": 2
                        }) <= guild_temp.current_chance) {
                        guild_temp.since_last_markov = 0;
                        guild_temp.current_chance = guild_config.markov_chance;
                        callCommand ('markov', makeArrayOfWords(message.content), message);
                    } else {
                        guild_temp.current_chance += guild_config.markov_chance_increase;
                    }
                }
                // After all is said and done, since the message was not a command, store it in the markov data (if not by a bot).
                feedMarkov (message.guild, message.content);
            }
        }
        // Else, try running the command given.
        else {
            // Cut the message contents up into a command and arguments by whitespace.
            const args = makeArrayOfWords (message.content, guild_config.prefix.length);
            const command = args.shift () . toLowerCase ();
            // This is where the magic happens
            callCommand (command, args, message);
        }
    });
    toleave = client.get_server("id")
await client.leave_server(toleave)
    });
}
// Calls a command of the given name with the given arguments (array), operating using the given message object.
function callCommand (command, args, message, is_hook) {
    // Start showing the typing indicator.
    message.channel.startTyping ();
    if (!commands.hasOwnProperty (command)) {
        // If the command does not exist, return false.
        return false;
    } else {
        // If it does exist, run it.
        var guild_config = getGuildConfig (message.guild);
        var args_string = args.join (" ");
        try {
            var response = commands [command] . call (args, {
                "memory": memory,
                "temp": temp,
                "message": message,
                "bot": bot,
                "config": guild_config,
                "core": core,
                "command": command,
                "hook": is_hook
            });
            handleCommandResponse(response, message);
        } catch (err) {
            handleCommandResponse ({
                "msg": "oof owie \`" + command + " " + args_string + " " + err.stack + "\` threw an error. \ntell apollyon he fucked something up",
                "log": "oof owie command \`" + command + " " + args.join (" ") + "\` threw an error:\n\n" + err.stack
            }, message);
        }
    }
    // Stop typing once the command is through.
    message.channel.stopTyping ();
}
// Runs a function and handles its return value like any command.
function callFuncAsCommand (fnc, args, message) {
    // Passes the same arguments as it would to a command.
    var guild_config = getGuildConfig (message.guild);
    var response = fnc (args, {
        "memory": memory,
        "temp": temp,
        "message": message,
        "bot": bot,
        "config": guild_config,
        "core": core
    });
    handleCommandResponse (response, message);
}
// Makes the bot react to the response object passed in.
function handleCommandResponse (response, message) {
    // If the response was not an object, post the return instead.
    if (response instanceof Object !== true) {
        response = {
            "msg": response
        };
    }
    // Print log.
    if (response.log) {
        log (response.log, "response");
    }
    // Post message.
    if (response.msg || response.msgOptions) {
        response.msg = response.msg || "";
        response.msgOptions = response.msgOptions || undefined;
        // DM
        if (message.channel.type != "text" || response.private === true) {
            // Shitty fix but it works
            message.author.send (response.msg.substring (0, 2000), response.msgOptions);
        } else {
            message.channel.send (response.msg.substring (0, 2000), response.msgOptions);
        }
    }
    // Add to memory.
    if (response.memory) {
        // If not valid object.
        if (!response.memory instanceof Object) {
            log ("Memory return of command " + command + " is not an object; can not be committed.", "response");
        }
        // If the memory is a valid object, copy all keys into the global memory object.
        else {
            memory = merge (memory, response.memory);
        }
    }
    // Parse core signals.
    if (response.signals) {
        if (!response.signals instanceof Array) {
            // ???????????
            response.signals = [response.signals];
        }
        response.signals.forEach (signal => {
            handleSignal (signal);
        });
    }
}
// Get all available commands by reading each from its own file.
function reloadCommands () {
    commands = {};
    var com_files = fs.readdirSync (config.command_dir);
    // Hack to always reload the reload command first.
    if (com_files.indexOf ("reload.command") !== -1) {
        reloadCommand ("reload.command");
        com_files.splice (com_files.indexOf ("reload.command"), 1);
    }
    // Reload the rest of the commands.
    com_files.forEach (reloadCommand);
}
// Reloads the command at the given path.
function reloadCommand (path) {
    const command_name = path.replace (/\..+$/, '') . toLowerCase ();
    // Delete module from cache (if it existed), then re-require it.
    delete require.cache [require.resolve (config.command_dir + path)];
    const command_file = require (config.command_dir + path)
    // See if we can actually call this module.
    if ('call' in command_file && typeof command_file.call === 'function') {
        commands [command_name] = command_file;
        log ("Added command " + path + " as " + command_name + ".", "commands");
    } else {
        log ("Could not add command " + path + ", no exported call function.", "commands");
    }
}
// Returns the help string associated with a given command file.
// If the command isn't found or has no help string, returns undefined.
function getHelpString (command, message) {
    var cur_command = commands [command];
    // If the help property exists and is a string, return it.
    if (cur_command && cur_command.hasOwnProperty ("help") && typeof (cur_command.help) === 'function') {
        return cur_command.help (getGuildConfig (message.guild), command, message);
    } else {
        return;
    }
}
// Handles core signals returned by functions.
function handleSignal (signal) {
    switch (signal) {
        case "reset":
            blocking_input = true;
            // This following line of code makes me want to die. I hate it.
            require ("child_process").spawn (process.argv.shift (), process.argv, {
                cwd: process.cwd (),
                detached: true,
                stdio: "inherit"
            });
            process.exit ();
            break;
        case "reload":
            reloadCommands ();
            break;
        case "quit":
            blocking_input = true;
            setTimeout (() => {
                process.exit ();
            }, 1500);
            break;
    }
}
// Loads memory from disc into the global 'memory' object. No async version as this only happens on boot.
function loadMemorySync () {
    try {
        // Check if memory file exists.
        fs.accessSync (config.global_dir + config.memory_file, fs.constants.R_OK | fs.constants.W_OK);
        // If a memory file exists, read it.
        Object.assign (memory, JSON.parse (fs.readFileSync (config.global_dir + config.memory_file, 'utf8')));
    } catch (err) {
        // If no memory file exists yet, create one.
        log ("Memory file \`" + config.global_dir + config.memory_file + "\` could not be found or accessed (error: " + err + "). Will create fresh.", "memory")
        commitMemorySync ();
    }
}
// Saves 'memory' object to disc asynchronously.
function commitMemory () {
    fs.writeFileSync (config.global_dir + config.memory_file, JSON.stringify (memory), err => {
        if (err) {
            log ("Memory could not be saved. Error: " + err, "memory");
        } else {
            log ("Saved memory to " + config.global_dir + config.memory_file + ".", "memory");
        }
    });
}
// Saves 'memory' object to disc, blocking. Used during cleanup on program exit.
function commitMemorySync () {
    fs.writeFileSync (config.global_dir + config.memory_file, JSON.stringify (memory));
    log ("Saved memory to " + config.global_dir + config.memory_file + ".", "memory");
}
// Creates a data directory for the given guild ID.
function makeGuildDir (guild) {
    var data_path = config.guilds_dir + guild.id + "/";
    if (!fs.existsSync (data_path)) {
        fs.mkdirSync (data_path);
    }
}
// Deletes all data related to the given guild.
function deleteGuildData (guild_id) {
    // Delete guild_data directory.
    const data_path = config.guilds_dir + guild_id + "/";
    if (fs.existsSync (data_path)) {
        fs.removeSync (data_path);
    }
    // Delete guild memories.
    if (memory.guilds.hasOwnProperty (guild_id)) {
        delete memory.guilds [guild_id];
    }
    if (temp.guilds.hasOwnProperty (guild_id)) {
        delete temp.guilds [guild_id];
    }
    log ("Deleted guild data for guild ID " + guild_id + ".", "guild data");
}
// Initializes the given guilds' memory if needed.
function initializeGuildMemory (guild) {
    if (!memory.guilds.hasOwnProperty (guild.id)) {
        memory.guilds [guild.id] = {};
    }
    if (!temp.guilds.hasOwnProperty (guild.id)) {
        temp.guilds [guild.id] = {};
    }
}
// Initializes the given channels' memory if needed.
function initializeChannelMemory (channel) {
    if (!memory.channels.hasOwnProperty (channel.id)) {
        memory.channels [channel.id] = {};
    }
    if (!temp.channels.hasOwnProperty (channel.id)) {
        temp.channels [channel.id] = {};
    }
}
// Creates a new object that contains the guilds' config overrides.
function getGuildConfig (guild) {
    // If we are not in a guild or if the guild has no overrides, return the global config.
    if (!guild) {
        return config;
    }
    if (!memory.guilds [guild.id].hasOwnProperty ("config_override")) {
        return config;
    }
    // If overrides exist, apply them to our new dummy object.
    var guild_config = Object.assign ({}, config);
    Object.assign (guild_config, memory.guilds [guild.id].config_override);
    return guild_config;
}
// Get currently visible name of the given user object.
function getCurrentName (user, guild) {
    var nick = guild.members.get (user.id).nickname;
    return nick ? nick : user.username;
}
// Log the given string to the console, prepending timestamp as well as inserting separators.
// If the type parameter is different from the last time log was called (unless undefined), a separator is inserted.
function log (string, type) {
    if (last_log_type !== type && type !== undefined) {
        // Print separator if this is a new type of log.
        const COLUMNS = process.stdout.columns;
        const header = type.toUpperCase ();
        const halfSeparator = "-".repeat (((process.stdout.columns) - (2 + header.length)) / 2);
        console.log ("\n" + halfSeparator + " " + header + " " + halfSeparator);
        // Remember type of log.
        last_log_type = type;
    }
    console.log ("[" + timestamp (new Date ()) + "] " + string);
}
// Returns the given date object in human time.
function timestamp (date) {
    return toHumanTime (date, '%DD%.%MM%.%YY% %hh%:%mm%:%ss%');
}

function setPersistentTimeout (func_descriptor, in_ms) {
    // Generate a unique timer key for this timeout.
    var time_key = getNewID (memory.timeouts);
    // If message exists, sanitize it for JSON.
    if (func_descriptor.hasOwnProperty ("message")) {
        func_descriptor.message = {
            "channel": func_descriptor.message.channel.id,
            "message": func_descriptor.message.id,
        };
    }
    memory.timeouts [time_key] = {
        "func_descriptor": func_descriptor,
        // Stroustrup's coding style pales in comparison to whatever this style here is!
        "time": new Date () . getTime () + in_ms
    };
    // After storing the persistent timeout, revive it immediately to execute on it in this session.
    revivePersistentTimeout (time_key);
    return time_key;
}
// Deletes the given timeout.
function clearPersistentTimeout (time_key) {
    // Clear this session's revived temp timeout.
    if (temp.timeouts.hasOwnProperty (time_key)) {
        longTimeout.clearTimeout (temp.timeouts [time_key]);
        delete temp.timeouts [time_key];
    }
    // Clear persistent memory of the timeout.
    if (memory.timeouts.hasOwnProperty (time_key)) {
        delete memory.timeouts [time_key];
    }
}
// "Revives" the timeout with the given ID.
function revivePersistentTimeout (time_key) {
    if (!memory.timeouts.hasOwnProperty (time_key)) {
        return;
    }
    var func_descriptor = memory.timeouts [time_key].func_descriptor;
    func_descriptor.type = func_descriptor.type || "command";
    // Use the data differently depending on the type.
    var func_to_call = () => {
        // Different callback depending on "func_descriptor.type".
        var possible_types = {
            // If type is core, call it as a function on core.
            core: () => {
                if (core.hasOwnProperty (func_descriptor.name) && typeof (core [func_descriptor.name]) === "function") {
                    // It works. Ask no more.
                    core [func_descriptor.name] (func_descriptor.args);
                } else {
                    log ("Core function " + func_descriptor.name + " does not exist, timeout " + time_key + " failed.", "timers")
                }
            },
            // If type is undefined or "command", call it as a bot command. func_descriptor.message NEEDS to exist here, as the bot will use it to decide where to post.
            command: () => {
                if (!bot.channels.get (func_descriptor.message.channel)) {
                    return;
                }
                if (commands.hasOwnProperty (func_descriptor.name)) {
                    // If the descriptor has a message attached, convert it back from the ID pair to a message object.
                    bot.channels.get (func_descriptor.message.channel) . fetchMessage (func_descriptor.message.message) . then (message => {
                        callCommand (func_descriptor.name, func_descriptor.args, message, true);
                    }).catch (err => {
                        log ("Could not fetch message " + func_descriptor.message.message + " in channel " + func_descriptor.message.channel + ", timeout " + time_key + " failed. Error: " + err + ".", "timers")
                    });
                } else {
                    log ("Command " + func_descriptor.name + " does not exist, timeout " + time_key + " failed.", "timers")
                }
            },
        };
        // If the type given exists, execute on it.
        if (possible_types.hasOwnProperty (func_descriptor.type)) {
            possible_types [func_descriptor.type] ();
        } else {
            // If we passed a garbage type, log the error and clear the timeout anyway.
            log (func_descriptor.type + " is not a valid type for a persistent timeout's \`func_descriptor.type\`.", "timers");
        }
        // After calling the function as requested, clear the timeout forever.
        clearPersistentTimeout (time_key);
    };
    // Calculate when the timeout function should be called.
    const time_until = memory.timeouts [time_key] . time - new Date () . getTime ();
    // If the time for the timeout already passed, catch up immediately.
    if (time_until <= 0) {
        func_to_call ();
    } else {
        // If time for timeout hasn't happened yet, set the timeout properly!
        temp.timeouts [time_key] = longTimeout.setTimeout (func_to_call, time_until);
    }
}
// Loads all set persistent timeouts into memory on load.
function reviveAllPersistentTimeouts () {
    Object.keys (memory.timeouts).forEach (time_key => {
        revivePersistentTimeout (time_key);
    });
}

function setHook (hook) {
    // Create hooks memory if needed.
    var guild_id = hook.guild;
    var guild_mem = memory.guilds [guild_id];
    delete hook.guild;
    if (!guild_mem.hasOwnProperty ("hooks")) {
        guild_mem.hooks = {};
    }
    // Check if hook by that regex already exists.
    if (guild_mem.hooks.hasOwnProperty (hook.regex_string)) {
        return false;
    }
    // Save hook and activate it.
    guild_mem.hooks [hook.regex_string] = hook;
    reviveHook (guild_id, hook.regex_string);
    return true;
}
// Permanently removes the given hook in the given guild.
function clearHook (guild_id, regex_string) {
    // Remove permanent memory.
    var perm_hooks = memory.guilds [guild_id].hooks;
    if (perm_hooks && perm_hooks [regex_string]) {
        delete perm_hooks [regex_string];
    }
    // Remove temporary memory.
    var temp_hooks = temp.guilds [guild_id] . hooks;
    if (temp_hooks && temp_hooks [regex_string]) {
        delete temp_hooks [regex_string];
    }
}
// "Revives" the hook with the given ID.
function reviveHook (guild_id, regex_string) {
    var hook = memory.guilds [guild_id] . hooks [regex_string];
    // Create our regex object to match against.
    var regex_options = hook.regex_options;
    var regex_obj = new RegExp (hook.regex_string, regex_options);
    var guild_temp = temp.guilds [guild_id];
    if (!guild_temp.hasOwnProperty ("hooks")) {
        guild_temp.hooks = {};
    }
    guild_temp.hooks [regex_string] = {
        "regex": regex_obj,
        "command": hook.command,
        "args": hook.args
    };
}
// Loads all set hooks into each guild memory on load.
function reviveAllHooks () {
    bot.guilds.keyArray () . forEach (guild_id => {
        var guild_mem = memory.guilds [guild_id];
        // If this guild has no hooks, return.
        if (!guild_mem.hasOwnProperty ("hooks")) {
            return;
        }
        // Run through every hook and revive it.
        Object.keys (guild_mem.hooks) . forEach (key => {
            reviveHook (guild_id, key);
        });
    });
}
// Reads in a message and calls all commands that are hooked up via the hook commands. 
function matchHooks (message) {
    var found_hook = false;
    // Check if this guild has any hooks at all.
    var all_hooks = temp.guilds [message.guild.id] . hooks || {};
    all_hooks = Object.assign ({}, getDynamicHooks (message.guild), all_hooks);
    if (all_hooks && Object.keys (all_hooks).length !== 0) {
        Object.keys (all_hooks) . forEach (hook_ID => {
            var cur_hook = all_hooks [hook_ID];
            var guild_config = getGuildConfig (message.guild);
            // Check for matches (depending on globality, multiple times) and execute on them.
            var hook_matches = undefined;
            var number_of_matches = 0;
            while (number_of_matches < guild_config.max_hooks_per_message && (hook_matches = cur_hook.regex.exec (message.content)) !== null) {
                // If this isn't a global regex, hack it to only run once.
                if (cur_hook.regex.global) {
                    number_of_matches += 1;
                } else {
                    number_of_matches = guild_config.max_hooks_per_message;
                }
                if (hook_matches) {
                    // Note down that we found at least one hook.
                    found_hook = true;
                    // If the regex passed included match groups, append each string group matched as an argument.
                    var args_to_pass = cur_hook.args.slice ();
                    // Remove first argument, because that is merely the full matched string which is not needed.
                    hook_matches.shift ();
                    hook_matches.forEach(matched_string => {
                        if (matched_string !== "") {
                            args_to_pass = args_to_pass.concat (matched_string.split (" "));
                        }
                    });
                    // Call the associated command with the given arguments.
                    callCommand (cur_hook.command, args_to_pass, message);
                }
            }
        });
    }
    // Report found hooks if some were found.
    if (found_hook) {
        return true;
    } else {
        return false;
    }
}
// Returns an array of global hooks, like the bots' name respondance.
function getDynamicHooks (guild) {
    var guild_config = getGuildConfig (guild);
    var return_hooks = {};
    // If random markoving is on, respond to its own name.
    if (guild_config.random_markov === true) {
        var nick = getCurrentName (bot.user, guild);
        return_hooks ["^(.*" + nick + ".*)$"] = {
            "regex": new RegExp ("^(.*" + nick + ".*)$", "gi"),
            "command": "markov",
            "args": [],
        };
    }
    return return_hooks;
}
// Returns a random key that doesn't exist in the passed object yet.
// Size is the length of the key.
function getNewID (obj, size) {
    size = size || 7;
    var id = "";
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&-_+#§$!?][}{)(";
    // Repeat until ID is a new property to the object.
    while (id === "" || obj.hasOwnProperty (id)) {
        for (var i = 0; i < size; i++) {
            id += chars.charAt (Math.floor (Math.random() * chars.length));
        }
    }
    return id;
}
// Adds the given string to the markov chain object for the given guild and saves it to disc.
function feedMarkov (guild, new_string) {
    new_string = "\n" + new_string.replace ("<@!" + bot.user.id + ">", "") . replace (/\s+/g, " ") . trim ();
    if (new_string === "" || new_string === " " || new_string === "\n") {
        return;
    }
    // To start, simply feed the new string into the running markov machine, no matter what happens to the data files.
    if (temp.guilds [guild.id] . markov_state !== undefined) {
        temp.guilds [guild.id] . markov_object.seed (new_string);
    }
    // Then, see if we need to create a fresh file.
    var data_path = config.guilds_dir + guild.id + "/" + config.markov_file;
    try {
        fs.accessSync (data_path, fs.constants.R_OK | fs.constants.W_OK);
    } catch (err) {
        try {
            fs.writeFileSync (data_path, fs.readFileSync (config.base_markov_data, "utf8"));
        } catch (err) {
            log ("Could neither find nor create markov data file at " + data_path + ". Error: " + err, "markov");
            return;
        }
    }
    // File is there now, so try and append to it.
    try {
        fs.appendFileSync (data_path, new_string);
    } catch (err) {
        log ("Could not save new markov data to " + data_path + ".", "markov");
    }
}
// Splits a string into a stripped array of words.
// Slices off `sliced` characters at the front.
function makeArrayOfWords (str, sliced = 0) {
    return str.slice (sliced) . trim () . split (/ +/g);
}
// Returns the time difference between two unix timestamps as a human readable string.
function msToInterval (currentTimestamp, remoteTimestamp) {
    const timeFrames = [
        /*	
        	Each entry helps the loop below figure out what to display exactly.
        	name: Name of the current detail level, will be displayed in the timeString.
        	min: How big the difference has to be at least for this entry to grip. difference is in seconds.
        	eatDetails: If this is false, this level of granularity will not take a detail slot.
        	            For example, we pretty much always want days to display along weeks for a precise date.
        */
        {
            "name": "year",
            "min": 31536000,
            "eatDetails": true
        },
        {
            "name": "month",
            "min": 2592000,
            "eatDetails": true
        },
        {
            "name": "week",
            "min": 604800,
            "eatDetails": false
        },
        {
            "name": "day",
            "min": 86400,
            "eatDetails": true
        },
        {
            "name": "hour",
            "min": 3600,
            "eatDetails": true
        },
        {
            "name": "minute",
            "min": 60,
            "eatDetails": true
        },
        {
            "name": "second",
            "min": 1,
            "eatDetails": true
        },
    ];
    // Returns the "x time ago" string from the given unix timestamps.
    var diff = currentTimestamp - remoteTimestamp;
    // Only interested in seconds.
    var absDiff = Math.abs (Math.round (diff / 1000));
    if (absDiff < 1) {
        return "Just now";
    }
    //How many timeFrames we want to keep going down before finishing the string.
    var detailsLeft = 3;
    //If true, only detailsLeft amount of further details will be processed.
    var exhaustDetails = false;
    // Prepare the timeString pieces.
    var timePieces = [];
    for (var i = 0; i < timeFrames.length; i++) {
        if (exhaustDetails || absDiff >= timeFrames [i] . min) {
            var numberOfFrames = Math.floor (absDiff / timeFrames [i] . min);
            detailsLeft -= 1;
            if (detailsLeft < 0) {
            // If this timeFrame would exceed the defined maximum, stop.
                break;
            }
            if (!timeFrames [i].eatDetails) {
                // After we checked if this should stop, increase the counter if this entry does not use a slot
                // So that the next one will be bundled with it. (eg. "months, weeks" is bad, "weeks, days" is good.)
                detailsLeft += 1;
            }
            if (numberOfFrames <= 0) {
                continue;
            }
            exhaustDetails = true;
            var plural = numberOfFrames != 1 ? "s" : "";
            timePieces.push (numberOfFrames + " " + timeFrames [i] . name + plural);
            absDiff -= numberOfFrames * timeFrames [i] . min;
        }
    }
    // Assemble the timeString.
    var timeString = "";
    for (i = 0; i < timePieces.length; i++) {
        var separator;
        if (i == 0) {
            separator = "";
        } else if (i == timePieces.length - 1) {
            separator = " and ";
        } else {
            separator = ", ";
        }
        timeString += separator + timePieces[i];
    }
    // Add pre- or postfix.
    if (diff < 0) {
        timeString = timeString + " from now";
    } else {
        timeString = timeString + " ago";
    }
    return timeString;
}
// Core helpers for common command structures.
// Allows passing of a command's arguments as well as a dictionary of functions.
// Then it will call the appropriate function from the dictionary by using the first argument, passing the rest.
// If there's no callback for the argument or just no argument given, it'll attempt calling the "default" key.
function commandSwitch (args, dictionary) {
    var com_switch = "default";
    if (args.length !== 0) {
        com_switch = args.shift ();
    }
    if (dictionary.hasOwnProperty (com_switch)) {
        return dictionary [com_switch] (args);
    } else if (dictionary.hasOwnProperty ("default")) {
        return dictionary ["default"] (args);
    } else {
        return undefined;
    }
}
// Similar to commandSwitch, but will instead call all functions in the dictionary that are ANY argument.
// All functions are called parameter-less.
// Returns a dictionary of return values (where each return value uses the arg used as key).
function commandBundle (args, dictionary) {
    if (args.length === 0) {
        args = ["default"];
    }
    var results = {};
    args.forEach (argument => {
        if (dictionary.hasOwnProperty (argument)) {
            results [argument] = dictionary [argument] ();
        }
    });
    return results;
}
// Checks if the message was sent by the bot owner, used for commands that affect many guilds, such as quitting.
function isByBotAdmin (message) {
    // Check if it's the owner's ID.
    return message.author.id === config.owner_id ? true : false;
}
// Checks if the message was sent by a staff member on the server.
function isByStaffMember (message) {
    // Check if the author fulfills the guild-specific staff requirement.
    var guild_config = getGuildConfig (message.guild);
    return !guild_config.use_hierarchy || message.member.permissions.has (guild_config.staff_perms);
}
// Returns a RichEmbed object.
function makeEmbed () {
    return new Discord.RichEmbed ()
}
// Returns whether a command of the given name exists.
function hasCommand (name) {
    return commands.hasOwnProperty (name);
}
// Handle memory saving on bot exit.
cleanup(() => {
    console.log ("\n");
    exit ();
});
// Boot!
init ();
