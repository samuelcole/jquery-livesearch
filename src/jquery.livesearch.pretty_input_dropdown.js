(function ($) {

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
 *     <span class='ss-icon ss-search'></span>
 *     <span class='ss-icon ss-delete'></span>
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

  $.fn.livesearch_pretty_input_dropdown = function (options) {
    options = options || {};
    return $(this).each(function () {
      var $form = $(this),
        $text = $form.find('input[type=text]'),
        $icon_search_clear = $form.find('.ss-delete'),
        $search_loading_icon = $text.siblings('.ss-search'),
        input_dropdown;

      $text.livesearch_input_dropdown($.extend(options, {update_input : false}));
      input_dropdown = $text.data('livesearch.input_dropdown');

      function handle_close_button() {
        if (this.value) {
          $icon_search_clear.show();
        } else {
          $icon_search_clear.hide();
        }
      }

      handle_close_button.call($text[0]);

      $text.on('keypress cut paste input livesearch:close_results blur', handle_close_button);

      $text.on('livesearch:searching', function () {
        $search_loading_icon.removeClass('ss-search').addClass('icon-loading-small');
      });

      $text.on('livesearch:results livesearch:ajax_error', function () {
        $search_loading_icon.removeClass('icon-loading-small').addClass('ss-search');
      });

      $text.on('livesearch:results', function () {
        // if this option is set, assume we want the cursor to stay in the input after search is done
        if (options.input_can_submit_on_enter) {
          return;
        }
        var $results = $text.siblings('.results');
        input_dropdown.select($results.find('li:first'));
      });

      function clear_results() {
        $text.val('');
        $text.trigger('livesearch:cancel').trigger('livesearch:close_results');
      }

      $icon_search_clear.on('click', function () {
        $text.focus();
        clear_results();
      });

      $text.on('livesearch:close_results', function () {
        $text.siblings('.results').slideUp(function () {
          $(window).resize();
          $(this).trigger('sticky_bar:fix_to_bottom');
        });
      });

      $text.on('blur', function () {
        if ($text.val().length < 3) {
          clear_results();
        }
      });

    });
  };

}(jQuery));
