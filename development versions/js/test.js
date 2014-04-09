var canvas = document.getElementById('c'),
    ctx = canvas.getContext('2d'),
    image = new Image();
    image.src = 'js/desktop.jpg';
    canvas.width = 600;
    canvas.height = 450;
ctx.fillRect(0,0, canvas.width, canvas.height);
ctx.drawImage(image, 150,400,800,800,0,0,600,450);