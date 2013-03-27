jQuery-LiveSearch
=================

A small engine that returns results when you stop typing into an input field.

jQuery-LiveSearch attaches to an input:

    $('input.livesearch').livesearch(options);

Then when a user stops typing, it serializes the nearest parent form and submits it with ajax. When the results come
back it fires a custom jquery event:

    $elem.trigger('livesearch:results', [data]);

You can bind to that on the input, or any of it's parent elements (bubbling rules!), and then present it to your users
in any way you wish.

Options
-------
- delay: number of milliseconds to wait after a keystroke, before sending a request
- minimum_characters: don't send a request until the user has typed in this number of characters

Bonus features
--------------

- If the user starts typing before a request is complete, it cancels the original request and starts a new one.
- If the user types in something they have already typed in before, it uses the last results it has obtained.
- If the user hits enter before they have 'stopped typing' it sends the request immediately (but you have to block the
  form from submitting yourself).

Some possible uses
------------------

1. Autocomplete for search: you want to help your users out by making some guesses as to what they are typing.
2. Selecting an item from a large set: you want to let your user search through a large set of items, and then pick one.
3. Searching for a page to navigate to: you have a long list of pages that your user might want to visit, but you don't
   have space (and you're users don't have the patience) to output a long list of links.

Examples
--------

I've started writing some example plugins, that sit on top of the livesearch plugin, the first of this is
livesearch.input_dropdown. It takes a JSON array of strings, and creates a div with a class of 'results' with a ul of
those strings. It lets you click on, or arrow through, those results, and populates the input with the value of the currently
selected value. This is a very basic style for livesearch, and should get you started.

Authors
_______

* Samuel Cole <sam@samuelcole.name>
* Lance Ivy (jquery.livesearch.multi_selector.js) <lance@cainlevy.net>
* Alex Cox <alegscogs@gmail.com>
