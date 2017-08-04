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
  gl2D.addImage(texture,[0,0,64,64],[-32,-32,64,64],color);
  
  //bind buffers
  gl2D.endScene();
  
  //render images
  gl2D.renderScene();
````
use matrix<br>
````js
  //Set new center for coordinate system
  gl2D.matrix.setTranslate([64,64]);
  
  //add to current values
  gl2D.matrix.addTranslate([64,64]);
  
  //rotates around the center
  gl2D.matrix.addRotate(10);
  
  //reset matrix
  gl2D.matrix.reset();
````
