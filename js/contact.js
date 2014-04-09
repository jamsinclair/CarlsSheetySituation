// Basic  jquery ajax method, it feels like cheating
// Used http://stackoverflow.com/questions/5004233/jquery-ajax-post-example-with-php as model


$(document).ready(function(){
  var request;
  
  $('#contact-form').on('submit', function(evt){
    var $form, $inputs, serializedData;
    
    // Set loading gif
    $("#response-box").html("Sending... <img alt='sending' src='images/loading.gif' >");
    
    // Abort any pending requests
    if (request) {
      request.abort();
    }
    
    // Store form elemeent
    $form = $(this);
    // Select and cache all of it's fields
    $inputs = $form.find("input, select, button, textarea");
    // Serialize the data in the form
    serializedData = $form.serialize();
    
    // Disable inputs during request
    $inputs.prop("disabled", true);
    
    // Send request
    request = $.post("./contact-process.php", serializedData);
    
    // Success handler
    request.done(function (response, textStatus, jqXHR){
        // Display response text
        $("#response-box").html(response);
        // Clear form inputs
        $form[0].reset();
    });

    // Failure handler
    request.fail(function (jqXHR, textStatus, errorThrown){
        $("#response-box").html("<p class='error'>Ooops an error occurred, please try again</p>");
    });

    // Re-enable inputs
    request.always(function () {
        $inputs.prop("disabled", false);
    });
    
    
    // Prevent form submit
    evt.preventDefault();
  });
  
});