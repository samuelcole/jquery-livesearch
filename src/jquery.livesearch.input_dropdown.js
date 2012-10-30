(function ($) {

  /* KEY constant copied from jquery autocomplete:
   * http://bassistance.de/jquery-plugins/jquery-plugin-autocomplete/
  */
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

  function InputDropdown($elem, options) {
    this.$elem = $elem;
    this.options = $.extend({
      update_input: true,
      no_results_html: 'Sorry, we couldn\'t find anything.',
      ignore_history: true,
      process_results: function (r) { return r; }
    }, options);

    var $field_with_icon = this.$elem.closest('.field_with_icon'),
      $existing_results = $([]);

    if ($field_with_icon.length) {
      $existing_results = $field_with_icon.siblings('.results');
    } else {
      $existing_results = this.$elem.siblings('.results');
    }

    if ($existing_results.length) {
      this.$results = $existing_results;
      this.$results.find('div.no_results').remove();
    } else {
      this.$results = $('<div class="results"></div>');
      if ($field_with_icon.length) {
        $field_with_icon.after(this.$results);
      } else {
        this.$elem.after(this.$results);
      }
    }

    if (!this.$results.find('ul.result_list').length) {
      this.$results.append('<ul class="result_list"></ul>');
    }

    this.$no_results = $('<div class="no_results">' + this.options.no_results_html + '</div>');
    this.$no_results.hide();
    this.$results.append(this.$no_results);

    // css should do this
    //this.$results.hide();
    //this.$results.width(this.$elem.outerWidth());
    this.livesearch = $elem.livesearch(this.options).data('livesearch');
    this._attach();
  }

  $.fn.livesearch_input_dropdown = function (options) {
    options = options || {};
    return $(this).each(function () {
      var input_dropdown = $(this).data('livesearch.input_dropdown');
      if (!input_dropdown) {
        input_dropdown = new InputDropdown($(this), options);
        $(this).data('livesearch.input_dropdown', input_dropdown);
      }
    });
  };

  $.extend(InputDropdown.prototype, {
    _attach: function () {
      var _this = this;

      this.$elem.bind('livesearch:results', function (e, results) {
        if (_this.options.process_results) {
          results = _this.options.process_results(results);
        }
        _this.show_results(results);
        _this.push_history(results);
      });

      this.bind_results();
      this.bind_popstate();

      this.$elem.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function (e) {
        var something_selected = !!_this.$results.find('.selected').length,
          $prev,
          $next;
        switch (e.keyCode) {

        case KEY.UP:
          if (something_selected) {
            $prev = _this.$results.find('.selected').prev(':not(.not_result)');
            if (!$prev.length) {
              $prev = _this.$results.find('li:not(.not_result)').last();
            }
            _this.select($prev, false);
          } else {
            _this.select(_this.$results.find('li:not(.not_result)').last(), false);
          }
          e.preventDefault();
          break;
        case KEY.DOWN:
          if (something_selected) {
            $next = _this.$results.find('.selected').next(':not(.not_result)');
            if (!$next.length) {
              $next = _this.$results.find('li:not(.not_result)').first();
            }
            _this.select($next, false);
          } else {
            _this.select(_this.$results.find('li:not(.not_result)').first(), false);
          }
          e.preventDefault();
          break;
        case KEY.ENTER:
          // we want to trigger the selected event
          _this.select(_this.$results.find('.selected'), true);
          e.preventDefault();
          break;
        default:
          break;

        }
      });
    },

    history_api_supported: function () {
      return window.history && window.history.pushState;
    },

    bind_popstate: function () {
      if (!this.history_api_supported() || this.options.ignore_history) { return; }
      var _this = this;
      this.replacing_history_state = false;
      window.onpopstate = function (e) {
        if (e.state && e.state.livesearch) {
          // We've got a search object in history, so let's restore the input to that state.
          _this.show_results(e.state.livesearch.results);
          _this.livesearch.suspend_while(function () {
            _this.$elem.val(e.state.livesearch.input_value).trigger('input');
          });
        } else {
          // We're at a new or null history state.  We may have got
          // here via the back button from an executed search, or have landed here via http search.
          // Let's ensure a blank input.
          _this.reset(true);
        }
      };
    },
    bind_results: function () {
      var _this = this;

      this.$results.find('li').bind('click', function () {
        _this.select($(this), true);
      });
      
      this.$results.find('li').bind('mouseover', function () {
        _this.select($(this));
        _this.unselect_on_mouseout = true;
      });

      this.$results.bind('mouseout', function () {
        if (_this.unselect_on_mouseout) {
          _this.unselect_currently_selected();
        }
      });
    },

    /* Accepts an array of results, and returns an array of result
     * names (strings)
     */
    build_result_names_list: function (results) {
      var result_names = [],
        _this = this;
      $.each(results, function () {
        var name = this;
        if (_this.options.return_name_from_result) {
          name = _this.options.return_name_from_result(this);
        } else if (this !== 'string') {
          name = this[0];
        }
        result_names.push(name);
      });

      return result_names;
    },

    show_results: function (results) {
      var _this = this,
        $results_ul = this.$results.children('ul'),
        result_names;

      this.unselect_currently_selected();
      $results_ul.empty();

      if (!results.length) {
        this.$no_results.show();
        $results_ul.hide();
      } else {
        this.$no_results.hide();
        $results_ul.show();
      }

      result_names = this.build_result_names_list(results);

      $.each(result_names, function (index) {
        var name = this,
          $li = $('<li>' + name + '</li>');
        $li.data('livesearch_result', results[index]);
        $results_ul.append($li);
      });

      this.bind_results();

    push_history: function (results) {
      if (!this.history_api_supported() || this.options.ignore_history) { return; }

      if (typeof results === 'string') {
        results = JSON.parse(results);
      }

      var state = {
        livesearch : {
          input_value : this.$elem.val(),
          results : results
        }
      };

      if (this.replacing_history_state) {
        window.history.replaceState(state);
        this.replacing_history_state = false;
      } else {
        window.history.pushState(state, "", '?' + this.livesearch.last_search);
      }
    },
      this.$results.slideDown(function () {
        $(window).resize();
        _this.$results.trigger('sticky_bar:fix_to_bottom');
      });
    },

    unselect_currently_selected: function () {
      var $results_ul = this.$results.children('ul'),
        $last_selected = $results_ul.children('li.selected');
      $last_selected.trigger('livesearch:unselect');
      $last_selected.removeClass('selected');
      // We're here because of a mouseout, or because the user selected something with
      // the keyboard, or clicking. In either case, we don't want to unselect on the
      // next mouseout.
      this.unselect_on_mouseout = false;
    },

    // There are two kinds of selects:
    // - Hard selects, these are triggered by clicks or the enter key. They
    //   trigger the select event.
    // - Soft selects, these are triggered by arrowing up or down. They do not
    //   trigger the select event.
    select: function ($li, trigger) {
      var _this = this,
        $results_ul = this.$results.children('ul');

      if ($li.is('.not_result')) { return; }

      this.unselect_currently_selected();

      $li.addClass('selected');

      if (this.options.update_input) {
        this.livesearch.suspend_while(function () {
          _this.$elem.val($li.text());
          _this.$elem.focus();
        });
      }
      $li.trigger('livesearch:soft_select');
      if (trigger) {
        $li.trigger('livesearch:selected', [$li.data('livesearch_result')]);
      }
    }
  });

}(jQuery));

