(function($) {

$.fn.livesearch_selector = function(options) {
  options = $.extend({url: false, cancel_copy: 'Cancel', target_input: false}, options);
  return $(this).each(function() {
    var $div = $(this);
    var $input = $div.find('input[type="text"]');
    var $hidden_input = options.target_input || $div.find('input[type="hidden"]');
    
    $div.addClass('search');

    function select() {
      $input.hide();
      $input.attr('disabled', 'disabled');
      var $value_div = $('<div><span class="value">' + $input.val() + '</span><a class="cancel-link" href="#">' + options.cancel_copy + '</a></div>');
      $input.after($value_div);
      $input.siblings('.results').slideUp();
      $input.trigger('livesearch_selector:select');

      $value_div.find('a.cancel-link').click(function(e) {
        e.preventDefault();
        $input.val('');
        $value_div.remove();
        $input.removeAttr('disabled');
        $input.show();
        $input.focus();
        $hidden_input.val('');
        $input.trigger('livesearch_selector:unselect');
      });
    }

    //if the page loads with values in the inputs, switch to selected state
    if($hidden_input.val() && $input.val()) {
      select();
    }

    options.url = options.url || $div.closest('form').attr('action');
    $input.livesearch_input_dropdown(options);

    $input.bind('livesearch:selected', function(e, data) {
      if (data) $hidden_input.val(data[1]);
      select();
    });
  });
};

})(jQuery);
