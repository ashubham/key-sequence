# key-sequence
<a href="https://travis-ci.org/ashubham/array-filter-n">
  <img src="https://api.travis-ci.org/ashubham/key-sequence.svg?branch=master" class="badge">
</a>

Detect a sequence of key presses, and call the supplied callback.

## Usage

```javascript
var keySequence = require('key-sequence'); // CommonJS style
<script src="key-sequence.min.js"></script> // ES5 style browser imports.

// '+' is the regex '+' (denotes repeatable characters)
var onKey = keySequence(['o','m+','g'], function () {
    // Do what needs to be done when the key sequence is detected.
    console('OMG it works!');
});

document.addEventListener('keypress', function(e) {
    onKey(String.fromCharCode(e.which);
});
```

## Features

Supports `+` and `*` as wildcards to denote repeating characters.

## Wait, but why ?

Using a regex is slow and cannot get less elegant, its `O(n)` in the size of your total input,
on every single keystroke.

`key-sequence` generates a DFA and maintains the state. `O(1)` every single keystroke.

## Theory

Coming soon!




