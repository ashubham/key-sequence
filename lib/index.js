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
