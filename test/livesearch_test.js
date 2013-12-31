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
      this.makeServer = function () {
        this.server = this.sandbox.useFakeServer();
        this.server.respondWith([200, { "Content-Type": "application/json" },
                           '["item1", "item2"]']);
      };
      this.applyLivesearch = function (options) {
        var callback = this.spy();

        this.$input.livesearch(
            $.extend(
              options, {delay: this.delay, minimum_characters: 0}
            )
          );
        this.$input.on('livesearch:results', callback);

        return callback;
      };

      this.type = function (val, delay) {
        this.$input.val(val);
        this.$input.trigger('input');
        this.clock.tick(delay || this.delay);
        this.server.respond();
      };
    }
  });



  test('is chainable', function() {
    expect(1);
    // Not a bad test to run on collection methods.
    strictEqual(this.$input.livesearch()[0], this.$input[0], 'should be chainable');
  });

  test('calls the server on input', function() {
    expect(1);
    this.makeServer();
    var callback = this.applyLivesearch();

    this.type('1');

    ok(callback.args[0][1].length);
  });

  test('does not search twice if new input is recieved before the delay', function() {
    expect(1);
    this.makeServer();
    var callback = this.applyLivesearch();

    this.type('1', this.delay / 2);
    this.type('2');

    strictEqual(callback.callCount, 1);
  });

  test('does not search twice if the value has not changed', function() {
    expect(1);
    this.makeServer();
    var callback = this.applyLivesearch();

    this.type('1');
    this.type('1');

    strictEqual(callback.callCount, 1);
  });

  test('does not search if the minimum characters are not reached', function() {
    expect(1);
    this.makeServer();
    var callback = this.applyLivesearch({minimum_characters: 2});

    this.type('1');

    ok(callback.callCount, 0);
  });

  test('caches results', function() {
    expect(2);
    this.makeServer(this);
    var callback = this.applyLivesearch();

    this.type('1');
    this.type('2');
    this.type('1');

    strictEqual(callback.args[0][1], callback.args[2][1]);
    strictEqual(this.server.requests.length, 2);
  });

}(jQuery));
