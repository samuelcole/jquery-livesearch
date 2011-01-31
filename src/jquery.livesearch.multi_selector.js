(function($) {

$.fn.livesearch_multi_selector = function(options) {
  options = $.extend({url: false, cancel_copy: 'Remove'}, options);
  return $(this).each(function() {
    var $div = $(this);
    var $input = $div.find('input[type="text"]');
    var $list = $div.find('ol.search-selected,ul.search-selected');
    var $search_loading_icon = $input.siblings('.icon-search');
    var name = $input.attr('name');
    
    var this_options = options;
    this_options.url = options.url || $div.closest('form').attr('action');
    var input_dropdown = $input.livesearch_input_dropdown(this_options);
    
    function unselectable($li) {
      $cancel = $('<a class="cancel-link" href="#">' + options.cancel_copy + '</a>');
      $li.append($cancel);
      $cancel.click(function(e) {
        e.preventDefault();
        $li.remove();
      });
    }
    
    function reset() {
      $input.val('');
      $input.siblings('.results').slideUp();
    }
    
    $div.addClass('search');
    $input.attr('name', '');
    
    $list.find('li').each(function() {
      unselectable($(this));
    });

    $input.bind('livesearch:searching', function() {
      $search_loading_icon.removeClass('icon-search').addClass('icon-loading-small');
    });
    
    $input.bind('livesearch:results livesearch:ajax_error', function() {
      $search_loading_icon.removeClass('icon-loading-small').addClass('icon-search');
    });
    
    $div.bind('livesearch:selected', function(e, data) {
      if (!data) return;
      $li = $('<li>' + data[0] + '<input type="hidden" name="' + name + '" value="' + data[1] + '"/></li>');
      $list.append($li);
      unselectable($li);
      reset();
    });
  });
};

})(jQuery);
