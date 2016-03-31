/**
 * Created by ashish.shubham on 3/27/16.
 */

'use strict';

var onKeySequence = require('../index.js');

describe('getKeySequenceDetector', function () {
    it('should match sequence without wildcards and call success cb with event', function() {
        var onSuccess = jasmine.createSpy();
        var event = {};
        var detector = onKeySequence(['a','b','c'], onSuccess);
        detector('a', event);
        detector('b', event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);
    });

    it('should match sequence with wildcards and call success cb with event', function () {
        var onSuccess = jasmine.createSpy();
        var event = {};
        var detector = onKeySequence(['a','b*','c'], onSuccess);
        detector('a', event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);

        detector('a', event);
        detector('b', event);
        detector('b', event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);
    });

    it('should not match invalid sequence but should continue to match the valid one', function () {
        var onSuccess = jasmine.createSpy();
        var event = {};
        var detector = onKeySequence(['a', 'b*', 'c'], onSuccess);
        detector('a', event);
        detector('d', event);
        expect(onSuccess).not.toHaveBeenCalled();
        detector('a', event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);
    });

    it('should not match invalid sequence but if the sequence breaks at the start of a potential valid one, continue', function () {
        var onSuccess = jasmine.createSpy();
        var event = {};
        var detector = onKeySequence(['a', 'b*', 'c'], onSuccess);
        detector('a', event);
        detector('b', event);
        detector('a', event);
        expect(onSuccess).not.toHaveBeenCalled();
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);
    });

    it('should match keycodes as well', function () {
        var onSuccess = jasmine.createSpy();
        var event = {};
        var detector = onKeySequence([97, 'b*', 'c'], onSuccess);
        detector('a', event);
        detector('b', event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);

        detector('a', event);
        detector(98, event);
        detector(98, event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);
    });

    it('should match keycodes with wildcards', function () {
        var onSuccess = jasmine.createSpy();
        var event = {};
        var detector = onKeySequence([97, '98*', 'c'], onSuccess);
        detector('a', event);
        detector('b', event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);

        detector(97, event);
        detector(98, event);
        detector(98, event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);
    });

    it('should match special regex metacharacters', function () {
        var onSuccess = jasmine.createSpy();
        var event = {};
        var detector = onKeySequence([97, '\\s+', 'c'], onSuccess);
        detector('a', event);
        detector(' ', event);
        detector(' ', event);
        detector('\t', event);
        detector('\n', event);
        detector('c', event);
        expect(onSuccess).toHaveBeenCalledWith(event);

        var onSuccess2 = jasmine.createSpy();
        detector = onKeySequence([97, '\\s+', 'c'], onSuccess2);
        detector('a', event);
        detector(' ', event);
        detector(' ', event);
        detector('\t', event);
        detector('\b', event);
        detector('c', event);
        expect(onSuccess2).not.toHaveBeenCalled();
    })
});
