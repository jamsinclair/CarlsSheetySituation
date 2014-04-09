<?php 

// Very very basic email script, was in a hurry =p

// Quick html trim and escape
function html ($data) {
  return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}

// When form posted
if (isset($_POST['contactme'])) {
  // filter posts
  $name = !empty($_POST['name']) ? html($_POST['name']) : null;
  $email = !empty($_POST['email']) ? html($_POST['email']) : null;
  $phone = !empty($_POST['phone']) ? html($_POST['phone']) : null;
  $message = !empty($_POST['message']) ? html($_POST['message']) : null;
  
  // Quick and dirty field validation, I'm ashamed
  if (empty($name) || empty($email) || empty($message)) {
    // Echo response
    echo "<p class='error'>Please fill in the required fields</p>";
    exit();
  }
  
  // Set Email parameters
  $to = "desired email here";
  $subject = "Contact Query from Carl's Sheety Situation - " . substr($name,0,25);
  // Email message
  $emailMsg = "<html><body>";
  $emailMsg .= "<h1>Query from Carl's Sheety Situation</h1>";
  $emailMsg .= "<p><b>Name:</b> " . $name . "<br />";
  $emailMsg .= "<b>Email:</b> " . $email . "<br />";
  $emailMsg .= "<b>Phone:</b> " . $phone . "<br />";
  $emailMsg .= "<b>Message:</b> <br> " . $message . "</p>";
  $emailMsg .= "</body></html>";
  // Email headers
  $headers = "From: " . $email . "\r\n";
  $headers .= "Reply-To: ". $email . "\r\n";
  $headers .= "MIME-Version: 1.0\r\n";
  $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";
  
  // Attempt to send email
  if (mail($to, $subject, $emailMsg, $headers)) {
    // Success
    $mailSent = "<p class='success'>Your message was sent successfully, we'll be in contact soon.</p>";
  } else {
    // Error
    $mailSent = "<p class='error'>Oops there was a problem sending your message, please try again.</p>";
  }
  
  // Echo result for ajax response
  echo $mailSent;
  exit();
} else {
  // Redirect unless page receives post request
  header("Location: index.html");
}


?>