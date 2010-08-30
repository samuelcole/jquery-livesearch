
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

  this.$results = $('<div class="results" style="position: absolute; background-color: white"><ul></ul></div>');
  this.$elem.after(this.$results);
  this.$results.width(this.$elem);
  this.$results.hide();

  this.livesearch = $elem.livesearch().data('livesearch');
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
            _this.select(_this.$results.find('.selected').prev());
          } else {
            _this.select(_this.$results.find('li:last'));
          }
          e.preventDefault();
          break;
        case KEY.DOWN:
          if(something_selected) {
            _this.select(_this.$results.find('.selected').next());
          } else {
            _this.select(_this.$results.find('li:first'));
          }
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
      _this.select($(this));
    });

    this.$results.slideDown();
  },
  select: function($li) {
    var _this = this;
    var $results_ul = this.$results.children('ul');
    $results_ul.children('li').removeClass('selected').css('font-weight', 'normal');
    $li.addClass('selected');
    $li.css('font-weight', 'bold');

    this.livesearch.suspend_while(function() {
      _this.$elem.val($li.text());
    });

    this.$elem.trigger('livesearch:selected', [$li.data('livesearch_result')]);
  }
});

})(jQuery);
