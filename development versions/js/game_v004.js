//initialize global vars 
var canvas, ctx, time, camera;

/*  
* A shim by Paul Irish,  
* incase requestAnimationFrame not supported by browser 
*/
window.requestAnimFrame = (function(callback) {
  return window.requestAnimationFrame || 
         window.webkitRequestAnimationFrame || 
         window.mozRequestAnimationFrame || 
         window.oRequestAnimationFrame || 
         window.msRequestAnimationFrame ||
         function(callback) {
           window.setTimeout(callback, 1000 / 60);
         };
})();


//initilize the game on page load
function init() {
  canvas = document.getElementById('c');
  //make cursor invisible when in canvas
  canvas.style.cursor = "none";
  player.cursor.x = canvas.width/2;
  player.cursor.y = canvas.width/2;

  ctx = canvas.getContext('2d');
  time = Date.now();
  
  map1 = new Map(1366, 768, mapImages.desktop);
  map1.setMapObject(1200,100,'test','file');
  map1.setMapObject(100,100,'layoutcssab','file');
  map1.setMapObject(600,300,'test_long_name','file');
  
  gCamera = new Camera(250, 200, canvas.width, canvas.height, 1366, 768);
  gCamera.follow(player.cursor, 100, 100);
  
  loop();
}

/**********************************************/
/*****-----Player Object and Methods-----******/
/**********************************************/
player = {
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
      x:Array(0,7,11,16,13,20),
      y:Array(27,24,33,32,23,22),
      rotate: false
    },
    directional: {
      x:Array(0,15,15,33,33,15,15,0),
      y:Array(0,10,2,2,-2,-2,-10,0),
      rotate: 'bottom-right'
    }
  },
  state: 'static'
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
    
  // Change cursor rotaton if cursor is in the move zone
  // Check when x less than left move zone
  if(this.cursor.x < camera.xMoveZone ) {
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


// Update coords of cursor on each mouse move
player.updateCursor = function(evt) {
  var points = getPos(evt, 'mouse');
  player.cursor.x = points.x;
  player.cursor.y = points.y;
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
  
  //change state to moving
  this.state = 'moving';
};

//update coords of cursor on each mouse move
player.touchCursor = function(evt) {
  var points = getPos(evt, 'touch');
  //alert(points.x + " " + points.y);
  player.moveCursor(points.x, points.y);
};

//draw the player's cursor
player.drawCursor = function(ctx) {
  var i,x,y,degrees,cursorImg; 
      
  x = this.cursor.x;
  y = this.cursor.y;
  //store object of cursor image coordinates
  cursorImg = this.cImage[this.cursor.type];
  
  //save unrotated ctx
  ctx.save();
  
  //rotates canvas to draw directional arrows
  if(cursorImg.rotate && cursorImg.rotate !== 'left') {
    //move ctx to centre of canvas
    ctx.translate(x, y);
    //rotate canvas
    switch(cursorImg.rotate){
        case 'top-left': 
          degrees = 45;
          break;
        case 'top': 
          degrees = 90;
          break;
        case 'top-right': 
          degrees = 135;
          break;
        case 'right': 
          degrees = 180;
          break;
        case 'bottom-right': 
          degrees = -135;
          break;
        case 'bottom-left': 
          degrees = -45;
          break;
        case 'bottom': 
          degrees = -90;
          break;
    }
    ctx.rotate(degrees * Math.PI/180);
    //make x,y units relative
    x = 0;
    y = 0;
  }
  
  //loops through and draws cursor
  ctx.beginPath();
  ctx.moveTo(x,y);
  
  for(i = 0; i < cursorImg.x.length; i++) {
    ctx.lineTo(x+cursorImg.x[i],y+cursorImg.y[i]);
  }
  
  ctx.closePath();
  ctx.fill();
  //restore unrotated ctx
  ctx.restore();
};

/************** Camera/Viewport Object *************/
function Camera(xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
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
}

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

/************** Rectangle Object *************/

function Rectangle(left, top, width, height) {
  this.left = left;
  this.top = top;
  this.width = width;
  this.height = height;
  this.right = this.left + this.width;
  this.bottom = this.top + this.height;
}
  
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
        console.log('here');
        this.drawObjImage(ctx, objs[prop].x-sx, objs[prop].y-sy,objs[prop].type, objs[prop].name);
      }  
    } 
  }
  
  // Show viewport and cursor positions relative to world map
  ctx.fillStyle = '#000';
  ctx.fillText(sx + " " + sy,500,30);
  ctx.fillText(Math.round(sx+player.cursor.x) + " " + Math.round(sy+player.cursor.y),500,60);
};


