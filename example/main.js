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

let lastDate = 0;
let mouseX = 0;
let mouseY = 0;

function main() {
  let canvas = document.getElementById("canvas");
  canvas.width = width = window.innerWidth;
  canvas.height = height = window.innerHeight;
  gl2D = new WebGL2DContext(canvas);
  loadImages();
  
  ctx = canvas.getContext("2D");

  

  render();
  
}
function loadImages() {
  nullTexture = gl2D.textureFromPixelArray(new Uint8Array([255, 255, 255]), 1, 1);
  testTexture = gl2D.textureFromFile("./example/assets/test.png");
  testTexture2 = gl2D.textureFromFile("./example/assets/test2.png");
  treeTexture = gl2D.textureFromFile("./example/assets/tree.png");
  groundTexture = gl2D.textureFromFile("./example/assets/ground.png");
}

function render() {

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
  gl2D.drawImage(testTexture2, [0, 0, 64, 64], [0, 64, 64, 64], [0, 0, 255, 255]);

  for (let ix = 0; ix < 20; ix++) {
    for (let iy = 0; iy < 20; iy++) {
      gl2D.matrix.reset();
      gl2D.matrix.translate(ix * 64, iy * 64);
      gl2D.matrix.rotate(45);
      gl2D.matrix.scale(1,0.5);
      gl2D.matrix.translate(32*32, 0);
      //gl2D.matrix.scale(1,0.5);
      let r = ix * 12, g = iy * 12, b = 255, a = 255;
      gl2D.drawSquare(groundTexture, [0, 0, 64, 0, 64, 64, 0, 64], [0, 0, 64, 0, 64, 64, 0, 64], [r, g, b, a, r, g, b, a, r, g, b, a, r, g, b, a]);
    }
  }

  gl2D.matrix.reset();
  gl2D.drawImage(testTexture2, [0, 0, 64, 64], [0, 128, 64, 64], [0, 0, 255, 255]);
  gl2D.endScene();
  gl2D.renderScene();

  window.requestAnimationFrame(render);
  //window.setTimeout(render,100);
}

window.addEventListener("mousemove", (e) => {
  mouseX = e.x;
  mouseY = e.y;
});