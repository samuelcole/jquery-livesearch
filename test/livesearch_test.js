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
      this.$input = $('#qunit-fixture #plain input');
      this.delay = 400;
      this.makeServer = function () {
        this.server = this.sandbox.useFakeServer();
        this.server.respondWith(function (req) {
          req.respond(
            200,
            { "Content-Type": "application/json" },
            '["' + req.url + '"]');
        });
      };
      this.applyLivesearch = function (options) {
        var callback = this.spy();

        this.$input.livesearch(
            $.extend(
              {delay: this.delay, minimum_characters: 0}, options
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

  test('calls the server on change', function() {
    expect(1);
    this.makeServer();
    var callback = this.applyLivesearch();

    this.$input.trigger('change');
    this.clock.tick(this.delay);
    this.server.respond();

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

    strictEqual(callback.callCount, 0);
  });

  test('caches results', function() {
    expect(2);
    this.makeServer();
    var callback = this.applyLivesearch();

    this.type('1');
    this.type('2');
    this.type('1');

    strictEqual(callback.args[0][1], callback.args[2][1]);
    strictEqual(this.server.requests.length, 2);
  });

  test('caching can be turned off', function() {
    expect(1);
    this.makeServer();
    this.applyLivesearch({client_side_cache: false});

    this.type('1');
    this.type('2');
    this.type('1');

    strictEqual(this.server.requests.length, 3);
  });

  test('can be suspended', function () {
    expect(2);
    this.makeServer();
    var callback = this.applyLivesearch();

    this.$input.trigger('livesearch:suspend');

    this.type('1');

    strictEqual(callback.callCount, 0, 'suspended');

    this.$input.trigger('livesearch:activate');

    this.type('1');

    strictEqual(callback.callCount, 1, 'activated');
  });

  test('can be suspended while a callback is executed', function () {
    expect(2);
    this.makeServer();
    var callback = this.applyLivesearch();
    var livesearch = this.$input.data('livesearch');
    var test = this;

    livesearch.suspend_while(function () {
      test.type('1');
      strictEqual(callback.callCount, 0, 'suspended');
    });

    this.$input.trigger('livesearch:activate');

    this.type('1');

    strictEqual(callback.callCount, 1, 'activated');
  });

  test('searches can be canceled', function () {
    expect(1);
    this.makeServer();
    var callback = this.applyLivesearch();

    this.$input.val('1');
    this.$input.trigger('input');
    this.clock.tick(this.delay);

    this.$input.trigger('livesearch:cancel');

    this.server.respond();

    strictEqual(callback.callCount, 0);
  });

  test('process data can be used to change ajax params', function () {
    expect(1);
    this.makeServer();
    var callback = this.applyLivesearch({
      process_data: function () {
        return {hello: 'hello'};
      }
    });

    this.type('1');

    var params = callback.args[0][1][0].split('?')[1];

    strictEqual(params, 'hello=hello');
  });

  test('can ensure a file extension on xhr url', function () {
    expect(1);
    this.makeServer();
    var callback = this.applyLivesearch({
      file_extension: 'json'
    });

    this.type('1');

    var extension = callback.args[0][1][0].split('.')[1].split('?')[0];

    strictEqual(extension, 'json');
  });

  test('fires livesearch:empty event on emptying the input', function() {
    expect(1);
    this.makeServer();
    this.applyLivesearch();

    var eventFired = false;
    this.$input.on('livesearch:empty', function() {
      eventFired = true;
    });
    this.type('123');
    this.type('');

    ok(eventFired);
  });

  test('does not fire livesearch:empty when searching for a non-empty string', function() {
    expect(1);
    this.makeServer();
    this.applyLivesearch();

    var eventNotFired = true;
    this.$input.on('livesearch:empty', function() {
      eventNotFired = false;
    });
    this.type('123');

    ok(eventNotFired);
  });

}(jQuery));
