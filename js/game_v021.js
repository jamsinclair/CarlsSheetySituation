// Attach Game Object to the window
window.Game = {};

/**********************************************/
/********------ Rectangle Class ------*********/
/**********************************************/
// Simple collision and boundary detection class
// Class by awesome StackOverflow user: Gustavo Carvalho

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

/**********************************************/
/*****-----Player Object and Methods-----******/
/**********************************************/
(function() { 
  var player = {
    cursor: {
      // Note that cursor x,y are relative to canvas, not the map
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
  
  // This function finds the start,end and control point coordinates so can move the cursor in a smooth path
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
  player.drawCursor = function(ctx, scale) {
    var x,y,image;
    x = this.cursor.x;
    y = this.cursor.y;
    
    if(this.cursor.type === 'drag') {
      // Draw Drag cursor
      image = this.cImage.drag.image;
      ctx.drawImage(image,0,0,image.width,image.height, x-scale(20), y-scale(20),scale(image.width),scale(image.height));
    } else if (this.cursor.type === 'directional') {
      // Draw a directional cursor
      image = this.cImage.directional.image[this.cImage.directional.rotate];
      ctx.drawImage(image,0,0,image.width,image.height, x, y,scale(image.width),scale(image.height));
    } else {
      // Draw normal cursor
      image = this.cImage.normal.image;
      ctx.drawImage(image,0,0,image.width,image.height, x, y,scale(image.width),scale(image.height));
    }
  };
  
  
  // Is player's cursor within an object on double click/tap?
  player.inObject = function(xView, yView, map,scale) {
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
  
  // Pick up and move around a file
  player.pickUpFile = function(obj, map) {
    // Pick up file and delete it from map objects
    // for debug console.log('Picked up file ' + map.mapObjects[obj.name].name + ' at ' + map.mapObjects[obj.name].x + ', ' + map.mapObjects[obj.name].y);
    
    this.cursor.type = 'drag';
    this.hasFile = true;
    this.file = map.mapObjects[obj.name];
    delete map.mapObjects[obj.name];
  };
  
  // Place a file on the map
  player.placeFile = function(xView, yView, map, scale) {
    var x,y;
    // Find cursors coords relative to map
    x = scale(player.cursor.x + xView, 'opposite') - 25;
    y = scale(player.cursor.y + yView, 'opposite') - 30;
    
    // Place the file the player is carrying back onto map
    map.setMapObject(x,y,this.file.name, this.file.type, scale, this.file.fileId);
    
    // for debug console.log('Placed file ' + this.file.name + ' at ' + x + ', ' + y);
    
    // Update player properties
    this.cursor.type = 'normal';
    this.hasFile = false;
    this.file = null;
  };
  
  // Drop a file off and update local storage
  player.dropOffFile = function() {
    var count;
    // Drop the file off and record file found in localStorage
    // for debug console.log('Dropped off ' + this.file.name + ' in ' + this.file.name + ' folder');
  
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

/**********************************************/
/*****------ Camera/Viewport Class ------******/
/**********************************************/
// Simple Game Camera class
// Class by awesome StackOverflow user: Gustavo Carvalho
// Adapted messily by me

(function(){
 window.Camera = function (xView, yView, canvasWidth, canvasHeight, worldWidth, worldHeight) {
  //position of camera left top coords
  this.xView = xView;
  this.yView = yView;
  
  //distance from followed object to border before camera starts move
  this.xMoveZone = 0;
  this.yMoveZone = 0;
  
  
  // Current scale of original camera viewport
  this.scaleUnit = 1;
   
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

Camera.prototype.update = function(scaleUnit,canvas) {
  // When scaleUnit has changed for the game, update camera viewport
  if (this.scaleUnit !== scaleUnit) {
    // Update camera scaleUnit
    this.scaleUnit = scaleUnit;
    // Update viewport 
    this.wView = canvas.width;
    this.hView = canvas.height;
    this.xMoveZone = this.xMoveZone < 50? this.xMoveZone*scaleUnit: 50;
    this.yMoveZone = this.yMoveZone < 50? this.yMoveZone*scaleUnit: 50;
    
    //update world rect
    this.worldRect.set(0,0,1366*scaleUnit, 768*scaleUnit);
  }
  
  
  //keep following the player
  if(this.followed !== null) {
    //moves camera on horizontal axis based on if followed object is in MoveZone
    if(this.followed.x < this.xMoveZone) {
      this.xView -= 5 * this.scaleUnit;
    } else if(this.followed.x > this.wView-this.xMoveZone) {
      this.xView += 5 * this.scaleUnit;
    }
    
    //moves camera on horizontal axis based on if followed object is in MoveZone
    if(this.followed.y < this.yMoveZone) {
      this.yView -= 5;
    } else if(this.followed.y > this.hView-this.yMoveZone) {
      this.yView += 5;
    }
  }
  
  //update viewportRect
  this.viewportRect.set(this.xView, this.yView, this.wView,this.hView);
  
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

/**********************************************/
/***********------ Map Class ------************/
/**********************************************/
// Simple Map Class
// Class by awesome StackOverflow user: Gustavo Carvalho
// Adapted messily by me

(function(){
  window.Map = function (width, height, mapImage) {
    // Map dimensions
    this.width = width;
    this.height = height;
    // Map background
    this.image = mapImage;
    this.mapRect = new Rectangle(0,0,width,height);
    this.mapObjects = {};
  };

  Map.prototype.draw = function(ctx, xView, yView, camRect, scaleUnit, scale) {
    // Crop image to what only needs to be displayed
    var sx, sy, dx, dy, sWidth, sHeight, dWidth, dHeight;

    // Offset point to crop image
    sx = xView/scaleUnit;
    sy = yView/scaleUnit;

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
    ctx.drawImage(this.image, sx, sy, (sWidth / scaleUnit), (sHeight / scaleUnit), dx, dy, dWidth, dHeight);

    // Does map have any objects?
    if (!isEmpty(this.mapObjects)) {
      var objs = this.mapObjects;
      // Loop through it's objects
      for(var prop in objs) {
        if(objs[prop].rect.within(camRect) || objs[prop].rect.overlaps(camRect)) {
          // Object is in viewport, draw it
          this.drawObjImage(ctx, objs[prop].x-sx, objs[prop].y-sy,objs[prop].type, objs[prop].name, scale);
        }  
      } 
    }
  };

  // Sets an object for the map and it's attributes 
  Map.prototype.setMapObject = function(x, y, name, type,scale, fileId, width, height) {
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
      rect: new Rectangle(scale(x),scale(y),scale(width),scale(height)),
      fileId: fileId || null // Optional
    };

    // Store obj within mapObjects
    this.mapObjects[name] = mapObj;
  };

  // Scales location of any map objects
  Map.prototype.updateObjScale = function(scale) {
    var prop, obj, mapObj;
    obj = this.mapObjects;
    // For each obj on the map, scale it's location/boundaries
    for(prop in obj) {
      mapObj = this.mapObjects[prop];
      this.mapObjects[prop].rect.set(scale(mapObj.x),scale(mapObj.y), scale(mapObj.width), scale(mapObj.height));
    }
  };

  // Set Images for map objects
  Map.prototype.objImages = {
    file: mapObjImages.file,
    folder: mapObjImages.folder
  };

  Map.prototype.drawObjImage = function(ctx, x, y, type, name, scale) {
    var i,j,image,xArr,yArr,textX,meridiem, hrs,mins;

    if(type === "file") {
      // Draw File image
      image = this.objImages.file;
      ctx.drawImage(image,0,0,image.width,image.height,scale(x),scale(y),scale(image.width),scale(image.height));

      // Center text if longer than 10 chars
      textX = (name.length > 10)?  40-(name.length*5) : 0;
      ctx.fillStyle = "#000";
      ctx.font = scale(22) + "px 'Arial', sans-serif";
      ctx.fillText(name,scale(x+textX), scale(y+135));
    }

    if(type === "folder" || type === "dropOffFolder") {
      // Draw Folder image
      image = this.objImages.folder;
      ctx.drawImage(image,0,0,image.width,image.height,scale(x),scale(y),scale(image.width),scale(image.height));
      // Center text if longer than 10 chars
      textX = (name.length > 10)?  60-(name.length*5) : 10;
      ctx.fillStyle = "#000";
      ctx.font = scale(22) + "px 'Arial', sans-serif";
      ctx.fillText(name,scale(x+textX), scale(y+135));
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
      ctx.font = scale(20) + "px 'Press Start 2P', monotype";
      ctx.fillText(hrs + ':' + mins + ' ' + meridiem, scale(x),scale(y));
    }
  };
})();

/**********************************************/
/**********------- FPS Object -------**********/
/**********************************************/
// Simple FPS counter
// Marginally adatped from Sam Lancashire's great simple fps counter
// http://html5gamedev.samlancashire.com

(function(){
  var fps = {
    count: 0,
    lastCount: 0,
    lastUpdated: 0,
    active: false // Default turned off
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
/******-----Game Object and Methods-----*******/
/**********************************************/
// Hastily and messily implemented by me
// Inspired by various javascript game objects out there

// Init game maps object
Game.maps = {};

Game.time = Date.now()/1000;

/* ---------- Game Scene Methods and Properties ------------ */
/* 
  Just a quick system I came up with last minute to cycle between 
  The Start Screen, Intros etc. Still needs some refining, maybe better name
*/

// Set Game Scenes 
// TODO: Do I need to make this into a newScene method?
Game.scene = {};
Game.scene[0] = {
  name: 'StartScreen',
  draw: sceneDraw.StartScreen,
};
Game.scene[1] = {
  name: 'Intro1',
  draw: sceneDraw.Intro1,
};
Game.scene[2] = {
  name: 'Intro2',
  draw: sceneDraw.Intro2,
};
Game.scene[3] = {
  name: 'Game',
  draw: null,
};
Game.scene[4] = {
  name: 'EndGame',
  draw: sceneDraw.EndGame,
};

// Set Default to Start Screen
Game.currentScene = {
  name: Game.scene[0].name,
  num: 0
};

// Change the current scene to the next
Game.nextScene = function() {
  var num = this.currentScene.num + 1;
  // Make sure don't exceed past last scene
  num = num > 4 ? 4 : num;
  this.currentScene = {
    name: this.scene[num].name,
    num: num
  };
  
  if (this.currentScene.name === 'Game') {
    // Make actual cursor invisible when on canvas when Game started
    this.canvas.style.cursor = "none";
  } 
}; 

Game.startScene = function() {
  this.loop();
};


/* ---------- Game Scale Methods and Properties ------------ */
// Control how game adapts to window size and resizes

// Scale unit number between 0-1 , 1 being 100% of original canvas size
Game.scaleUnit = 1;

// Scale function converts a number to new scale and rounds to integer for better canvas performance
Game.scale = function(number, opposite) {
  if(opposite) {
    // Returns scaled up number
    return Math.round(number / Game.scaleUnit);
  } else {
    // Return scaled down number
    return Math.round(number * Game.scaleUnit);
  }
};

// On window resize, resizes canvas and sets Game scale unit
Game.resizeCanvas = function() {
  var height, width, map, contentEl, canvas;
  
  // Grab content Element 
  contentEl = document.getElementById('content');  
  canvas = Game.canvas;
  
  // Width properties of canvas when window larger than 960 px
  if (window.innerWidth >= 960) {
    width = contentEl.offsetWidth * 0.625;
  } else {
    width = contentEl.offsetWidth;
  }
  
  // Make sure canvas size does not exceed 600px
  canvas.width = width > 600 ? 600 : width;
  
  // Keep height in a 4:3 ratio relative to height
  canvas.height = canvas.width * 0.75;
  
  // For each map, update scale of all object boundaries/positions
  for (map in Game.maps) {
    Game.maps[map].updateObjScale(Game.scale);
  }
  
  // Set Game's scale unit to the percentage that current canvas size is of original
  Game.scaleUnit = canvas.width/600;
};

// Keep Track of files found by Player
Game.filesFound = {
  count:0,
  total: 7
};

// Draws the current count of files found
Game.filesFound.draw  = function(ctx, image, scale) {
    var countText;
    countText = Game.filesFound.count + ' / ' + Game.filesFound.total;
    ctx.fillStyle = '#000';
    ctx.font = scale(30) + "px 'Arial', sans-serif";
    ctx.drawImage(image,0,0,image.width,image.height,Game.canvas.width-scale(130),scale(8),scale(image.width*0.4),scale(image.height*0.4));
    ctx.fillText(countText, Game.canvas.width - scale(80), scale(40));
};

/* ---------- Game Map Methods ------------ */

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
  this.camera.xView = 0;
  this.camera.yView = 0;
  // update current map
  this.currentMap = mapName;
};


/* ---------- Input Methods (Mouse/Touch) ------------ */

// Last minute hack to prevent double events on touch devices
// Stops click event if true
Game.touch = false;

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

// Handles player interaction with game on single click/tap
Game.interactHandler = function(evt, type) {
  var scName = this.currentScene.name;
  
  if(scName !== 'Game' && (type === 'touch' || type === 'click')) {
    this.nextScene();
  }
  
  if (scName === 'Game' && (type === 'touch' || type === 'mouse')) {
    this.updateCursor(evt, type);
  }
};

// Handles player interactions with the game on double click/tap
Game.dblInteractHandler = function(xView, yView) {
  var inObject, currentMap;
  currentMap = this.maps[this.currentMap];
  inObject = this.player.inObject(xView, yView, currentMap, this.scale);
  
  if(inObject.type === 'file' && !this.player.hasFile) {
    // Pick up file
    this.player.pickUpFile(inObject, currentMap);
  } else if (inObject.type === 'dropOffFolder' && this.player.hasFile) {
    // Drop off file to folder, record files found
    this.filesFound.count = this.player.dropOffFile();
    // Resize canvas, as CSS sometimes effects canvas dimensions
    this.resizeCanvas();
  } else if (!inObject && this.player.hasFile) {
    // Not in an object, place file on map
    this.player.placeFile(xView, yView, currentMap, this.scale);
  } else if (inObject.type === 'folder' || inObject.type === 'link') {
    // Clicked on folder object, change map to corresponding folder
    this.changeMap(inObject.fileId);
  }
};

/* -------------- Game Initialisation ----------------- */
Game.init = function() {
  this.canvas = document.getElementById('game-canvas');
  this.ctx = this.canvas.getContext('2d');
  
  // Check whether any css files are found, update count
  this.filesFound.count = checkCssFiles();
  
  // Set canvas dimensions
  this.resizeCanvas();
  
  // Move cursor to centre of screen
  this.player.cursor.x = this.canvas.width/2;
  this.player.cursor.y = this.canvas.width/2;
  
  
  /* ---------- Game Maps Config ---------- */
  // Set Maps-
  this.setMap(1366, 768, mapImages.desktop, 'desktop');
  this.setMap(1366, 768, mapImages.forgetFolder, 'forgetFolder');
  this.setMap(1366, 768, mapImages.recycleBin, 'recycleBin');
  
  // Assign css file locations if not already found
  if(isEmpty(localStorage.getItem('css1')))
    this.maps.desktop.setMapObject(440,140,'reset.css','file', this.scale,'css1');
  if(isEmpty(localStorage.getItem('css2')))
    this.maps.desktop.setMapObject(1210,60,'images.css','file', this.scale,'css2');
  if(isEmpty(localStorage.getItem('css3')))
    this.maps.recycleBin.setMapObject(600,300,'layout.css','file',this.scale, 'css3');
  if(isEmpty(localStorage.getItem('css4')))
    this.maps.forgetFolder.setMapObject(1000,220,'fonts.css','file',this.scale, 'css4');
  if(isEmpty(localStorage.getItem('css5')))
    this.maps.recycleBin.setMapObject(1210,480,'colour1.css','file',this.scale, 'css5');
  if(isEmpty(localStorage.getItem('css6')))
    this.maps.forgetFolder.setMapObject(400,500,'colour2.css','file',this.scale, 'css6');
  if(isEmpty(localStorage.getItem('css7')))
    this.maps.desktop.setMapObject(800,500,'borders.css','file',this.scale, 'css7');
  
  // Set objects for Desktop
  this.maps.desktop.setMapObject(220,480,'Put CSS Files in Here','dropOffFolder', this.scale);
  this.maps.desktop.setMapObject(1180,300,'Forgotten Files', 'folder', this.scale, 'forgetFolder');
  this.maps.desktop.setMapObject(50,50,'Recycle Bin', 'folder', this.scale, 'recycleBin');
  this.maps.desktop.setMapObject(1195,740,'clock','clock', this.scale);
  // Set objects for Forgotten Files Folder
  this.maps.forgetFolder.setMapObject(1195,740,'clock','clock', this.scale);
  this.maps.forgetFolder.setMapObject(45,170,'backBtn','link', this.scale,'desktop',139,310);
  this.maps.forgetFolder.setMapObject(1270,10,'exitBtn','link', this.scale,'desktop',70,70);
  // Set objects for Recycle Bin Folder
  this.maps.recycleBin.setMapObject(1195,740,'clock','clock', this.scale);
  this.maps.recycleBin.setMapObject(45,170,'backBtn','link', this.scale,'desktop',139,310);
  this.maps.recycleBin.setMapObject(1270,10,'exitBtn','link', this.scale,'desktop',70,70);
  
  
  // Set default map
  this.currentMap = this.maps.desktop.mapName;
  
  this.camera = new Camera(250, 200, this.canvas.width, this.canvas.height, 1366, 768);
  this.camera.follow(this.player.cursor, 100, 100);
  
  /* --------- Set Event Listeners --------- */

  Game.canvas.addEventListener('tap', function(evt){
    Game.interactHandler(evt, 'touch');
    Game.touch = true;
  }, false);
  
  Game.canvas.addEventListener('click', function(evt){
    evt.preventDefault();
    // No click event, if touch is true
    if (!Game.touch) {
      Game.interactHandler(evt, 'click');
    }
  }, false);
  
  Game.canvas.addEventListener('mousemove', function(evt){
    evt.preventDefault();
    Game.interactHandler(evt, 'mouse');
  }, false);
  
  Game.canvas.addEventListener('dbltap', function(evt){
    Game.dblInteractHandler(Game.camera.xView, Game.camera.yView);
  }, false);
  
  Game.canvas.addEventListener('dblclick', function(evt){
    evt.preventDefault();
    Game.updateCursor(evt);
    Game.dblInteractHandler(Game.camera.xView, Game.camera.yView);
  }, false);
  
  // Listen for window resizes, scales game depending on window width
  window.addEventListener('resize', Game.resizeCanvas, false);
  
  // Add listener on Clear CSS Btn
  document.getElementById('clear-btn').addEventListener('click', function(){
    // Clear Local Storage
    localStorage.clear();
    // Reload page
    location.reload();
  });
  
  // Start the Game!!!
  this.startScene();
};

/* -------------- Game Loop Methods ----------------- */

// Updates data for each frame (hopefully 60fps)
Game.update = function (time) {
  var scName = this.currentScene.name;
  
  if (scName === 'Game') {
    var prevFrameTime = (Date.now()/1000) - time;
    this.camera.update(this.scaleUnit, this.canvas);
    this.player.update(time, this.camera);
    
    if(this.fps.active) {
      // Update fps when set to active
      this.fps.update(time);
    }
    // Check if all files found
    if (this.filesFound.count === this.filesFound.total) {
      // All files found, go to next scene
      this.nextScene();
    }
  }
};

// Clears canvas and redraws objects for each frame (hopefully 60fps)
Game.draw = function (ctx) {
  var scName = this.currentScene.name;
  // Clear canvas
  ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  
  if (scName === 'StartScreen') {
    this.scene[0].draw(ctx, this.scale);
  }
  
  if (scName === 'Intro1') {
    this.scene[1].draw(ctx, this.scale);
  }
  
  if (scName === 'Intro2') {
    this.scene[2].draw(ctx, this.scale);
  }
  
  if (scName === 'Game') {
    // Redraw all objects
    this.maps[this.currentMap].draw(ctx, this.camera.xView, this.camera.yView, this.camera.viewportRect, this.scaleUnit, this.scale);
    this.player.drawCursor(ctx, this.scale);
    // Draw File Count HUD
    this.filesFound.draw(ctx, this.maps[this.currentMap].objImages.file, this.scale); 
    
    if(this.fps.active) {
      // Draw fps coutner when set to active
      this.fps.draw(ctx);    
    }
  }
  
  if (scName === 'EndGame') {
    this.scene[4].draw(ctx, this.scale);
  }
};

// TODO: Sort out object defining scope, why can't I use 'this.update' etc in Game.loop?
// Game loop, draws and updates game for each frame
Game.loop = function () {
  var requestId = requestAnimationFrame(Game.loop);
  Game.update(Game.time); 
  Game.draw(Game.ctx);
  Game.time = Date.now()/1000;
};


/* -------------- End of Game Object ----------------- */


/**********************************************/
/********------ Global Functions ------********/
/**********************************************/
/* Probably a bad idea but unsure how to integrate these functions nicely into module pattern */


/*  
* A shim by Erik Möller. Including Fixes from Paul Irish and Tino Zijdel
* Incase requestAnimationFrame not supported by browser 
*/
(function() {
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] ||    window[vendors[x]+'CancelRequestAnimationFrame'];
  }
  if (!window.requestAnimationFrame)
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); },timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  if (!window.cancelAnimationFrame)
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
}());


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