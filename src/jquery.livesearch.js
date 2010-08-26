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
  this.options = $.extend({ delay: 400 }, options);
  this.search_xhr;
  this._attach();
}

$.extend(LiveSearch.prototype, {
  _attach: function() {
    var _this = this;
    this.$elem.bind("keypress cut paste input", function() {
      clearTimeout(timeout);
      timeout = function() { _this.search_for_value(); };
      setTimeout(timeout, _this.options.delay);
    });
    this.$form.bind("submit", function(e) {
      e.preventDefault();
      clearTimeout(timeout);
      _this.search_for_value();
    });
  },

  search_for_value: function() {
    this.search(this.$elem.val());
  },

  search: function(value) {
    var _this = this;
    if(this.search_xhr) this.search_xhr.abort();
    this.search_xhr = $.get(this.$form.attr('action'), this.$form.serialize(), function(data) {
      _this.$elem.trigger('livesearch:results', [data]);
    }, 'json');
  }

});

})(jQuery);
