var mapImages = {};
 mapImages['desktop'] = function(){
    //pre-render entire map and save as image
    var render = document.createElement("canvas").getContext("2d"),
        i = 0,
        width = 1366,
        height = 768,
        image;
    
    // Map dimensions 
    render.canvas.width = width;
    render.canvas.height = height;
    
    /* --------- Draw Background and Taskbar ----------- */
    
    // Fill background
    render.fillStyle = '#ece8cf';
    render.fillRect(0,0,width,height);
    
    // Draw taskbar
    render.fillStyle = '#918c6e';
    render.fillRect(0,height-75,width,75);
    
    //lines
    render.strokeStyle = '#33301d';
    render.lineWidth = 3;
    render.moveTo(0,height-75);
    render.lineTo(width,height-75);
    render.moveTo(125,height-75);
    render.lineTo(125, height);
    render.moveTo(1172,height-75);
    render.lineTo(1172, height);
    render.stroke();
    
    // Draw go circle
    render.fillStyle = '#6d6a55';
    render.beginPath();
    render.arc(56,height-37, 32,0, 2*Math.PI, false);
    render.fill();
    
    render.fillStyle = '#fff';
    render.font = "16pt 'Press Start 2p', monospace";
    render.fillText('Go', 37, height-28);

    /* --------- Draw Acorn ----------- */
    
    // Stalk
    render.fillStyle = "#261613";
    render.strokeStyle = "#261613";
    render.miterLimit = 10;
    render.beginPath();
    render.moveTo(550,192);
    render.bezierCurveTo(550,192,533.5,174,511,176.5);
    render.lineTo(520,162);
    render.bezierCurveTo(520,162,563,165.5,563,179);
    render.fill();
    
    // Body
    render.fillStyle="#422B18";
    render.beginPath();
    render.moveTo(533,366);
    render.bezierCurveTo(533,366,711.5,559,778,512.5);
    render.bezierCurveTo(778,512.5,847,489,884,404);
    render.bezierCurveTo(930.5,337.5,740,160.5,740,160.5);
    render.fill();
    
    // Cap
    render.fillStyle = "#261613";
    render.miterLimit = 10;
    render.beginPath();
    render.moveTo(754.5,147.5);
    render.bezierCurveTo(754,147.5,694,44.5,556,185);
    render.lineTo(556.5,184.5);
    render.bezierCurveTo(416,322,518,383.5,518,383.5);
    render.fill();
    
    //store the generated image
    image = new Image();
    image.src = render.canvas.toDataURL("image/png");
    
    image.onload = function() {
      console.log('loaded desktop');
    };
   
    //clear context
    render = null;
    
    return image;
  }();
  
  mapImages['forgetFolder'] = function(){
    //pre-render entire map and save as image
    var render = document.createElement("canvas").getContext("2d"),
        i = 0,
        width = 1366,
        height = 768,
        image,
        folderPoints,
        backPoints,
        dirName;
    
    // Map dimensions 
    render.canvas.width = width;
    render.canvas.height = height;
    
    /* --------- Draw Background and Taskbar ----------- */
    
    // Fill background
    render.fillStyle = '#f8f8f8';
    render.fillRect(0,0,width,height);
    
    // Draw taskbar
    render.fillStyle = '#918c6e';
    render.fillRect(0,height-75,width,75);
    
    //lines
    render.strokeStyle = '#33301d';
    render.lineWidth = 3;
    render.beginPath();
    render.moveTo(0,height-75);
    render.lineTo(width,height-75);
    render.moveTo(125,height-75);
    render.lineTo(125, height);
    render.moveTo(1172,height-75);
    render.lineTo(1172, height);
    render.moveTo(225,height-75);
    render.lineTo(225, height);
    render.stroke();
    render.closePath();
    
    render.strokeStyle = '#000';
    render.lineWidth = 3;
    render.beginPath();
    render.moveTo(241,0);
    render.lineTo(241, height-75);
    render.moveTo(0,91);
    render.lineTo(width, 91);
    render.closePath();
    render.stroke();
    
    render.fillStyle = '#88b1cc';
    render.fillRect(0,0,width,90);
    
    render.fillStyle = '#ece8cf';
    render.fillRect(0,93,240,height-170);
    
    render.fillStyle = '#000';
    render.font = "700 28px 'Arial', sans-serif";
    dirName = 'C://carls_desktop/I_forget_whats_in_here/';
    render.fillText(dirName, 50,55);
    
    render.font = "700 20px 'Arial', sans-serif";
    backText = 'Back to Desktop';
    render.fillText(backText, 45,310);
    
    
    // Back Btn 
    x = 45;
    y = 170;
    backPoints = {};
    backPoints.x = Array(139, 75, 75, 0, 75, 75, 139);
    backPoints.y = Array(64, 64, 94, 47, 0, 31, 31);
    render.fillStyle = "#8cc63f";
    render.strokeStyle = "#000";
    render.lineWidth = 3;
    render.miterLimit = 10;
    render.beginPath();
    render.moveTo(x+backPoints.x[0],y+backPoints.y[0]);
    for (i=1; i< backPoints.x.length; i++ ) {
      render.lineTo(x+backPoints.x[i],y+backPoints.y[i]);
    }
    render.closePath();
    render.fill();
    render.stroke();
    
    // Exit Btn
    render.fillStyle = '#FF0000';
    render.strokeStyle = '#96111B';
    render.lineWidth = 4;
    render.fillRect(1270,10,70,70);
    render.strokeRect(1270,10,70,70);
    
    render.strokeStyle = '#000';
    render.lineWidth = 6;
    render.beginPath();
    render.moveTo(1285,25);
    render.lineTo(1325,65);
    render.moveTo(1325,25);
    render.lineTo(1285,65);
    render.stroke();
    render.closePath();
  
    
    // Draw go circle
    render.fillStyle = '#6d6a55';
    render.beginPath();
    render.arc(56,height-37, 32,0, 2*Math.PI, false);
    render.fill();
    
    render.fillStyle = '#fff';
    render.font = "16pt 'Press Start 2p', monospace";
    render.fillText('Go', 37, height-28);
    
    // Draw mini folder icon
    x= 141;
    y= height-65;
    folderPoints = [];
    folderPoints.x = Array(Array(4, 37, 34, 31, 9, 6, 4, 4, 4, 4, 6, 9, 31, 34, 37, 37, 37));
    folderPoints.x[1] = Array(68, 68, 65, 63, 6, 3, 1, 1, 1, 1, 3, 6, 63, 65, 68, 68, 68);
    folderPoints.y = Array(Array(8, 12, 14, 14, 14, 14, 12, 8, 7, 4, 1, 1, 1, 1, 1, 7, 8));
    //8, 11.5, 14, 14, 13.5, 13.5, 11.5, 8, 7, 3.5, 1, 1, 1, 1, 1, 7, 8
    folderPoints.y[1] = Array(51, 53, 55, 55, 55, 55, 55, 51, 12, 10, 8, 8, 8, 8, 10, 12, 51);
    //50.5, 53, 55, 55, 55, 55, 55, 50.5, 11.5, 9.5, 7.5, 7.5, 7.5, 7.5, 9.5, 11.5, 50.5
    
    render.fillStyle = "#88b1cc";
    render.strokeStyle = "#000";
    render.lineWidth = 2;
    render.miterLimit = 4;
    
    for (i = 0; i < folderPoints.x.length; i++) {
      xArr = folderPoints.x[i];
      yArr = folderPoints.y[i];
      render.beginPath();
      render.moveTo(x+xArr[0],y+yArr[0]);
      // Loop through and draw points
      for (j = 1; j < xArr.length; j+=4) {
        render.bezierCurveTo(x+xArr[j],y+yArr[j],x+xArr[j+1],y+yArr[j+1],x+xArr[j+2],y+yArr[j+2]);
        render.lineTo(x+xArr[j+3],y+yArr[j+3]);
      } 
      render.closePath();
      render.fill();
      render.stroke();
    }
    
    //store the generated image
    image = new Image();
    image.src = render.canvas.toDataURL("image/png");
    
    image.onload = function() {
      console.log('loaded folder nofiles');
    };
    
    //clear context
    render = null;
    
    return image;
  }();