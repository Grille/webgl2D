"use strict";

let nullTexture;
let testTexture;
let testTexture2;
let width,height
let gl2D;
let angle = 0;
let ctx;

function main(){
  let canvas = document.getElementById("canvas");
  canvas.width = width = window.innerWidth;
  canvas.height = height = window.innerHeight;
  gl2D = webGL2DStart(canvas);
  ctx = canvas.getContext("2D");
  loadImages();

  render();
}
function loadImages(){
  nullTexture = gl2D.textureFromPixelArray(new Uint8Array([1,1,1]),1,1);
  testTexture = gl2D.textureFromFile("./assets/test.png");
  testTexture2 = gl2D.textureFromFile("./assets/test2.png");
}
function render(){
  let date = Date.now();
  let last = date;
let counter = 0;
  let tmplast,tmpdate,tmpnow;
  tmpdate = Date.now();
  tmplast = tmpdate;
  gl2D.startScene();
  tmpdate = Date.now();
  tmpnow = tmpdate - tmplast;
  console.log("start time = "+tmpnow);
  tmpdate = Date.now();
  tmplast = tmpdate;
  for (let ix = 0;ix < width/64;ix++){
    for (let iy = 0;iy < height/32;iy++){
      gl2D.addImage(testTexture,[0,0,64,32],[ix*64,iy*32,64,32],[ix*iy,0,255,255]);
      counter++;
    }
  }
  angle++;
  for (let ix = 0;ix < width/64;ix++){
    for (let iy = 0;iy < height/32;iy++){
      gl2D.matrix.setTranslate([ix*64+32,iy*32+16])
      let color = [100,ix*iy+angle,255,255];
      while (color[1]>255)color[1]-=255;
      gl2D.matrix.setRotate(angle+ix*iy);
      //gl2D.addImage(testTexture2,[0,0,64,64],[-16,-16,32,32],color);
      counter++;
    }
  }
  gl2D.matrix.reset();
  tmpdate = Date.now();
  tmpnow = tmpdate - tmplast;
  console.log("add time = "+tmpnow);
  tmpdate = Date.now();
  tmplast = tmpdate;
  gl2D.endScene();
  tmpdate = Date.now();
  tmpnow = tmpdate - tmplast;
  console.log("bind time = "+tmpnow);
  tmpdate = Date.now();
  tmplast = tmpdate;
  gl2D.renderScene();
  tmpdate = Date.now();
  tmpnow = tmpdate - tmplast;
  console.log("render time = "+tmpnow);

  date = Date.now();
  let now = date - last;
  console.log("total time = "+now);
  console.log("--size("+counter+")---------------------------------------");
  setTimeout(render, 100);
}