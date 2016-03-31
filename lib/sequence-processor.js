/**
 * Whether a key is repeatable
 *
 * @param key
 * @returns {boolean}
 */
function isRepeatable(key) {
    var lastchar = key.slice(-1);
    return lastchar === '+' || lastchar === '*';
}

/**
 * Whether a key is skippable
 *
 * @param key
 * @returns {boolean}
 */
function isSkippable(key) {
    var lastchar = key.slice(-1);
    return lastchar === '*';
}

/**
 * Strip a key of its wildcards and return the pure value
 *
 * @param key
 * @returns {*}
 */
function strip(key) {
    var lastchar = key.slice(-1);
    return (lastchar === '*' || lastchar === '+')
        ? key.slice(0,-1)
        : key;
}

module.exports =

    /**
     * Process a raw key sequence and generate metadata for each key.
     *
     * @param keySequence
     * @returns {Array|*}
     */
    function (keySequence) {
        return keySequence.map(function(key) {
            if(typeof key !== 'number' && typeof key !== 'string') {
                throw 'Keys can only be strings or integers';
            }

            var num = Number.parseInt(key);
            var keyIsNotNum = typeof key !== 'number';

            return (isNaN(num))
                ? {
                key: strip(key),
                isSkippable: isSkippable(key),
                isRepeatable: isRepeatable(key)
            }
                : {
                key: (num < 10 && keyIsNotNum) ? num.toString()
                    : (String.fromCharCode(num)) ? String.fromCharCode(num) : num,
                isSkippable: keyIsNotNum && isSkippable(key),
                isRepeatable: keyIsNotNum && isRepeatable(key)
            }
        });
    };