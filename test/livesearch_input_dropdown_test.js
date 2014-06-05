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

  test('able to set metadata with counts and see \'see all\' link', function () {
    expect(1);
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return { results: ['name'], count: 2 };
    }});
    this.type();
    strictEqual($('#plain .result_list a.see_all').text(), 'see all 2 results');
  });

  test('no results shows no results div', function () {
    expect(1);
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return [];
    }});
    this.type();
    ok($('#plain .no_results').is(':visible'));
  });

  var KEY = {
    UP: 38,
    DOWN: 40,
    DEL: 46,
    TAB: 9,
    ENTER: 13,
    ESC: 27,
    COMMA: 188,
    PAGEUP: 33,
    PAGEDOWN: 34,
    BACKSPACE: 8
  };

  function key(keyCode) {
    var event = jQuery.Event('keydown');
    event.keyCode = keyCode;
    $('#plain input').trigger(event);
    return event;
  }

  test('pressing up before anything is selected, selects the last item', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();
    key(KEY.UP);
    strictEqual($('#plain .result_list li.selected').text(), 'last');
  });

  test('pressing up twice selects the second item', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'second', 'third'];
    }});
    this.type();
    key(KEY.UP);
    key(KEY.UP);
    strictEqual($('#plain .result_list li.selected').text(), 'second');
  });

  test('pressing up at the beginning of the list does not change selected item', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();
    key(KEY.UP);
    key(KEY.UP);
    key(KEY.UP);
    strictEqual($('#plain .result_list li.selected').text(), 'last');
  });

  test('pressing down before anything is selected, selects the first item', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();
    key(KEY.DOWN);
    strictEqual($('#plain .result_list li.selected').text(), 'first');
  });

  test('pressing down twice selects the second item', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'second', 'third'];
    }});
    this.type();
    key(KEY.DOWN);
    key(KEY.DOWN);
    strictEqual($('#plain .result_list li.selected').text(), 'second');
  });

  test('pressing down at the end of the list does not change selected item', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();
    key(KEY.DOWN);
    key(KEY.DOWN);
    key(KEY.DOWN);
    strictEqual($('#plain .result_list li.selected').text(), 'first');
  });

  test('pressing enter before selecting anything does not trigger selected', function () {
    var callback = this.spy();
    $('#plain').on('livesearch:selected', callback);

    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();
    var e = key(KEY.ENTER);
    strictEqual(callback.callCount, 0, 'does not trigger selected');
    ok(e.isDefaultPrevented(), 'default will be prevented');
  });

  test('pressing enter after selecting something does trigger selected', function () {
    var callback = this.spy();
    $('#plain').on('livesearch:selected', callback);

    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();
    key(KEY.DOWN);
    var e = key(KEY.ENTER);
    strictEqual(callback.callCount, 1, 'does trigger selected');
    ok(e.isDefaultPrevented(), 'default will be prevented');
  });

  test('clicking on an item triggers selected', function () {
    var e = jQuery.Event('click');
    var callback = this.spy();
    $('#plain').on('livesearch:selected', callback);

    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();

    $('#plain .results li:first').trigger(e);

    strictEqual(callback.callCount, 1, 'does trigger selected');
    ok(e.isDefaultPrevented(), 'default will be prevented');
  });

  test('pressing a random key only executes default', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();
    var e = key(KEY.PAGEUP);
    ok(!e.isDefaultPrevented(), 'default will not be prevented');
  });

  test('mouseover gives the .selected class', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();

    $('#plain .results li:first').trigger('mouseover');
    ok($('#plain li.selected').length);
  });

  test('mouseout removes the .selected class', function () {
    this.makeServer();
    this.applyLivesearchInputDropdown({process_results: function () {
      return ['first', 'last'];
    }});
    this.type();

    $('#plain .results li:first').trigger('mouseover');
    $('#plain .results li:first').trigger('mouseout');
    ok(!$('#plain li.selected').length);
  });

  test('option to allow enter to submit', function () {
    // jQuery will use the native focus, which demands the document to be in
    // focus. That's not true in a headless browser.
    jQuery.find.selectors.filters.focus = function(elem) {
      var doc = elem.ownerDocument;
      return elem === doc.activeElement && !!(elem.type || elem.href);
    };

    this.makeServer();
    this.applyLivesearchInputDropdown({input_can_submit_on_enter: true});
    this.type();
    $('#plain input').focus();
    var e = key(KEY.ENTER);
    ok(!e.isDefaultPrevented(), 'default is allowed');
  });


}(jQuery));
