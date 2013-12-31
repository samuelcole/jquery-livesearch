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
    }
  });

  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.$input.livesearch()[0], this.$input[0], 'should be chainable');
  });

  test('calls the server on input', function() {
    expect(1);
    var server = this.sandbox.useFakeServer();
    server.respondWith([200, { "Content-Type": "application/json" },
                       '["item1", "item2"]']);
    var callback = this.spy();
    var delay = 400;

    this.$input.livesearch({delay: delay, minimum_characters: 0});
    this.$input.on('livesearch:results', callback);
    this.$input.trigger('input');
    this.clock.tick(delay);
    server.respond();

    ok(callback.args[0][1].length);
  });

  test('does not call server twice if new input is recieved before the delay', function() {
    expect(1);
    var server = this.sandbox.useFakeServer();
    server.respondWith([200, { "Content-Type": "application/json" },
                       '["item1", "item2"]']);
    var callback = this.spy();
    var delay = 400;

    this.$input.livesearch({delay: delay, minimum_characters: 0});
    this.$input.on('livesearch:results', callback);
    this.$input.trigger('input');
    this.clock.tick(delay / 2);
    this.$input.val('1');
    this.$input.trigger('input');
    this.clock.tick(delay);
    server.respond();

    strictEqual(callback.callCount, 1);
  });

}(jQuery));
