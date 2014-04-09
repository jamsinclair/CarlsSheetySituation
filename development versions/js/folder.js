var canvas = document.getElementById('c');
var ctx = canvas.getContext('2d');

var folderPoints = [];
folderPoints['x'] = Array(Array(7,74,68,62,18,12,7,7,7,7,12,18,62,68,74,74,74));
folderPoints['x'][1] = Array(135,135,130,125,11,6,2,2,2,2,6,11,125,130,135,135,135);
folderPoints['y'] = Array(Array(16,23,28,28,27,27,23,16,14,7,2,2,2,2,2,14,16));
folderPoints['y'][1] = Array(101,106,110,110,110,110,110,101,23,19,15,15,15,15,19,23,101);

ctx.fillStyle = "#88b1cc";
ctx.strokeStyle = "#000";
ctx.lineWidth = 2;
ctx.miterLimit = 4;

for (var i = 0; i < folderPoints['x'].length; i++) {
  var xArr = folderPoints['x'][i];
  var yArr = folderPoints['y'][i];
  
  ctx.beginPath();
  ctx.moveTo(xArr[0],yArr[0]);
  // Loop through and draw points
  for (var j = 1; j < xArr.length; j+=4) {
    ctx.bezierCurveTo(xArr[j],yArr[j],xArr[j+1],yArr[j+1],xArr[j+2],yArr[j+2]);
    ctx.lineTo(xArr[j+3],yArr[j+3]);
  } 

  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}




var x = 200;
var y = 1;

var filePoints = [];
  filePoints[0] = Array(0,0,0,110,90,110,90,16,72,0);
  filePoints[1] = Array(72,0,72,22,90,16);
  filePoints[2] = Array(15,43,51,43,15,55,65,55,15,67,65,67,15,79,65,79);

// Draws file image part
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
    ctx.closePath();