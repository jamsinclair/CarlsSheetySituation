function checkCssFiles() {
  var i,j, fileCount=0, cssItem, cssLink;
  // Loop though and find files in local storage;
  for (i=1; i<=7; i++) {
    cssItem = localStorage.getItem('css'+i);
    if(!isEmpty(cssItem)) {
      // Item exists in local storage
      fileCount+=1;
      // Create css link for css file
      cssLink = document.createElement('link');
      cssLink.id = 'css' + i;
      cssLink.rel = 'stylesheet';
      cssLink.type = 'text/css';
      cssLink.href = 'css/' + cssItem;
      
      // See if css file already added to page
      if(isEmpty(document.getElementById('css' + i))) {
        console.log(cssItem + ' file does not exist');
        // CSS file is not yet added to page 
        for (j=i-1; j>=0; j-=1) {
          
          // Is there a 'To Find List'?
          if (document.getElementById('find-list')) {
          // Strikethrough found css file in 'To Find List'
            if(document.getElementById('csslist'+i))
              document.getElementById('csslist'+i).style.textDecoration = 'line-through';
          }
          
          // Loop through to ensure correct css heirachy and append css file after file before
          if(!isEmpty(document.getElementById('css'+j))) { 
            insertAfter(document.getElementById('css'+j), cssLink); 
            console.log('file appended after id css' + j);
            break;
          } else if (j === 1 || j === 0) {
            // Uh oh, no css files before, append at end of head tag
            insertAfter(document.getElementById('css-after-here'), cssLink); 
            console.log('no css files before, append at end');
            break;
          }
        }
      }
    }
  }
  // Return total of found files
  return fileCount;
}

/* isEmpty and insertAfter functions taken from stackoverflow help threads, I'm assuming it's okay to use them without reference */

function isEmpty(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}

function insertAfter(referenceNode, newNode) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}


// Page init
$(document).ready(function(){
  'use strict';
  //set vars
  var mToggle = 0,
      iToggle = 0; 
  
  checkCssFiles();
  
  // Add main element display block for older browsers (e.g. IE10 =( )
  $('main').css("display", "block");

    
  //hide any to hide outline headings
  $('.txt-hide, .toggle-info').hide();
  $('.rotate-arrow').css("display", "inline-block");
  
  //toggle menu when menu button clicked
  $('#menu-btn').on('click', function(){
    if(mToggle) {
      //hide the menu
      $('body').animate({top: "0"}, 600);
      mToggle = 0;
    } else {
      //show menu
      $('body').animate({top: "12.5em"}, 600);
      mToggle = 1;
    }
  });
  
  // Functions for Game Page
  if ($('#game-canvas')[0]) { 
    // Intitalise the Game
    Game.init();

    //toggle show info when clicked
    $('#info-btn').on('click', function(){
      if(iToggle) {
        //set the info btn's arrow back to normal
        $('.rotate-arrow').css('transform', 'rotate(0deg)');
        //hide the info text
        $('.toggle-info').slideUp();
        iToggle = 0;
      } else {
        //rotate info btn's arrow
        $('.rotate-arrow').css('transform', 'rotate(90deg)');
        //show info text
        $('.toggle-info').slideDown();
        iToggle = 1;
      }
    });
  }
});