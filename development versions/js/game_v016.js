// Ponder: render images once and save as image when not dynamic?
window.Game = {};

/*  
* A shim by Paul Irish,  
* incase requestAnimationFrame not supported by browser 
*/
window.requestAnimFrame = (function (callback) {
  return window.requestAnimationFrame || 
         window.webkitRequestAnimationFrame || 
         window.mozRequestAnimationFrame || 
         window.oRequestAnimationFrame || 
         window.msRequestAnimationFrame ||
         function(callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();

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
          // Strikethrough found css file in 'To Find List'
          if(document.getElementById('csslist'+i))
            document.getElementById('csslist'+i).style.textDecoration = 'line-through';
          
          // Loop through to ensure correct css heirachy and append css file after file before
          if(!isEmpty(document.getElementById('css'+j))) { 
            insertAfter(document.getElementById('css'+j), cssLink); 
            console.log('file appended after id css' + j);
            break;
          } else if (j === 1 || j === 0) {
            // Uh oh, no css files before, append at end of head tag
            insertAfter(document.getElementById('afterhere'), cssLink); 
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

/**********************************************/
/*****-----Player Object and Methods-----******/
/**********************************************/
(function() { 
  var player = {
    cursor: {
      x: 10,
      y: 10,
      height: 33,
      width: 20,
      speed: 300,
      type:'directional'
    },
    
    //Coords for Cursor Images
    cImage: {
      normal: {
        image: cursorImages.normal,
        rotate: false
      },
      directional: {
        image: cursorImages.directional,
        rotate: 'left'
      },
      drag: {
        image: cursorImages.drag,
        rotate: false
      }
    },
    state: 'static',
    hasFile:  false,
    file: null
  };
  
  // Update cursor image depending on where it is on the map
  player.updateCursorImage = function(camera) {
    var tlStop, trStop, blStop, brStop;
    // Default set to directional cursor image
    this.cursor.type = "directional";
    
    //check if camera stopped scrolling at a corner
    tlStop = (camera.moveStop.top && camera.moveStop.left)? true : false; 
    trStop = (camera.moveStop.top && camera.moveStop.right)? true : false; 
    blStop = (camera.moveStop.bottom && camera.moveStop.left)? true : false; 
    brStop = (camera.moveStop.bottom && camera.moveStop.right)? true : false; 
    
    
    if (this.hasFile) {
      this.cursor.type = "drag";
    }
    
    // Change cursor rotaton if cursor is in the move zone
    // Check when x less than left move zone
    else if(this.cursor.x < camera.xMoveZone ) {
      if(this.cursor.y < camera.yMoveZone && !tlStop) {
        this.cImage.directional.rotate = "top-left";
      } else if(this.cursor.y > camera.hView - camera.yMoveZone  && !blStop) {
        this.cImage.directional.rotate = "bottom-left";
      } else if(!camera.moveStop.left) {
        this.cImage.directional.rotate = "left";
      } else {
        this.cursor.type="normal";
      }
    }
    // Check when x greater than right move zone
    else if(this.cursor.x > camera.wView - camera.xMoveZone && !trStop) {
      if(this.cursor.y < camera.yMoveZone) {
        this.cImage.directional.rotate = "top-right";
      } else if(this.cursor.y > camera.hView -camera.yMoveZone && !brStop) {
        this.cImage.directional.rotate = "bottom-right";
      } else if(!camera.moveStop.right) {
        this.cImage.directional.rotate = "right";
      } else {
        this.cursor.type="normal";
      }
    }
    // Check y axis
    else if(this.cursor.y < camera.yMoveZone && !camera.moveStop.top) {
      this.cImage.directional.rotate = "top";
    } else if(this.cursor.y > camera.hView - camera.yMoveZone && !camera.moveStop.bottom) {
      this.cImage.directional.rotate = "bottom";
    }   
    // Must be normal cursor
    else {
      this.cursor.type="normal";
    }
        
  };
  
  // Updates player position, state etc.
  player.update = function(time, camera) {
    //when cursor is moving 
    if(this.state === 'moving') {
      var t, m, points;
      m = this.moveData;
      
      //find t, t = (current time-startTime) / travel time 
      t = (time - m.startTime) / m.travTime;
      
      //when t more than 1, movement finished, change state to static
      if(t >= 1) {
        this.state = 'static';
        this.cursor.x = m.x2;
        this.cursor.y = m.y2;
        
      //else find current coords of x and y with bezier function
      } else {
        points = quadBezierCoord(m.x0,m.y0,m.x1,m.y1,m.x2,m.y2,t);
        this.cursor.x = points.x;
        this.cursor.y = points.y;
      }
    }
    this.updateCursorImage(camera);
  };
  
  
  
  
  // This function finds the 3 main x,y coordinates so can move the cursor in a smooth path
  player.moveCursor = function(finalX, finalY) {
    var cursor=this.cursor,ctrlPointX, ctrlPointY, dX, dY, dist1, dist2, totalDist, travTime;
    
    //find the difference between each x coord and y coord
    dX = Math.abs(finalX - cursor.x);
    dY = Math.abs(finalY - cursor.y);
    
    //calculate  2nd vector coords
    if (dX > dY) {
      //x has a greater difference than the y coords
      //set y ctrlPoint coord to finalY location
      ctrlPointY = finalY;
      //to find the coord of ctrlPointX
      //if current x > then final x, subtract dY else add the dY
      ctrlPointX = cursor.x + ((cursor.x > finalX) ? -dY : dY); 
      
    } else {
      //y has a greater difference than the x coords
      //set x ctrlPoint coord to finalX location
      ctrlPointX = finalX;
      //to find the coord of ctrlPointY
      //if current y > then final y, subtract dX else add the dX
      ctrlPointY = cursor.y + ((cursor.y > finalY) ? -dX : dX); 
    }
    
    /* 
    * Calculate the distance to final coord using vectors
    * Find distance using pythagorus's c^2 = a^2 + b^2
    */
    dist1 = Math.sqrt(Math.pow(ctrlPointX - cursor.x,2) + Math.pow(ctrlPointY - cursor.y,2));
    dist2 = Math.sqrt(Math.pow(finalX - ctrlPointX, 2) + Math.pow(finalY - ctrlPointY, 2));
    totalDist = dist1 + dist2;
    
    /* 
    *  calcuate time to travel total distance
    *  time = distance / velocity
    */
    travTime = totalDist / this.cursor.speed;
    
    //set coords and time properties
    this.moveData = {
      x0 : cursor.x,
      x1 : ctrlPointX,
      x2 : finalX,
      y0 : cursor.y,
      y1 : ctrlPointY,
      y2 : finalY,
      startTime : (Date.now() / 1000),
      travTime : travTime
    };
    
    // Change state to moving
    this.state = 'moving';
  };
  
  // Draw the player's cursor
  player.drawCursor = function(ctx) {
    var x,y,direcImg;
    x = this.cursor.x;
    y = this.cursor.y;
    
    if(this.cursor.type === 'drag') {
      ctx.drawImage(this.cImage.drag.image, x-20, y-20);
    } else if (this.cursor.type === 'directional') {
      direcImg = this.cImage.directional.image[this.cImage.directional.rotate];
      ctx.drawImage(direcImg,x,y);
    } else {
      ctx.drawImage(this.cImage.normal.image, x, y);
    }
  };
  
  
  // Is player's cursor within an object on double click/tap?
  player.inObject = function(xView, yView, map) {
    var cursorRect, objs;
    cursorRect = new Rectangle(this.cursor.x+xView, this.cursor.y+yView,1,1);
    // Does map have any objects?
    if (!isEmpty(map.mapObjects)) {
      objs = map.mapObjects;
      // Loop through it's objects
      for(var prop in objs) {
        if(cursorRect.within(objs[prop].rect) || cursorRect.overlaps(objs[prop].rect)) {
          // Cursor is within an object, return the objects name,type,fileId
          return {
            name: objs[prop].name,
            type: objs[prop].type,
            fileId: objs[prop].fileId
          };
        }  
      }
      return false;
    } else {
      return false;
    }
  };
  
  player.pickUpFile = function(obj, map) {
    // Pick up file and delete it from map objects
    console.log('Picked up file ' + map.mapObjects[obj.name].name + ' at ' + map.mapObjects[obj.name].x + ', ' + map.mapObjects[obj.name].y);
    
    this.cursor.type = 'drag';
    this.hasFile = true;
    this.file = map.mapObjects[obj.name];
    delete map.mapObjects[obj.name];
  };
  
  player.placeFile = function(xView, yView, map) {
    var x,y;
    // Find cursors coords relative to map
    x = Math.round(player.cursor.x) + xView -25;
    y = Math.round(player.cursor.y) + yView -30;
    
    // Place the file the player is carrying back onto map
    map.setMapObject(x,y,this.file.name, this.file.type, this.file.fileId);
    
    console.log('Placed file ' + this.file.name + ' at ' + x + ', ' + y);
    
    // Update player properties
    this.cursor.type = 'normal';
    this.hasFile = false;
    this.file = null;
  };
  
  
  player.dropOffFile = function() {
    var count;
    // Drop the file off and record file found in localStorage
    console.log('Dropped off ' + this.file.name + ' in ' + this.file.name + ' folder');
  
    // Code here.... update web storage/dynamically load css etc?
    localStorage.setItem(this.file.fileId, this.file.name);
    // Update page css files, returns total files found
    count = checkCssFiles();
    
    
    // Update player properties
    this.cursor.type = 'normal';
    this.hasFile = false;
    this.file = null;
    
    // Return the amount of files found
    return count;
  };
  
  // Assign Player object to the Game module
  Game.player = player;
})();



/************** Camera/Viewport Object *************/
(function(){
 window.Camera = function (xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
  //position of camera left top coords
  this.xView = xView;
  this.yView = yView;
  
  //distance from followed object to border before camera starts move
  this.xMoveZone = 0;
  this.yMoveZone = 0;
  
  
  //whether camera has reached world boundary in a certain direction
  this.moveStop = {
    left:false,
    top: false,
    right: false,
    bottom: false
  };
  
  //viewport dimensions
  this.wView = canvasWidth;
  this.hView = canvasHeight;
  
  //object that should be followed
  this.followed = null;
  
  //rectangle that represents viewport
  this.viewportRect = new Rectangle(this.xView, this.yView, this.wView, this.hView);
  
  //rectangle that represents the world's map
  this.worldRect = new Rectangle(0, 0, worldWidth, worldHeight); 
};

Camera.prototype.follow = function(gameObject, xMoveZone, yMoveZone) {
  this.followed = gameObject;
  this.xMoveZone = xMoveZone;
  this.yMoveZone = yMoveZone;
};

Camera.prototype.update = function() {
  //keep following the player
  if(this.followed !== null) {
    //moves camera on horizontal axis based on if followed object is in MoveZone
    if(this.followed.x < this.xMoveZone) {
      this.xView -= 5;
    } else if(this.followed.x > this.wView-this.xMoveZone) {
      this.xView += 5;
    }
    
    //moves camera on horizontal axis based on if followed object is in MoveZone
    if(this.followed.y < this.yMoveZone) {
      this.yView -= 5;
    } else if(this.followed.y > this.hView-this.yMoveZone) {
      this.yView += 5;
    }
  }
  
  //update viewportRect
  this.viewportRect.set(this.xView, this.yView);
  
  //reset camera move boundary stops
  this.moveStop = {
    left:false,
    top: false,
    right: false,
    bottom: false
  };
  
  //don't let camera leave world boundaries
  if(!this.viewportRect.within(this.worldRect)) {
    if(this.viewportRect.left< this.worldRect.left) {
      this.xView = this.worldRect.left;
      this.moveStop.left = true;
    }
    if(this.viewportRect.top < this.worldRect.top) {
      this.yView = this.worldRect.top;
      this.moveStop.top = true;
    }
    if(this.viewportRect.right > this.worldRect.right) {
      this.xView = this.worldRect.right - this.wView;
      this.moveStop.right = true;
    }
    if(this.viewportRect.bottom > this.worldRect.bottom) {
      this.yView = this.worldRect.bottom - this.hView;
      this.moveStop.bottom = true;
    }
  }
};
})();

/************** Rectangle Object *************/
(function(){
window.Rectangle = function (left, top, width, height) {
  this.left = left;
  this.top = top;
  this.width = width;
  this.height = height;
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;
};
  
Rectangle.prototype.set = function(left, top, width, height) {
  this.left = left;
  this.top = top;
  this.width = width || this.width; //optional
  this.height = height || this.height; //optional
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;
};

Rectangle.prototype.within = function(r) {
  return (r.left <= this.left && 
          r.right >= this.right &&
          r.top <= this.top &&
          r.bottom >= this.bottom);
};

Rectangle.prototype.overlaps = function(r) {
        return (this.left < r.right && 
                r.left < this.right && 
                this.top < r.bottom &&
                r.top < this.bottom);
};
})();

/************** Map Object *************/

function Map(width, height, mapImage) {
  // Map dimensions
  this.width = width;
  this.height = height;
  // Map background
  this.image = mapImage;
  this.mapRect = new Rectangle(0,0,width,height);
  this.mapObjects = {};
}

Map.prototype.draw = function(ctx, xView, yView, camRect) {
  // Crop image to what only needs to be displayed
  var sx, sy, dx, dy, sWidth, sHeight, dWidth, dHeight;
  
  // Offset point to crop image
  sx = xView;
  sy = yView;
  
  // Dimensions of cropped image
  sWidth = ctx.canvas.width;
  sHeight = ctx.canvas.height;
  
  // If cropped image is smaller than canvas we need to change the source dimensions
  if(this.image.width - sx < sWidth){
      sWidth = this.image.width - sx;
  }
  if(this.image.height - sy < sHeight){
      sHeight = this.image.height - sy; 
  }
  
  // Location on canvas to draw the cropped image
  dx = 0;
  dy = 0;
  
  // Match destination with source to not scale the image
  dWidth = sWidth;
  dHeight = sHeight;		
  
  // Draw portion of map
  ctx.drawImage(this.image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);
  
  // Does map have any objects?
  if (!isEmpty(this.mapObjects)) {
    var objs = this.mapObjects;
    // Loop through it's objects
    for(var prop in objs) {
      if(objs[prop].rect.within(camRect) || objs[prop].rect.overlaps(camRect)) {
        // Object is in viewport, draw it
        this.drawObjImage(ctx, objs[prop].x-sx, objs[prop].y-sy,objs[prop].type, objs[prop].name);
      }  
    } 
  }
};

// Sets an object for the map and it's attributes 
Map.prototype.setMapObject = function(x, y, name, type, fileId, width, height) {
  var mapObj;
  
  switch(type) {
    case 'file':
      width = 98;
      height = 130;
      break;
    case 'folder':
      width = 140;
      height = 130;
      break;
    case 'dropOffFolder':
      width = 140;
      height = 130;
      break;
    case 'recycleBin':
      width = 98;
      height = 130;
      break;
    case 'clock':
      width = 120;
      height = -30;
      break;
    case 'link':
      width = width || 70;
      height = height || 70;
      break;
  }
  
  
  mapObj = {
    x: x,
    y: y,
    name: name,
    type: type,
    width: width,
    height: height,
    state: 'normal',
    rect: new Rectangle(x,y,width,height),
    fileId: fileId || null // Optional
  };
  
  // Store obj within mapObjects
  this.mapObjects[name] = mapObj;
};

Map.prototype.objImages = {
  file: mapObjImages.file,
  folder: mapObjImages.folder
};


Map.prototype.drawObjImage = function(ctx, x, y, type, name) {
  var i,j,xArr,yArr,filePoints,folderPoints, recycBinPoints, textX, hrs,mins;
  
  
  if(type === "file") {
    // Draw File image
    ctx.drawImage(this.objImages.file, x,y);
    
    // Center text if longer than 10 chars
    textX = (name.length > 10)?  40-(name.length*5) : 0;
    ctx.fillStyle = "#000";
    ctx.font = "22px 'Arial', sans-serif";
    ctx.fillText(name,x+textX, y+135);
  }
  
  if(type === "folder" || type === "dropOffFolder") {
    // Draw Folder image
    ctx.drawImage(this.objImages.folder, x,y);
    // Center text if longer than 10 chars
    textX = (name.length > 10)?  60-(name.length*5) : 10;
    ctx.fillStyle = "#000";
    ctx.font = "22px 'Arial', sans-serif";
    ctx.fillText(name,x+textX, y+135);
  }
  
  if (type === "recycleBin") {
    // Draw something
  }
  
  if (type === "clock") {
    var time = new Date();
    hrs = time.getHours();
    mins = time.getMinutes();
    // Find whether am or pm
    meridiem = hrs >= 12 ? 'pm' :'am';
    // Convert to 12hr time
    hrs = hrs > 12 ? hrs-12 : hrs;
    // Add 0 if min is less than 10
    mins = mins < 10? '0' + mins : mins;
    
    ctx.fillStyle = '#fff';
    ctx.font = "20px 'Press Start 2P', monotype";
    ctx.fillText(hrs + ':' + mins + ' ' + meridiem, x,y);
  }
};



/************** FPS Object *************/
(function(){
  var fps = {
  count: 0,
  lastCount: 0,
  lastUpdated: 0,
};

//updates the canvas's fps
fps.update = function(time){
  //if time since last update more than a second, update fps count
  if (time - this.lastUpdated >= 1) {
    //set count
    this.lastCount = this.count;
    //reset counter
    this.count = 0;
    //set last updated time
    this.lastUpdated = time;
  } else {
    //increment counter
    this.count++;
  }
};

//draw fps on canvas top left
fps.draw = function(ctx) {
  var fpsCount = this.lastCount + " fps";
  ctx.font = "20px Verdana";
  ctx.fillStyle = '#000';
  ctx.fillText(fpsCount, 10,30);
};
// Attach to Game module
Game.fps = fps;
})();


/**********************************************/
/*****-----Game Object and Methods-----******/
/**********************************************/

Game.maps = {};

Game.filesFound = {
  count:0,
  total: 2
};

Game.filesFound.draw  = function(ctx, image) {
    var countText;
    countText = Game.filesFound.count + ' / ' + Game.filesFound.total;
    ctx.fillStyle = '#000';
    ctx.font = "30px 'Arial', sans-serif";
    ctx.drawImage(image,0,0,image.width,image.height,Game.canvas.width-130,8,image.width*0.4,image.height*0.4);
    ctx.fillText(countText, Game.canvas.width - 80, 40);
};

Game.setMap = function(width, height, image, name) {
  this.maps[name]= new Map(width, height, image);
  this.maps[name].mapName = name;
};

Game.changeMap = function(mapName) {
  // Reset cursor location
  this.player.cursor.x = this.canvas.width/2;
  this.player.cursor.y = this.canvas.height/2;
  // TODO: change this to game.camera when added
  // Centre viewport to center of map
  this.camera.xView = this.maps[mapName].width/4;
  this.camera.yView = this.maps[mapName].height/4;
  // update current map
  this.currentMap = mapName;
};

// Handles player interactions with the map on double click/tap
Game.interactHandler = function(xView, yView) {
  var inObject, currentMap;
  currentMap = this.maps[this.currentMap];
  inObject = this.player.inObject(xView, yView, currentMap);
  
  if(inObject.type === 'file' && !this.player.hasFile) {
    // Pick up file
    this.player.pickUpFile(inObject, currentMap);
  } else if (inObject.type === 'dropOffFolder' && this.player.hasFile) {
    // Drop off file to folder, record files found
    this.filesFound.count = this.player.dropOffFile();
  } else if (!inObject && this.player.hasFile) {
    // Not in an object, place file on map
    this.player.placeFile(xView, yView, currentMap);
  } else if (inObject.type === 'folder' || inObject.type === 'link') {
    // Clicked on folder object, change map to corresponding folder
    this.changeMap(inObject.fileId);
  }
  
};

/* ----- Game Canvas Methods ----- */



Game.time = Date.now()/1000;


//initilize the game on page load
Game.init = function() {
  this.canvas = document.getElementById('c');
  this.ctx = this.canvas.getContext('2d');
  
  // Check whether any css files are found, update count
  this.filesFound.count = checkCssFiles();
  
  //make cursor invisible when in canvas
  this.canvas.style.cursor = "none";
  
  // move cursor to centre of screen
  this.player.cursor.x = this.canvas.width/2;
  this.player.cursor.y = this.canvas.width/2;
  
  
  /* --- Map Config --- */
  // Set Maps
  this.setMap(1366, 768, mapImages.desktop, 'desktop');
  this.setMap(1366, 768, mapImages.forgetFolder, 'forgetFolder');
  
  // Assign css file locations if not already found
  if(isEmpty(localStorage.getItem('css1')))
    this.maps.desktop.setMapObject(1200,100,'blue.css','file', 'css1');
  if(isEmpty(localStorage.getItem('css2')))
    this.maps.desktop.setMapObject(100,100,'red.css','file', 'css2');
  
  // Set map objects
  this.maps.desktop.setMapObject(500,320,'Put CSS Files in Here','dropOffFolder');
  this.maps.desktop.setMapObject(1050,450,'I forget what\'s in here','folder', 'forgetFolder');
  this.maps.desktop.setMapObject(1195,740,'clock','clock');
  this.maps.forgetFolder.setMapObject(1195,740,'clock','clock');
  this.maps.forgetFolder.setMapObject(45,170,'backBtn','link','desktop',139,310);
  this.maps.forgetFolder.setMapObject(1270,10,'exitBtn','link','desktop',70,70);
  
  
  // Set default map
  this.currentMap = this.maps.desktop.mapName;
  
  this.camera = new Camera(250, 200, this.canvas.width, this.canvas.height, 1366, 768);
  this.camera.follow(this.player.cursor, 100, 100);
  
  this.loop((Date.now()/1000));
};

// Updates data for each frame (hopefully 60fps)
Game.update = function (time) {
  var prevFrameTime = (Date.now()/1000) - time;
  this.camera.update();
  this.player.update(time, this.camera);
  this.fps.update(time);
};

// Clears canvas and redraws objects for each frame (hopefully 60fps)
Game.draw = function (ctx) {
  // Clear canvas
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
  // Redraw all objects
  this.maps[this.currentMap].draw(ctx, this.camera.xView, this.camera.yView, this.camera.viewportRect);
  this.player.drawCursor(ctx);
  this.fps.draw(ctx);
  
  // Draw File Count HUD
  Game.filesFound.draw(ctx, this.maps[this.currentMap].objImages.file);
};


// TODO: Sort out object defining scope, why can't I use this in Game.loop?

Game.loop = function () {
  var requestId = requestAnimFrame(Game.loop);
  Game.update(Game.time); 
  Game.draw(Game.ctx);
  Game.time = Date.now()/1000;
};



// Returns position of mouse or touch/tap on canvas
Game.getPos = function (evt, type) {
  var rect = this.canvas.getBoundingClientRect(), x, y;
  
  switch(type) {
    case 'mouse':   
      x = evt.clientX - rect.left;
      y = evt.clientY - rect.top;
      break;

    case 'touch':
      x = event.x - rect.left;
      y = event.y - rect.top;
      break;
  }
  
  //return object of x and y 
  return {
    x: x,
    y: y
  };
};

// Update coords of cursor on each mouse move or touch/tap
Game.updateCursor = function(evt, type) {
  var points = this.getPos(evt, type);
  // Update cursor coords on mousemove
  if (type === 'mouse') {
    this.player.cursor.x = points.x;
    this.player.cursor.y = points.y;  
  } else if (type === 'touch') {
  // Call move function on player cursor
    this.player.moveCursor(points.x, points.y);
  }
};


Game.init();

/* --------- Event Listeners --------- */

Game.canvas.addEventListener('tap', function(evt){
  evt.preventDefault();
  Game.updateCursor(evt, 'touch');
}, false);

Game.canvas.addEventListener('mousemove', function(evt){
  Game.updateCursor(evt, 'mouse');
}, false);

Game.canvas.addEventListener('dbltap', function(evt){
  Game.interactHandler(Game.camera.xView, Game.camera.yView);
}, false);

Game.canvas.addEventListener('dblclick', function(evt){
  Game.updateCursor(evt);
  Game.interactHandler(Game.camera.xView, Game.camera.yView);
}, false);

document.getElementById('clear-css').addEventListener('click', function(){
  // Clear Local Storage
  localStorage.clear();
  // Reload page
  location.reload();
});


/**********************************************/
/********------ Global Functions ------********/
/**********************************************/
/* Probably a bad idea but unsure how to integrate into module pattern */

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

/*
* Get x,y coordinates at any point in a quadratic bezier curve equation
* Useful for mapping a smooth curve when moving an object with two different vectors
*/
function quadBezierCoord(x0,y0,x1,y1,x2,y2,t) {
  var cx, cy, u;
  //check if current period exceeds or equal to 1
  if (t >= 1) {
    cx = x2;
    cy = y2;
  } else {
    //simplify (1-t) into one variable;
    u = 1 - t;
    //calculate each x and y point
    cx = ((u * u) * x0) + ((2*t)*u*x1) + ((t*t)*x2);
    cy = ((u * u) * y0) + ((2*t)*u*y1) + ((t*t)*y2);
  }
  return {
    x: Math.round(cx), // Round values, canvas performs better with integer coords
    y: Math.round(cy)
  };
}