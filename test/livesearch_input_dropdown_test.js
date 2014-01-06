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

  module('jQuery#livesearch_input_dropdown', {
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
      this.applyLivesearchInputDropdown = function (options) {
        var callback = this.spy();

        this.$input.livesearch_input_dropdown(
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
    strictEqual(
      this.$input.livesearch_input_dropdown()[0],
      this.$input[0],
      'should be chainable');
  });

  test('correct markup is added when needed', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown();
    strictEqual($('#plain ul.result_list').length, 1);
  });

  test('correct markup could already exist', function () {
    this.$input = $('#qunit-fixture #with_results input');
    this.makeServer();
    this.applyLivesearchInputDropdown();
    strictEqual(
      $('#with_results ul.result_list').length, 1,
      'no additional results list was added'
    );
  });

  test('the input could be in a .field_with_icon', function () {
    this.$input = $('#qunit-fixture #just_field_with_icon input');
    this.makeServer();
    this.applyLivesearchInputDropdown();
    strictEqual($('#just_field_with_icon .field_with_icon').siblings('.results').length, 1);
  });

  test('results from the server appear', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown();
    this.type();
    ok($('#plain .result_list li').length);
  });

  test('able to specify how to retrieve names from results', function () {
    expect(2);
    this.makeServer();
    this.applyLivesearchInputDropdown({
      return_name_from_result: function (item) {
        strictEqual(typeof item, 'string');
        return 'name';
    }});
    this.type();
    strictEqual($('#plain .result_list li:first').text(), 'name');
  });

  test('able to manually process entire server response', function () {
    expect(2);
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function (server_response) {
      strictEqual(server_response.length, 1);
      return ['name'];
    }});
    this.type();
    strictEqual($('#plain .result_list li:first').text(), 'name');
  });

  test('able to manually process entire server response', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function (server_response) {
      strictEqual(server_response.length, 1);
      return ['name'];
    }});
    this.type();
    strictEqual($('#plain .result_list li:first').text(), 'name');
  });

}(jQuery));
