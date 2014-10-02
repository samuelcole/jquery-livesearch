(function ($) {
  $.fn.clone_form_template = function () {
    return $(this).map(function () {
      return update($(this).clone())[0];
    });
  };

  // updates a template clone according to conventions
  function update($clone) {
    var index = new Date().getTime();

    $clone.find('label,input,textarea,select').each(function (i, obj) {
      update_attrs($(obj), index);
    });

    return $clone.removeClass('template').show();
  }

  function update_attrs($element, identifier) {
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
      $element.val($('[name="' + $element.attr('name') + '"]').val());
      $element.attr('name',
        $element.attr('name').replace(/\[-?\d+\]/, '[' + identifier + ']')
      );
    }
  }
}(jQuery));
