
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
 
$.fn.livesearch.input_dropdown = function(options) {
  options = options || {};
  return $(this).each(function() {
    var input_dropdown = $(this).data('livesearch.input_dropdown');
		if (!livesearch) {
		  input_dropdown = new InputDropdown($(this), options);
			$(this).data('livesearch.input_dropdown', livesearch);
		}
  });
};

function InputDropdown($elem, options) {
	this.$elem = $elem;

  this.$results = $('<div class="results" style="position: absolute;"><ul></ul></div>');
  this.$elem.after(this.$results);
  this.$results.width(this.$elem);
  this.$results.hide();

  this.livesearch = $elem.livesearch().data('livesearch');
  this._attach();
}

$.extend(InputDropdown.prototype, {
  _attach: function() {
    var _this = this;
    this.$elem.bind('live_search:results', function(e, results) {
      _this.show_results(results);
    });
    this.$elem.bind(($.browser.opera ? "keypress" : "keydown") + ".autocomplete", function(e) {
      switch(e.keyCode) {
        case KEY.UP:
          _this.select(_this.$results.find('selected').prev());
          break;
        case KEY.down:
          _this.select(_this.$results.find('selected').next());
          break;
        default:
          break;
      }
    });
  },
  show_results: function(results) {
    var _this = this;
    var $results_ul = this.$results.children('ul');

    $.each(results, function() {
      $results_ul.append('<li>' + this + '</li>');
    });

    this.select($results_ul.children(':first'));

    $results_ul.children('li').click(function() {
      _this.select($(this));
    });

    this.$results.slideDown();
  },
  select: function($li) {
    this.$results_ul.children('li').removeClass('selected');
    $li.addClass('selected');
    $li.css('font-weight', 'bold');
    this.$elem.val($li.text());
  }
});

})(jQuery);
