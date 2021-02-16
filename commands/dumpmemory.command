// Help function:
exports.help = (config, command, message) => {
    return "Makes me post a dump of my current memory, either permanent or temporary. \nUsage: \`" + config.prefix + command + " [perm|temp]\`";
}
// Command logic:
exports.call = (args, info) => {
    if (info.core.isByStaffMember (info.message)) {
        return info.core.commandSwitch (args, {
            temp: args => {
                var memory = JSON.stringify (cloneSafeJSON (info.temp, 20), null, "\t")
                info.message.channel.send ("My temporary memory is attached.", {
                    "file": {
                        "name": "temp-memory.json",
                        "attachment": Buffer.from (memory),
                    }
                });
                return;
            },
            default: args => {
                var memory = JSON.stringify (cloneSafeJSON (info.memory, 20), null, "\t")
                info.message.channel.send ("My memory is attached.", {
                    "file": {
                        "name": "main-memory.json",
                        "attachment": Buffer.from (memory),
                    }
                });
                return;
            }
        });
    }
    // If unauthorized.
    else {
        return "You are not authorized to do this."
    }
}
// Creates and returns a safe-for-stringifying copy of the given Object.
// Taken from https://stackoverflow.com/questions/13594621/
function cloneSafeJSON (obj, depth) {
    var undef;
    // Reference to cloned objects.
    var refs = [];
    // Max recursion level.
    depth = +depth > 0 && +depth || 6;
    // Current layer being checked.
    var layerNumber = 0;
    // Start cloning.
    var ret = clone (obj);
    // Cleanup reference checks.
    while (refs.length) {
        /// delete (refs.shift ()).___copied;
        delete refs.shift () . ___copied;
    }
    // Return the result.
    return ret;
    // Recursive clone method.
    function clone (obj) {
        // No function replication.
        if (typeof obj == "function") {
            return undef;
        }
        // Handle the 3 simple types, and null or undefined.
        if (null == obj || "object" != typeof obj) {
            return obj;
        }
        // Handle Date.
        if (obj instanceof Date) {
            var copy = new Date ();
            copy.setTime (obj.getTime ());
            return copy;
        }
        // Handle Array.
        if (obj instanceof Array) {
            var copy = [];
            for (var i = 0, len = obj.length; i < len; i++) {
                copy[i] = clone (obj [i]);
            }
            return copy;
        }
        // Handle Object.
        if (obj instanceof Object) {
            // Max recursion reached.
            if (++layerNumber >= depth) {
                layerNumber--;
                return undef;
            }
            // Handle circular and duplicate references.
            // Already included.
            if (obj.___copied) {
                return undef;
            }
            obj.___copied = true;
            refs.push (obj);
            var copy = {};
            if (obj instanceof Error) {
                copy.message = obj.message || "Error";
                if (obj.stack) {
                    copy.stack = obj.stack;
                }
                if (obj.number) {
                    copy.number = obj.number;
                }
                if (obj.description) {
                    copy.description = obj.description;
                }
                if (obj.name) {
                    copy.name = obj.name;
                }
            }
            for (var attr in obj) {
                if (attr == "___copied") {
                    continue;
                }
                if (obj.hasOwnProperty (attr)) {
                    copy [attr] = clone (obj [attr]);
                }
            }
            if (obj.prototype) {
                for (var attr in obj.prototype) {
                    if (obj.prototype.hasOwnProperty (attr) && typeof obj.prototype [attr] !== 'function') copy [attr] = clone (obj.prototype [attr]);
                    // Allow prototypes to be re-scanned.
                    delete obj.prototype [attr].___copied;
                }
            }
            layerNumber--;
            return copy;
        }
        console.log ("Unable to copy obj! Unsupported type: %s", typeof obj);
        //Unable to clone the object in question. Already included
        return undef;
    }
}
