(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.keySequence = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by ashish.shubham on 3/27/16.
 */

function generateDFA(keySequence) {
    function isRepeatable(key) {
        if(!key) {
            return false;
        }
        var lastchar = key.slice(-1);
        return lastchar === '+' || lastchar === '*';
    }

    function isSkippable(key) {
        if(!key) {
            return false;
        }
        var lastchar = key.slice(-1);
        return lastchar === '*';
    }

    function strip(key) {
        var lastchar = key.slice(-1);
        return (lastchar === '*' || lastchar === '+')
            ? key.slice(0,-1)
            : key;
    }

    var dfa = [];
    for(var i = 0; i<keySequence.length;i++) {
        var key = keySequence[i];
        var nextKey = keySequence[i+1];
        var prevKey = keySequence[i-1];
        var state = {};
        state[strip(key)] = i+1;
        if(isSkippable(key)) {
            state[strip(nextKey)] = i+2;
        }
        if(isRepeatable(prevKey)) {
            state[strip(prevKey)] = i;
        }
        dfa.push(state);
    }
    dfa.push({});
    return dfa;
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
    var dfa = generateDFA(keySequence);

    return function (key, event) {
        currentState = dfa[currentState][key] || 0;
        // If a key does not match any transition, but can start a new cycle
        // for e.g. (';',' ',';')
        if(currentState === 0) {
            currentState = dfa[currentState][key] || 0;
        }
        if(currentState === dfa.length - 1) {
            currentState = 0;
            onSuccess(event);
        }
    };
};

},{}]},{},[1])(1)
});