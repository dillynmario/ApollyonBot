// Help function:
exports.help = (config, command, message) => {
    return "Generate a fake word. May at times create real words. \nUsage: \`" + config.prefix + command + "\`";
}
// Command logic:
exports.call = (args, info) => {
    // Fake-Words by anticoders, https://github.com/anticoders/fake-words/
    // Most common syllabes in English language.
    var syllables = [
        "the", "ing", "er", "a", "ly", "ed", "i", "es", "re", "tion", "in", "e", "con", "y", "ter", "ex", "al", "de", "com", "o", "di", "en", "an", "ty", "ry", "u",
        "ti", "ri", "be", "per", "to", "pro", "ac", "ad", "ar", "ers", "ment", "or", "tions", "ble", "der", "ma", "na", "si", "un", "at", "dis", "ca", "cal", "man", "ap",
        "po", "sion", "vi", "el", "est", "la", "lar", "pa", "ture", "for", "is", "mer", "pe", "ra", "so", "ta", "as", "col", "fi", "ful", "get", "low", "ni", "par", "son",
        "tle", "day", "ny", "pen", "pre", "tive", "car", "ci", "mo", "an", "aus", "pi", "se", "ten", "tor", "ver", "ber", "can", "dy", "et", "it", "mu", "no", "ple", "cu",
        "fac", "fer", "gen", "ic", "land", "light", "ob", "of", "pos", "tain", "den", "ings", "mag", "ments", "set", "some", "sub", "sur", "ters", "tu", "af", "au", "cy", "fa", "im",
        "li", "lo", "men", "min", "mon", "op", "out", "rec", "ro", "sen", "side", "tal", "tic", "ties", "ward", "age", "ba", "but", "cit", "cle", "co", "cov", "daq", "dif", "ence",
        "ern", "eve", "hap", "ies", "ket", "lec", "main", "mar", "mis", "my", "nal", "ness", "ning", "nu", "oc", "pres", "sup", "te", "ted", "tem", "tin", "tri", "tro", "up",
    ];
    // Frequency table for word lengths.
    var wordLengths = [
        1, 1,
        2, 2, 2, 2, 2, 2, 2,
        3, 3, 3, 3,
        4, 4,
        5
    ];
    // Frequency table for random syllabes.
    var syllableCounts = [
        10, 15, 20, 25,
        30, 35, 40, 45,
        50, 75, 100, 125,
        150, 175, 175, 175,
    ];
    var getWord = function(min, max) {
        var length = wordLengths [Math.floor (Math.random () * 16)];
        if (min && (length < min)) length = min;
        if (max && (length > max)) length = max;
        var word = "";
        for (var i = 0; i < length; ++i) {
            var count = syllableCounts [Math.floor (Math.random () * 16)];
            word += syllables [Math.floor (Math.random () * count)];
        }
        return word;
    };
    var randomElement = function(array) {
        return array [Math.floor (Math.random () * array.length)];
    };
    return getWord ();
}
