(function($) {

/*
 * Behavior:
 *
 * A user starts typing into an input, when they stop typing, a list of matching pages are
 * displayed. The user can select an entry with the up and down arrow key and hit enter,
 * or they can click a result. When a result is selected, the corresponding url is navigated
 * to.
 *
 * Requirements:
 * 
 * jquery.livesearch
 * jquery.livesearch.input_dropdown
 *
 * Expected markup:
 *
 * <form>
 *   <div>
 *     <span class='icon-search'></span>
 *     <span class='icon-search-clear'></span>
 *     <input></input>
 *     <div class='results'></div>
 *   </div>
 * </form>
 *
 * Expected JSON response from the XHR:
 *
 * [
 *   ['Title of page', 'http://url/'],
 *   ['Title of another page', 'http://url2/']
 * ]
 *
 */

$.fn.livesearch_navigator = function(options) {
  options = options || {};
  return $(this).each(function() {
    var $form = $(this);
    var $text = $form.find('input');
    var $icon_search_clear = $form.find('.icon-search-clear');
    var $search_loading_icon = $text.siblings('.icon-search');

    $text.livesearch_input_dropdown($.extend(options, {update_input:false}));
    var input_dropdown = $text.data('livesearch.input_dropdown');

    $text.bind('livesearch:selected', function(e, data) {
      if(data) window.location = data[1];
    });

    $text.bind('keypress cut paste input', function() {
      var $this = $(this);
      if(this.value) {
        $icon_search_clear.show();
      } else {  
        $icon_search_clear.hide();
      }
    });

    $text.bind('livesearch:searching', function() {
      $search_loading_icon.removeClass('icon-search').addClass('icon-loading-small');
    });
    
    $text.bind('livesearch:results livesearch:ajax_error', function() {
      $search_loading_icon.removeClass('icon-loading-small').addClass('icon-search');
    });

    $text.bind('livesearch:results', function() {
      var $results = $text.siblings('.results');
      input_dropdown.select($results.find('li:first'));
    });
    
    $icon_search_clear.bind('click', function() {
      $text.val('');
      $text.blur();
    });

    $text.bind('blur', function() {
      if($text.val().length < 3) {
        $text.val('');
        $text.trigger('livesearch:cancel');
        $text.siblings('.results').slideUp();
      }
    });
  });
};

})(jQuery);
