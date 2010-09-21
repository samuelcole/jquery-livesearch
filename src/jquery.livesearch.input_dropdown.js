
(function($) {
	
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
 
$.fn.livesearch_input_dropdown = function(options) {
  options = options || {};
  return $(this).each(function() {
    var input_dropdown = $(this).data('livesearch.input_dropdown');
		if (!input_dropdown) {
		  input_dropdown = new InputDropdown($(this), options);
			$(this).data('livesearch.input_dropdown', input_dropdown);
		}
  });
};

function InputDropdown($elem, options) {
	this.$elem = $elem;
  
  this.options = $.extend({
    update_input: true,
    no_results_html: 'Sorry, we couldn\'t find anything.'
  }, options);

  if(this.$elem.siblings('.results').length) {
    this.$results = this.$elem.siblings('.results');
    this.$results.find('ul.result_list, div.no_results').remove();
  } else {
    this.$results = $('<div class="results"></div>');
    this.$elem.after(this.$results);
  }
  this.$results.append('<ul class="result_list"></ul>');
  this.$no_results = $('<div class="no_results">' + this.options.no_results_html + '</div>');
  this.$no_results.hide();
  this.$results.append(this.$no_results);

  this.$results.hide();
  this.$results.width(this.$elem.outerWidth());

  this.livesearch = $elem.livesearch(this.options).data('livesearch');
  this._attach();
}

$.extend(InputDropdown.prototype, {
  _attach: function() {
    var _this = this;
    this.$elem.bind('livesearch:results', function(e, results) {
      _this.show_results(results);
    });
    this.$elem.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function(e) {
      var something_selected = !!_this.$results.find('.selected').length;
      switch(e.keyCode) {
        case KEY.UP:
          if(something_selected) {
            var $prev = _this.$results.find('.selected').prev();
            if(!$prev.length) $prev = _this.$results.find('li:last');
            _this.select($prev, false);
          } else {
            _this.select(_this.$results.find('li:last'), false);
          }
          e.preventDefault();
          break;
        case KEY.DOWN:
          if(something_selected) {
            var $next = _this.$results.find('.selected').next();
            if(!$next.length) $next = _this.$results.find('li:first');
            _this.select($next, false);
          } else {
            _this.select(_this.$results.find('li:first'), false);
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
  show_results: function(results) {
    var _this = this;

    var $results_ul = this.$results.children('ul');
    $results_ul.empty();

    if(!results.length) {
      this.$no_results.show();
      $results_ul.hide();
    } else {
      this.$no_results.hide();
      $results_ul.show();
    }

    $.each(results, function(index) {
      var name = this;
      if(this != 'string') {
        name = this[0];
      }
      var $li = $('<li>' + name + '</li>');
      $li.data('livesearch_result', this);
      $results_ul.append($li);
    });

    $results_ul.children('li').click(function() {
      _this.select($(this), true);
    });

    this.$results.slideDown();
  },
  // There are two kinds of selects:
  // - Hard selects, these are triggered by clicks or the enter key. They trigger the select event.
  // - Soft selects, these are triggered by arrowing up or down. They do not trigger the select event.
  select: function($li, trigger) {
    var _this = this;
    var $results_ul = this.$results.children('ul');
    $results_ul.children('li').removeClass('selected').css('font-weight', 'normal');
    $li.addClass('selected');
    $li.css('font-weight', 'bold');

    if(this.options.update_input) {
      this.livesearch.suspend_while(function() {
        _this.$elem.val($li.text());
      });
    }

    if(trigger) this.$elem.trigger('livesearch:selected', [$li.data('livesearch_result')]);
  }
});

})(jQuery);
