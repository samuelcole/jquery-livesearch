(function ($) {
  var DEFAULT_PATTERN = '-1';

  $.fn.clone_form_template = function (options, cb) {
    if (!options) {
      options = {};
    }
    return $(this).map(function () {
      return update($(this).clone(), options, cb)[0];
    });
  };

  // updates a template clone according to conventions
  function update($clone, options, cb) {
    var index = new Date().getTime();

    $clone.find('label,input,textarea,select').each(function (i, obj) {
      update_attrs($(obj), index, options, cb);
    });

    return $clone.removeClass('template').show();
  }

  function update_attrs($element, identifier, options, cb) {
    var pattern = options.pattern || DEFAULT_PATTERN,
      underscore_pattern = new RegExp('_' + pattern + '_'),
      bracket_pattern = new RegExp('\\[' + pattern + '\\]');

    if ($element.attr('id')) {
      $element.attr('id',
        $element.attr('id').replace(underscore_pattern, '_' + identifier + '_')
      );
    }
    if ($element.attr('for')) {
      $element.attr('for',
        $element.attr('for').replace(underscore_pattern, '_' + identifier + '_')
      );
    }
    if ($element.attr('name')) {
      if (options.copy_values) {
        $element.val($('[name="' + $element.attr('name') + '"]').val());
      }
      $element.attr('name',
        $element.attr('name').replace(bracket_pattern, '[' + identifier + ']')
      );
    }
    if (typeof cb === 'function') {
      cb.apply($element, $element);
    }
  }
}(jQuery));
