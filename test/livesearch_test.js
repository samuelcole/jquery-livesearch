(function($) {
  /*
    ======== A Handy Little QUnit Reference ========
    http://api.qunitjs.com/

    Test methods:
      module(name, {[setup][ ,teardown]})
      test(name, callback)
      expect(numberOfAssertions)
      stop(increment)
      start(decrement)
    Test assertions:
      ok(value, [message])
      equal(actual, expected, [message])
      notEqual(actual, expected, [message])
      deepEqual(actual, expected, [message])
      notDeepEqual(actual, expected, [message])
      strictEqual(actual, expected, [message])
      notStrictEqual(actual, expected, [message])
      throws(block, [expected], [message])
  */

  module('jQuery#livesearch', {
    // This will run before each test in this module.
    setup: function() {
      this.$input = $('#qunit-fixture input');
      this.delay = 400;
    }
  });

  function makeServer(test) {
    var server = test.sandbox.useFakeServer();
    server.respondWith([200, { "Content-Type": "application/json" },
                       '["item1", "item2"]']);
    return server;
  }

  function applyLivesearch(test, options) {
    var callback = test.spy();

    test.$input.livesearch(
        $.extend(
          options, {delay: this.delay, minimum_characters: 0}
        )
      );
    test.$input.on('livesearch:results', callback);

    return callback;
  }

  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.$input.livesearch()[0], this.$input[0], 'should be chainable');
  });

  test('calls the server on input', function() {
    expect(1);
    var server = makeServer(this);
    var callback = applyLivesearch(this);

    this.$input.trigger('input');
    this.clock.tick(this.delay);
    server.respond();

    ok(callback.args[0][1].length);
  });

  test('does not search twice if new input is recieved before the delay', function() {
    expect(1);
    var server = makeServer(this);
    var callback = applyLivesearch(this);

    this.$input.trigger('input');
    this.clock.tick(this.delay / 2);
    this.$input.val('1');
    this.$input.trigger('input');
    this.clock.tick(this.delay);
    server.respond();

    strictEqual(callback.callCount, 1);
  });

  test('does not search twice if the value has not changed', function() {
    expect(1);
    var server = makeServer(this);
    var callback = applyLivesearch(this);

    this.$input.trigger('input');
    this.clock.tick(this.delay / 2);
    this.$input.trigger('input');
    this.clock.tick(this.delay);
    server.respond();

    strictEqual(callback.callCount, 1);
  });

  test('does not search if the minimum characters are not reached', function() {
    expect(1);
    var server = makeServer(this);
    var callback = applyLivesearch(this, {minimum_characters: 1});

    this.$input.trigger('input');
    this.clock.tick(this.delay);
    server.respond();

    ok(callback.callCount, 0);
  });

  test('caches results', function() {
    expect(2);
    var server = makeServer(this);
    var callback = applyLivesearch(this);

    function type(val, test) {
      test.$input.val(val);
      test.$input.trigger('input');
      test.clock.tick(test.delay);
      server.respond();
    }

    type('1', this);
    type('2', this);
    type('1', this);

    strictEqual(callback.args[0][1], callback.args[2][1]);
    strictEqual(server.requests.length, 2);
  });

}(jQuery));
