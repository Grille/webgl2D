# webgl2D
2d webgl library (very experimental)
<br>
## Features
Easy drawing images with webGL<br>

## Issues
On firefox ineffective<br>

## Use
### basic
Add webgl2D.js to you files<br>
get context with webGL2DStart<br>
````js
  let canvas = document.getElementById("canvas");
  let gl2D = webGL2DStart(canvas);
````
load a texture<br>
````js
  //texture must be a potency of 2 (32, 64, 128, etc)
  let texture = gl2D.textureFromFile("./assets/texture.png");
````
render the image<br>
````js
  //clear the buffer
  gl2D.startScene();
  
  //add image to render list
  //(texture,src:[posX,posY,width,height],dst:[posX,posY,width,height],color:[r,g,b,a])
  gl2D.addImage(texture,[0,0,64,64],[50,50,100,100],[255,255,255,255]);
  
  //bind buffers
  gl2D.endScene();
  
  //render images
  gl2D.renderScene();
````
