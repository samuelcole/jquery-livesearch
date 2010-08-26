$(function() {
  $('input').livesearch();
  $('form').bind('livesearch:results', function(e, results) {
    console.log(results);
  });
});
