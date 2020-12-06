//Help function:
exports.help = (config, command, message) => {
    return `Make me run a given command in the future. If you delete the message that set the command, I will not post the result. \
					\nUsage: \`${config.prefix}${command} [command] in [time]\` \
					\nExample: \`${config.prefix}${command} say hello in 10 seconds\``;
}
//Converts human form to timestamps.
const fromHumanInterval = require('human-interval');
//Command logic:
exports.call = (args, info) => {
    if (args.length < 1) {
        return "If you tell me a command and a time, I'll try to do that for you then! If you give me an absolute date or time, the timezone is UTC.";
    } else {
        //Else, the user is trying to set a timeout right now.
        const now = new Date().getTime();
        var run_date = undefined;
        var time_until = undefined;
        var time_input = undefined;
        var made_attempt_at_giving_time = true;
        //If the date is given in relative time, attempt to parse that interval.
        if (args.lastIndexOf("in") !== -1) {
            time_input = args.slice(args.lastIndexOf("in") + 1, args.length).join(" ");
            args = args.slice(0, args.lastIndexOf("in"));
            time_until = parseInt(fromHumanInterval(time_input), 10);
            if (time_until) {
                run_date = now + time_until;
            }
        }
        //If the date is given at an absolute time, attempt to parse the time given.
        else if (args.lastIndexOf("at") !== -1) {
            time_input = args.slice(args.lastIndexOf("at") + 1, args.length).join(" ");
            args = args.slice(0, args.lastIndexOf("at"));
            run_date = new Date(`${time_input} ${new Date().getFullYear()}`).getTime();
            if (run_date) {
                time_until = run_date - now;
            }
        }
        //If no attempt at giving a time was made, complain.
        else {
            made_attempt_at_giving_time = false;
        }
        //If timing was not figured out, error out.
        if (!(run_date && time_until)) {
            //If it could not figure out when the command should happen, remorse.
            if (made_attempt_at_giving_time) {
                // If no attempt was made to tell it when the command should happen, complain.
                return "Sorry, I couldn't figure out what time you mean. Rephrase it for me, maybe?";
            } else {
                return "You didn't tell me when!";
            }
        }
        //If the time is too far in the future (more than 3 years), cancel.
        if (time_until > 94670778000) {
            return `${info.core.msToInterval(now, now + time_until)} is a bit too far in the future.`;
        }
        //If there is no actual command given, complain.
        if (args.length < 1) {
            return "Thanks for telling me when without telling me what, idiot.";
        }
        //If the command given doesn't exist, complain also.
        var command = args.shift();
        if (!info.core.hasCommand(command)) {
            return `Oi oi oi, I don't know of any such \`${command}\` command, kid.`;
        }
        //Set timer.
        info.core.setPersistentTimeout({
            "name": command,
            "args": args,
            "type": "command",
            "message": info.message,
        }, time_until);
        //Printing result.
        var argument_string = args.join(" ");
        //If the time is less than a second away, just call the command right now.
        if (time_until <= 1000) {
            return `Will \`${command} ${argument_string}\` right now.`;
        }
        //If date is figured out, report when the command will be executed.
        else {
            return `Will \`${command} ${argument_string}\` ${info.core.msToInterval(now, now + time_until)}.`;
        }
    }
}
