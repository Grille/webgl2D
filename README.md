# webgl2D
2d webgl library
<br>
## Features
Easy and fast drawing images with webGL<br>
matrix functionality<br>
colorable<br>
optional custom shader programs<br>
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
  //texture must be a potency of 2 (32, 64, 128, etc), otherwise it is enlarged when created

  //you can create a texture from a file,
  texture = gl2D.textureFromFile("./assets/texture.png");

  //from image or canvas,
  texture = gl2D.textureFromImage(image);

  //or from Uint8Array 
  //whether it is RGB or RGBA is automatically determined
  //parameter(pixelArray,width,height);
  texture = gl2D.textureFromPixelArray(new Uint8Array(pixelArray),64,64);
````
render the image<br>
````js
  //clear the buffer
  gl2D.startScene();
  
  //add image to render list //parameter(texture,src:[posX,posY,width,height],dst:[posX,posY,width,height],color:[r,g,b,a])
  gl2D.drawImage(texture,[0,0,64,64],[64,64,64,64],[255,255,255,255]);

  //bind buffers
  gl2D.endScene();
  
  //render images
  gl2D.renderScene();
````
### advanced
use matrix<br>
````js
  //moves the center of coordinate system
  gl2D.matrix.setTranslate(64,0);
  
  //scale the coordinate system
  gl2D.matrix.setScale(1,1);

  //rotates around the center
  gl2D.matrix.addRotate(10);

  add...
  //add to current values
  set...
  //replace current values
  
  //reset matrix to default
  gl2D.matrix.reset();

  //return current matrix
  matrix = gl2D.matrix.save();

  //replace current matrix with saved matrix
  gl2D.matrix.load(matrix);
````
extended drawing functions<br>
````js
  //parameter(texture,src:[posX1,posY1,posX2,posY2,...],dst:[posX1,posY1,posX2,posY2,...],color:[r,g,b,a, r,g,b,a,...])

  //add triangle to render list (use 3 points)
  gl2D.drawTriangle(texture,[0,0, 64,0, 32,32],[0,0, 64,0, 32,32],[255,0,0,255, 0,255,0,255, 0,0,255,255]);

  //add square to render list (use 4 points)
  gl2D.drawSquare(texture,[0,0, 64,0, 64,64, 0,64],[0,0, 64,0, 64,64, 0,64],[255,255,255,255, 255,255,255,255, 255,255,255,255, 255,255,255,255]);
````
custom shaders<br>
````js
  //default shader code
  vertexShaderCode = 
  `
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;
    attribute vec4 aVertexColor;

    varying vec2 vTextureCoord;
    varying vec4 vColor;

    void main(void) {
        gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
        vColor = aVertexColor / vec4(255,255,255,255);
    }
  `
  fragmentShaderCode = 
  `
    precision mediump float;

    varying vec2 vTextureCoord;
    varying vec4 vColor;

    uniform sampler2D uSampler;

    void main(void) {
      gl_FragColor = vec4(texture2D(uSampler, vTextureCoord) * vColor);
    }
  `

  //compile shader and return a shader program
  shaderProgram = gl2D.compileShader(vertexShaderCode,fragmentShaderCode)

  //use this shader program 
  gl2D.useShader(shaderProgram)
````
