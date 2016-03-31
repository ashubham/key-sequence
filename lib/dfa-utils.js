/**
 * Generate a DFA for a given key sequence.
 *
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

/**
 * Gets the keys for a given processed sequence to aid in matching the DFA
 *
 * @param pSeq
 * @returns {*}
 */
function getKeys(pSeq) {
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

/**
 * Get the next state transition.
 *
 * @param dfa
 * @param keysToMatch
 * @param currentState
 * @param key
 * @returns {*}
 */
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

module.exports = {
    generateDFA: generateDFA,
    getKeys: getKeys,
    getNextState: getNextState
};
