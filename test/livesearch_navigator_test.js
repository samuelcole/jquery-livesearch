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

  module('jQuery#livesearch_navigator', {
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
      this.applyLivesearchNavigator = function (options) {
        var callback = this.spy();

        this.$input.closest('form').livesearch_navigator($.extend({
          minimum_characters: 0
        }, options));
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

  test('passes options through to livesearch.input_dropdown', function() {
    expect(1);
    this.makeServer();
    this.applyLivesearchNavigator({process_results: function () {
      return ['name'];
    }});
    this.type();
    strictEqual($('#plain .result_list li:first').text(), 'name');
  });

}(jQuery));
