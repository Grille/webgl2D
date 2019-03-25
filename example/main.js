"use strict";

let nullTexture;
let testTexture;
let testTexture2;
let width, height
let gl2D;
let angle = 0;
let ctx;
let treeTexture;
let groundTexture;
let now = 0;
let startTime = 0;
let useTime = 0;
let bindTime = 0;
let renderTime = 0;
let worldWidth = 16;
let worldHeight = 16;
let waterCoustics = 0;

let rotate = 45;
let lastDate = 0;
let mouseX = 0;
let mouseY = 0;

let texture;

let stats;
function main() {
  stats = new Stats();
  //stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild( stats.dom );
  stats.showPanel( 0 );

  let canvas = document.getElementById("canvas");
  canvas.width = width = window.innerWidth;
  canvas.height = height = window.innerHeight;
  gl2D = new WebGL2DContext(canvas);
  if (gl2D === null)alert("Your browser does not support WebGL")
  loadImages();
  window.onresize = ()=>{
    canvas.width = width = window.innerWidth;
    canvas.height = height = window.innerHeight;
  }
  ctx = canvas.getContext("2D");


  render();
  
}
function loadImages() {
  nullTexture = gl2D.textureFromPixelArray(new Uint8Array([255, 255, 255]), 1, 1);
  testTexture = gl2D.textureFromFile("./example/assets/test.png");
  testTexture2 = gl2D.textureFromFile("./example/assets/test2.png");
  treeTexture = gl2D.textureFromFile("./example/assets/tree.png");
  groundTexture = gl2D.textureFromFile("./example/assets/ground.png");
  texture = gl2D.textureFromPixelArray(([255, 255, 255,  0, 255, 255,  255, 0, 255,  255, 255, 0]), 2, 2);
}

function render() {
  stats.begin();

  /*
  gl2D.startScene();
  gl2D.drawImage(groundTexture,[0,0,64,64],[0,0,64,64],[255,255,255,255])
  gl2D.endScene();
  gl2D.renderScene();

  window.requestAnimationFrame(render);

  return;
  */

  gl2D.startScene();

  gl2D.matrix.reset();
  gl2D.matrix.rotate(20);
  //gl2D.matrix.transform(2,0.5,0.5,2,0,0);
  gl2D.drawImage(testTexture2, [0, 0, 64, 64], [0, 0, 64, 64], [0, 0, 255, 255]);
  gl2D.drawImage(testTexture2, [0, 0, 64, 64], [64, 0, 64, 64], [0, 100, 255, 255]);

  
  gl2D.matrix = new TransformBuffer();
  let count = 0;
  let mapSize = 64;
  let tileSize = 16;
  let textureSize = 64;
  rotate+=0.2;
  let rectSrc = [0,0,textureSize,textureSize]
  let rectDst = [0,0,tileSize,tileSize];
  for (let ix = 0; ix < mapSize; ix++) {
    for (let iy = 0; iy < mapSize; iy++) {
      gl2D.matrix.reset();
      gl2D.matrix.translate(ix * tileSize, iy * tileSize);
      gl2D.matrix.translate(-tileSize*(mapSize/2), -tileSize*(mapSize/2));
      gl2D.matrix.rotate(rotate);
      gl2D.matrix.scale(1,0.5);
      gl2D.matrix.translate(canvas.width/2, canvas.height/2);
      //gl2D.matrix.translate(32*32, 0);
      //gl2D.matrix.scale(1,0.5);
      let r = (ix /mapSize)*255, g = (iy /mapSize)*255, b = 255, a = 255;
      gl2D.drawImage(groundTexture,[0,0,textureSize,textureSize],[0,0,tileSize,tileSize],[r,g,b,a])
      //gl2D.drawSquare(groundTexture, [0, 0, textureSize, 0, textureSize, textureSize, 0, textureSize], [0, 0, tileSize, 0, tileSize, tileSize, 0, tileSize], [r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a]);
      count++;
    }
  }

  gl2D.matrix.reset();
  gl2D.drawImage(testTexture2, [0, 0, 64, 64], [0, 128, 64, 64], [0, 0, 255, 255]);
  gl2D.endScene();
  gl2D.renderScene();

  window.requestAnimationFrame(render);
  //window.setTimeout(render,100);
  //ctx.font = "20px Georgia";
  //ctx.fillText("Hello World!", 10, 50);
  stats.end();
}

window.addEventListener("mousemove", (e) => {
  mouseX = e.x;
  mouseY = e.y;
});