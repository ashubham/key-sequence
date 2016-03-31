/**
 * Author: Ashish Shubham (ashubham@gmail.com)
 * March 2016.
 */

/**
 * Generate a DFA for a given key sequence.
 * @param keySequence
 * @returns {Array}
 */
function generateDFA(keySequence) {

    var dfa = [];
    for(var i = 0; i<keySequence.length;i++) {
        var key = keySequence[i];
        var nextKey = keySequence[i+1];
        var prevKey = keySequence[i-1];
        var state = {};
        state[key.key] = i+1;
        if(key.isSkippable) {
            state[nextKey.key] = i+2;
        }
        if(!!prevKey && prevKey.isRepeatable) {
            state[prevKey.key] = i;
        }
        dfa.push(state);
    }
    dfa.push({});
    return dfa;
}

function isRepeatable(key) {
    var lastchar = key.slice(-1);
    return lastchar === '+' || lastchar === '*';
}

function isSkippable(key) {
    var lastchar = key.slice(-1);
    return lastchar === '*';
}

function strip(key) {
    var lastchar = key.slice(-1);
    return (lastchar === '*' || lastchar === '+')
        ? key.slice(0,-1)
        : key;
}

function process(keySequence) {
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
}


function getKeysToMatch(pSeq) {
    function getRegexp(key) {
        return new RegExp('^' + key + '$');
    }
    return pSeq.reduce(function (mKeys, pKey) {
        if(typeof pKey.key === 'string') {
            mKeys.push({
                key: pKey.key,
                regex: getRegexp(pKey.key)
            });
        }
        return mKeys;
    }, []);
}

function getNextState(dfa, keysToMatch, currentState, key) {
    var keyChar = String.fromCharCode(key);
    var keyMutations = [key, keyChar];

    var mutationsFromTargetKeys = keysToMatch.
        filter(function(mKey) {
            return mKey.regex.test(key) || mKey.regex.test(keyChar);
        }).
        map(function (mKey) {
            return mKey.key;
        });

    keyMutations = keyMutations.concat(mutationsFromTargetKeys);

    var matchingMutation = keyMutations.find(function(mutation) {
        return !!dfa[currentState][mutation];
    });

    return dfa[currentState][matchingMutation];
}

/**
 * Generates a key sequence detector for a given key sequence
 * Does not support characters '+' and '*' as they are reserved.
 * Example usage: getKeySequenceDetector([';',' *','\n'], onSuccess)
 * The above will match ; followed by any number of spaces and a newline.
 *
 * @param keySequence
 * @param onSuccess
 * @returns {Function}
 */
module.exports = function (keySequence, onSuccess) {
    var currentState = 0;
    var processedSequence = process(keySequence);
    var keysToMatch = getKeysToMatch(processedSequence);
    var dfa = generateDFA(processedSequence);

    return function (key, event) {
        currentState = getNextState(dfa, keysToMatch, currentState, key) || 0;
        // If a key does not match any transition, but can start a new cycle
        // for e.g. (';',' ',';')
        if(currentState === 0) {
            currentState = getNextState(dfa, keysToMatch, currentState, key) || 0;
        }
        if(currentState === dfa.length - 1) {
            currentState = 0;
            onSuccess(event);
        }
    };
};
