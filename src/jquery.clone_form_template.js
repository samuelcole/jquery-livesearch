(function ($) {
  $.fn.clone_form_template = function (options) {
    return $(this).map(function () {
      return update($(this).clone(), options)[0];
    });
  };

  // updates a template clone according to conventions
  function update($clone, options) {
    var index = new Date().getTime();

    $clone.find('label,input,textarea,select').each(function (i, obj) {
      update_attrs($(obj), index, options);
    });

    return $clone.removeClass('template').show();
  }

  function update_attrs($element, identifier, options) {
    if ($element.attr('id')) {
      $element.attr('id',
        $element.attr('id').replace(/_-?\d+_/, '_' + identifier + '_')
      );
    }
    if ($element.attr('for')) {
      $element.attr('for',
        $element.attr('for').replace(/_-?\d+_/, '_' + identifier + '_')
      );
    }
    if ($element.attr('name')) {
      if (options.copy_values) {
        $element.val($('[name="' + $element.attr('name') + '"]').val());
      }
      $element.attr('name',
        $element.attr('name').replace(/\[-?\d+\]/, '[' + identifier + ']')
      );
    }
  }
}(jQuery));