// Sets an object for the map and it's attributes 
Map.prototype.setMapObject = function(x, y, name, type) {
  var mapObj, width, height;
  
  switch(type) {
    case 'file':
      width = 98;
      height = 130;
      break;
    case 'folder':
      width = 98;
      height = 130;
      break;
    case 'recycleBin':
      width = 98;
      height = 130;
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
    rect: new Rectangle(x,y,width,height)
  };
  
  // Store obj within mapObjects
  this.mapObjects[name] = mapObj;
};


Map.prototype.drawObjImage = function(ctx, x, y, type, name) {
  var i,filePoints=[],folderPoints, recycBinPoints, textX;
  
  // Center text if longer than 10 chars
  textX = (name.length > 10)?  40-(name.length*5) : 0;
  
  // Coords of File image
  filePoints[0] = Array(0,0,0,110,90,110,90,16,72,0);
  filePoints[1] = Array(72,0,72,22,90,16);
  filePoints[2] = Array(15,43,51,43,15,55,65,55,15,67,65,67,15,79,65,79);
  
  // Draws file image
  if(type === "file") {
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x,y);
    for(i=2;i<filePoints[0].length; i+=2) {
      ctx.lineTo(x+filePoints[0][i],y+filePoints[0][i+1]);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x+filePoints[1][0],y+filePoints[1][1]);
    ctx.lineTo(x+filePoints[1][2],y+filePoints[1][3]);
    ctx.lineTo(x+filePoints[1][4],y+filePoints[1][5]);
    ctx.stroke();
    ctx.closePath();
    ctx.beginPath();
    for(i=0;i<filePoints[2].length; i+=4) {
      ctx.moveTo(x+filePoints[2][i],y+filePoints[2][i+1]);
      ctx.lineTo(x+filePoints[2][i+2],y+filePoints[2][i+3]);
    }
    ctx.stroke();
    ctx.closePath;
    ctx.fillStyle = '#000';
    ctx.font = "22pt 'Arial' sans-serif";
    ctx.fillText(name,x+textX, y+135);
    console.log(textX);
  }
};



/************** FPS Object *************/
fps = {
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
  ctx.fillText(fpsCount, 10,30);
};
/**********************************************/
/**********------ Functions ------***********/
/**********************************************/

//gets mouse/touch position on canvas
function getPos(evt, type) {
  var rect = canvas.getBoundingClientRect(), x, y;
  
  switch(type) {
    case 'mouse':   
      x = evt.clientX - rect.left;
      y = evt.clientY - rect.top;
      break;

    case 'touch':
      x = event.targetTouches[0].clientX - rect.left;
      y = event.targetTouches[0].clientY - rect.top;
      break;
  }
  
  //return object of x and y
  return {
    x: x,
    y: y
  };
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
    x: cx,
    y: cy
  };
}


/* ----- Game Canvas ctxing Functions ----- */

//updates data for each frame (approx 60fps)
function update(time) {
  var prevFrameTime = (Date.now()/1000) - time;
  //update player
  gCamera.update();
  player.update(time, gCamera);
  fps.update(time);
}

//clears canvas and redraws objects for each frame (approx 60fps)
function draw(ctx) {
  //clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  //redraw all objects
  //map.draw(ctx, camera.camX, camera.camY);
  map1.draw(ctx, gCamera.xView, gCamera.yView, gCamera.viewportRect);
  ctx.fillStyle="#000";
  player.drawCursor(ctx);
  fps.draw(ctx);
}

/* --------- Game Loop --------- */

function loop() {
  update((time/1000)); 
  draw(ctx);
  time = Date.now();
  requestAnimFrame(loop);
}

  
init();

canvas.addEventListener('touchstart', function(evt){
  evt.preventDefault();
  player.touchCursor(evt);
}, false);

canvas.addEventListener('mousemove', function(evt){
  player.updateCursor(evt);
}, false);


/* ------- Misc Functions --------*/

function isEmpty(obj) {
    var name;
    for (name in obj) {
        return false;
    }
    return true;
}


