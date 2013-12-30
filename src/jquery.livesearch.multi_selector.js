/*
 * dependencies: jquery.clone_form_template.js
 */

(function ($) {

  $.fn.livesearch_multi_selector = function (options) {
    options = $.extend({
      url: false,
      cancel_copy: 'Remove',
      sortable: false,
      update_input: false
    }, options);

    return $(this).each(function () {
      var $div = $(this),
        $field_with_icon = $div.find('.field_with_icon'),
        $input = $field_with_icon.find('input.text'),
        $list = $div.find('ol.search-selected,ul.search-selected'),
        $search_loading_icon = $input.siblings('.ss-search'),
        $template = $div.find('.template'),

        this_options = options,
        input_dropdown;

      this_options.url = options.url || $div.closest('form').attr('action');
      input_dropdown = $input.livesearch_input_dropdown(this_options);

      if (options.sortable) {
        $list.sortable({
          containment: 'document',
          axis: 'y',
          update: function () {
            $list.find('input.position').each(function (i) {
              $(this).val(i);
            });
          }
        });
      }

      function unselectable($li) {
        var $cancel = $('<a class="ss-icon ss-delete cancel-link" href="#">' + options.cancel_copy + '</a>');
        $li.append($cancel);
      }

      function reset() {
        $input.val('');
        $field_with_icon.siblings('.results').slideUp();
        $input.trigger('livesearch:cancel');
      }

      $div.addClass('search');

      $list.find('li').each(function () {
        unselectable($(this));
      });

      $div.on('click', 'a.cancel-link', function (e) {
        var $li = $(this).closest('li'),
          $destroy = $li.find('.destroy');

        e.preventDefault();
        $li.fadeOut(function () {
          if (!$destroy.length) { //new record
            $li.remove();
          } else {
            $destroy.val('1');
          }
        });
      });

      $input.on('livesearch:searching', function () {
        $search_loading_icon.removeClass('ss-search').addClass('icon-loading-small');
      });

      $input.on('livesearch:results livesearch:ajax_error', function () {
        $search_loading_icon.removeClass('icon-loading-small').addClass('ss-search');
      });

      $div.on('livesearch:selected', function (e, data) {
        if (!data) { return; }

        var $li = $template.clone_form_template();

        $li.find('input.destroy').val(false);

        // embed search values
        $li.find('.name').html(data[0]);
        $li.find('.value').val(data[1]);

        $list.append($li);

        // update positions
        if (options.sortable) {
          $list.find('input.position').each(function (i) {
            $(this).val(i);
          });
        }

        reset();
      });
    });
  };

}(jQuery));
