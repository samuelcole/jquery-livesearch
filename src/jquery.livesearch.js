(function($) {

//The timeout has to live in this scope
var timeout;

$.fn.livesearch = function(options) {
  options = options || {};
  return $(this).each(function() {
    var livesearch = $(this).data('livesearch');
		if (!livesearch) {
		  livesearch = new LiveSearch($(this), options);
			$(this).data('livesearch', livesearch);
		}
  });
};

function LiveSearch($elem, options) {
	this.$elem = $elem;
  this.$form = $elem.closest('form');
  this.options = $.extend({ delay: 400, minimum_characters: 3 }, options);
  this.last_search = false;
  this.search_xhr;
  this.cache = {};
  this.active = true;
  this._attach();
}

$.extend(LiveSearch.prototype, {
  _attach: function() {
    var _this = this;
    this.$elem.bind("keypress cut paste input", function() {
      if(!_this.active) return;

      clearTimeout(timeout);
      timeout = setTimeout(function() {_this.search_for_value();}, _this.options.delay);
    });
    this.$form.bind("submit", function(e) {
      if(!_this.active) return;

      clearTimeout(timeout);
      _this.search_for_value();
    });
    this.$elem.bind('livesearch:suspend', function() {
      _this.active = false;
    });
    this.$elem.bind('livesearch:activate', function() {
      _this.active = true;
    });
  },

  search_for_value: function() {
    this.search(this.$elem.val());
  },

  suspend_while: function(func) {
    this.active = false;
    func();
    // TODO: this timeout is to to allow events to bubble before re-enabling, but I'm not sure
    // why bubbling doesn't occur synchronously.
    setTimeout(function() {
      this.active = true;
    }, 100);
  },

  search: function(value) {
    var _this = this;
    
    if(value == this.last_search) return;
    if(value.length < this.options.minimum_characters) return;

    if(this.search_xhr) this.search_xhr.abort();
    
    if(this.cache[value]) {
      this.$elem.trigger('livesearch:results', [this.cache[value]]);
    } else {
      this.search_xhr = $.get(this.$form.attr('action'), this.$form.serialize(), function(data) {
        _this.$elem.trigger('livesearch:results', [data]);
        _this.cache[value] = data;
      }, 'json');
    }

    this.last_search = value;
  }

});

})(jQuery);
