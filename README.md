# key-sequence
<a href="https://travis-ci.org/ashubham/key-sequence">
  <img src="https://api.travis-ci.org/ashubham/key-sequence.svg?branch=master" class="badge">
</a>
[![Coverage Status](https://coveralls.io/repos/github/ashubham/key-sequence/badge.svg?branch=master)](https://coveralls.io/github/ashubham/key-sequence?branch=master)

Detect a sequence of key presses, and call the supplied callback.

### Usage

```javascript
var keySequence = require('key-sequence'); // CommonJS style
<script src="key-sequence.min.js"></script> // ES5 style browser imports.

// '+' is the regex '+' (denotes repeatable characters)
// The below matches 'omg<enter>'/'omgggg<enter>'/'omggggggg<enter>' ...
var onKey = keySequence(['o','m','g+','\n'], function (evt) {
    // Do what needs to be done when the key sequence is detected.
    console('OMG it works!');
});

document.addEventListener('keypress', function(e) {
    onKey(String.fromCharCode(e.which));
});
```

### Features

Supports `+` and `*` as wildcards to denote repeating characters.

### Wait, but why ?

Using a regex is slow and cannot get less elegant, its `O(n)` in the size of your total input,
on every single keystroke.

`key-sequence` generates a DFA and maintains the state. `O(1)` every single keystroke.
Can think of it as a regex which accepts streaming input.

### TODO

> - Support for more Regex metacharacters like `\s`, `|` etc.
> - Support for keycodes to enable usage metakeys like `<ctrl>`, `<alt>`

### Theory

![Image](img/sample-dfa.png?raw=true)

This is the DFA for the above example. `key-sequence` maintains the present state according to the key input.
Once the end state(`4` in this case) is reached the supplied `done` callback is called.

If, at any point the input does not match a transition, we go back to the starting state `(0)`.
