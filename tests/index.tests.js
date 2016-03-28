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
});
