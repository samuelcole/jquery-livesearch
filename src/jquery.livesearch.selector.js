(function ($) {

  $.fn.livesearch_selector = function (options) {
    options = $.extend({url: false, cancel_copy: 'Cancel', target_input: false}, options);
    return $(this).each(function () {
      var $div = $(this),
        $input = $div.find('input[type="text"]'),
        $hidden_input = options.target_input || $div.find('input[type="hidden"]'),
        $search_loading_icon = $input.siblings('.icon-search'),
        input_dropdown;
      
      $div.addClass('search');

      function select() {
        $input.hide();
        $input.attr('disabled', 'disabled');
        $input.siblings('.icon-search-clear, .icon-search').hide();
        var $value_div = $('<div class="field-selected"><span class="value">' + $input.val() + '</span><a class="cancel-link" href="#">' + options.cancel_copy + '</a></div>');
        $input.siblings('div.field-selected').remove();
        $input.after($value_div);
        $input.siblings('.results').slideUp();
        $input.trigger('livesearch_selector:select', [ $input.val() ]);

        $value_div.find('a.cancel-link').click(function (e) {
          e.preventDefault();
          $input.val('');
          $value_div.remove();
          $input.removeAttr('disabled');
          $input.siblings('.icon-search-clear, .icon-search').show();
          $input.show();
          $input.focus();
          $hidden_input.val('');
          $input.trigger('dirty');
          $input.trigger('livesearch_selector:unselect');
        });
      }

      //if the page loads with values in the inputs, switch to selected state
      if ($hidden_input.val() && $input.val()) {
        select();
      }

      options.url = options.url || $div.closest('form').attr('action');
      input_dropdown = $input.livesearch_input_dropdown(options);
      
      $input.bind('livesearch:searching', function () {
        $search_loading_icon.removeClass('icon-search').addClass('icon-loading-small');
      });
      
      $input.bind('livesearch:results livesearch:ajax_error', function () {
        $search_loading_icon.removeClass('icon-loading-small').addClass('icon-search');
      });
      
      $input.bind('livesearch:results', function () {
        var $results = $input.siblings('.results');
        input_dropdown.select($results.find('li:first'));
      });

      $div.bind('livesearch:selected', function (e, data) {
        if (!data) {
          return;
        }
        $hidden_input.val(data[1]);
        select();
      });
    });
  };

}(jQuery));
