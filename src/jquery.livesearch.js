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
  this.options = $.extend({
    delay: 400,
    minimum_characters: 3,
    serialize: this.$form,
    client_side_cache: true,
    process_data: false
  }, options);
  this.last_search = false;
  this.search_xhr;
  if(this.options.client_side_cache) {
    this.cache = {};
  } else {
    this.cache = false;
  }
  this.active = true;
  this._attach();
}

$.extend(LiveSearch.prototype, {
  _attach: function() {
    var _this = this;
    
    this.$elem.attr('autocomplete', 'off'); //we got this, yall

    this.$elem.bind("keypress cut paste input", function() {
      if(!_this.active) return;

      clearTimeout(timeout);
      timeout = setTimeout(function() {
        _this.search_for_value();
      }, _this.options.delay);
    });
    this.$elem.bind('livesearch:suspend', function() {
      _this.active = false;
    });
    this.$elem.bind('livesearch:activate', function() {
      _this.active = true;
    });
    this.$elem.bind('livesearch:cancel', function() {
      if(_this.search_xhr) _this.search_xhr.abort();
      _this.last_search = false;
    });
  },

  search_for_value: function() {
    this.search(this.$elem.val());
  },

  suspend_while: function(func) {
    this.active = false;
    func();
    // TODO: this timeout is to to allow events to bubble before re-enabling,
    // but I'm not sure why bubbling doesn't occur synchronously.
    var _this = this;
    setTimeout(function() {
      _this.active = true;
    }, 100);
  },

  search: function(value) {
    var _this = this;

    if(value == this.last_search) return;
    if(value.length < this.options.minimum_characters) return;

    if(this.search_xhr) this.search_xhr.abort();
    
    if(this.cache && this.cache[value]) {
      this.$elem.trigger('livesearch:results', [this.cache[value]]);
    } else {
      this.$elem.trigger('livesearch:searching');
      this.$elem.addClass('searching');

      var data = this.options.serialize.serialize();
      if(this.options.process_data) {
        data = this.options.process_data.apply(this);
      }

      this.search_xhr = $.ajax({
        type: 'get',
        url: this.options.url || this.$form.attr('action'),
        dataType: 'json',
        data: data,
        global: false,
        success: function(data, textStatus, xhr) {
            // this is the best workaround I can think of for
            // http://dev.jquery.com/ticket/6173
            if (data === null) return;

            _this.$elem.trigger('livesearch:results', [data]);
            _this.$elem.removeClass('searching');
            if(_this.cache) {
              _this.cache[value] = data;
            }
          },
        error: function() {
          _this.$elem.trigger('livesearch:ajax_error');
          _this.$elem.removeClass('searching');
        }
      });
    }

    this.last_search = value;
  }

});

})(jQuery);
