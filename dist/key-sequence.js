(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.keySequence = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
var process = require('./sequence-processor'),
    utils     = require('./dfa-utils');

module.exports =

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
    function (keySequence, onSuccess) {
        var currentState = 0;
        var processedSequence = process(keySequence);
        var keysToMatch = utils.getKeys(processedSequence);
        var dfa = utils.generateDFA(processedSequence);

        return function (key, event) {
            currentState = utils.getNextState(dfa, keysToMatch, currentState, key) || 0;
            // If a key does not match any transition, but can start a new cycle
            // for e.g. (';',' ',';')
            if(currentState === 0) {
                currentState = utils.getNextState(dfa, keysToMatch, currentState, key) || 0;
            }
            if(currentState === dfa.length - 1) {
                currentState = 0;
                onSuccess(event);
            }
        };
    };

},{"./dfa-utils":1,"./sequence-processor":3}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
module.exports = require('./lib/index');
},{"./lib/index":2}]},{},[4])(4)
});