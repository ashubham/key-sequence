# key-sequence
<a href="https://travis-ci.org/ashubham/key-sequence">
  <img src="https://api.travis-ci.org/ashubham/key-sequence.svg?branch=master" class="badge">
</a>
<a href='https://coveralls.io/github/ashubham/key-sequence?branch=master'>
    <img src='https://coveralls.io/repos/github/ashubham/key-sequence/badge.svg?branch=master' alt='Coverage Status' />
</a>

A featherweight utility to detect a sequence of key presses, and call the supplied callback. Fast!

### Usage

```javascript
var keySequence = require('key-sequence'); // CommonJS style
<script src="key-sequence.min.js"></script> // ES5 style browser imports.

// '+' is the regex '+' (denotes repeatable characters)
// The below matches 'omg<enter>'/'omgggg<enter>'/'o     mggggggg<enter>' ...
var onKey = keySequence(['o', '\s*', 'm', 'g+', '\n'], function (evt) {
    // Do what needs to be done when the key sequence is detected.
    console('OMG it works!', evt);
});

// Konami code
var onKey = keySequence([38, 38, 40, 40, 37, 39, 37, 39, 'b', 'a'], function() {
    console.log('Achievement unlocked!!');
});

// Can pass keycode using e.which using jQuery or events.
$(document).keypress(function(e) {
    onKey(e.which, e /* optional */);
});

// or pass the character itself.
onKey('x');


/* Some more supported keysequences: */

[17, 'c'] //The classic <ctrl> and 'c'
['I', '.*', 'U'] // I <anything in between> U
```

### Features

* Supports `+` and `*` as wildcards to denote repeating characters.
* Support for keyCodes, so you can use metakeys like <ctrl>, <alt> in the sequence.
* Support for meta characters like `\s`, `.` etc.

### Wait, but why ?

Using a regex is slow and cannot get less elegant, its `O(n)` in the size of your total input,
on every single keystroke.

`key-sequence` generates a DFA and maintains the state. `O(1)` every single keystroke.
Can think of it as a regex which accepts streaming input.

### TODO

> - Support for more Regex metacharacters like `|` etc.

### Theory

![Image](img/sample-dfa.png?raw=true)

This is the DFA for the above example. `key-sequence` maintains the present state according to the key input.
Once the end state(`4` in this case) is reached the supplied `done` callback is called.

If, at any point the input does not match a transition, we go back to the starting state `(0)`.
