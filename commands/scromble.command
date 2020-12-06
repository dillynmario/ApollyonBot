//Help function:
exports.help = (config, command, message) => {
    return `Scromble a word's letters. \
					\nUsage: \`${config.prefix}${command} [something]\``;
}
//Command logic:
exports.call = (args, info) => {
    String.prototype.shuffle = function() {
        return this.split(" ").map(function(word, i) {
            var a = word.split(""),
                n = a.length;
            for (var i = n - 1; i > 0; i--) {
                var j = Math.floor(Math.random() * (i + 1));
                var tmp = a[i];
                a[i] = a[j];
                a[j] = tmp;
            }
            return a.join("");
        }).join(" ");
    }
    return (args.join(" ").shuffle().replace("?", "? ").replace(".", ". ").replace("!", "! ").replace("  ", " "));
}
