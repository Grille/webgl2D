"use strict";

let nullTexture;
let testTexture;
let testTexture2;
let width,height
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
let waterCoustics=0;

let lastDate = 0;
let mouseX = 0;
let mouseY = 0;

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
  nullTexture = gl2D.textureFromPixelArray(new Uint8Array([255,255,255]),1,1);
  testTexture = gl2D.textureFromFile("./example/assets/test.png");
  testTexture = gl2D.textureFromFile("./example/assets/test.png");
  testTexture2 = gl2D.textureFromFile("./example/assets/ASPH17.png");
  treeTexture = gl2D.textureFromFile("./example/assets/tree.png");
  groundTexture = gl2D.textureFromFile("./example/assets/ground.png");
}

function render() {

  let time = Date.now() -lastDate;
  lastDate = Date.now();
  let date = Date.now();
  let last = date;
  let tmplast

  waterCoustics++;
  if (waterCoustics > 100) waterCoustics=0;

  tmplast = Date.now();
  gl2D.startScene();
  date = Date.now();
  startTime = (startTime*3 + (date - tmplast))/4;

  tmplast = Date.now();

  gl2D.matrix.reset();

  let src = new Uint8Array([0,0,64,64])
  let dst = new Int32Array([128,128,64,64])
  let color = new Uint8Array([0,200,0,255])

/*
  for (let i = 0;i<6000;i++){
    let input = [0,0,64,64]
    dst[0] = input[0];
    dst[1] = input[1];
    dst[2] = input[2];
    dst[3] = input[3];
    gl2D.drawImage(nullTexture,[0,0,64,64],[128,128,64,64],[0,200,0,255]);
  }
*/


  let width = canvas.width, height = canvas.height;



  let posList = [width/2,0]
  let colorList = [0,150,100,255];
  let offsetPos = 2;
  let offsetColor = 4;

  // posList[offsetPos] = 0;
  // posList[offsetPos+1] = height 
  // colorList[offsetColor] = colorList[0];
  // colorList[offsetColor+1] = colorList[1];
  // colorList[offsetColor+2] = colorList[2];
  // colorList[offsetColor+3] = colorList[3];
  // offsetPos += 2
  // offsetColor += 4;
  for (let i = 0; i<=width/10;i++){
  posList[offsetPos] = i*10;posList[offsetPos+1] = 300+Math.random()*200;
  colorList[offsetColor] = 0;
  colorList[offsetColor+1] = 200;
  colorList[offsetColor+2] = 255;
  colorList[offsetColor+3] = 1;
  offsetPos += 2
  offsetColor += 4;
  }

  //gl2D.drawPrimitives(nullTexture,posList,posList,colorList);
  
  // posList[offsetPos] = width;
  // posList[offsetPos+1] = height 
  // colorList[offsetColor] = colorList[0];
  // colorList[offsetColor+1] = colorList[1];
  // colorList[offsetColor+2] = colorList[2];
  // colorList[offsetColor+3] = colorList[3];

  gl2D.matrix.setTranslate([256,256]);
  gl2D.drawSquare(groundTexture,[0,0, 64,0, 64,64, 0,64],[0,0, 64,0, 64,64, 0,64],[255,255,255,255, 255,255,255,255, 255,255,255,255, 255,255,255,255]);
  //gl2D.drawImage(nullTexture,[0,0,1,1],[mouseX-8,mouseY-8,16,16],[255,0,0,100]);
  gl2D.matrix.addTranslate([64,0]);
  gl2D.drawSquare(groundTexture,[0,0, 64,0, 64,64, 0,64],[0,0, 64,0, 64,64, 0,64],[255,255,255,255, 0,255,255,255, 255,255,255,255, 255,255,255,255]);
  gl2D.matrix.addTranslate([64,0]);
  gl2D.drawSquare(groundTexture,[0,0, 64,0, 64,64, 0,64],[0,0, 64,0, 64,64, 0,64],[0,255,255,255, 0,255,255,255, 255,255,255,255, 255,255,255,255]);
  gl2D.matrix.reset();

  for (let iy = 0;iy<19;iy++){
    for (let ix = 0;ix<500;ix++){
      gl2D.matrix.addRotate(1+angle);
      gl2D.matrix.setScale(1,iy);
      gl2D.drawImage(groundTexture,[0,0,64,64],[0+ix,400+iy,64,64],[ix,255,iy/2,100]);
    }
  }
  angle+=0.0001;

  gl2D.matrix.reset();
  

  gl2D.drawImage(nullTexture,[0,0,1,1],[mouseX-8,mouseY-8,16,16],[255,0,0,100]);










  gl2D.drawImage(nullTexture,[0,0,1,1],[16,16,256,32],[100,100,100,255]);
  if ((now/16.66) < 1) gl2D.drawImage(nullTexture,[0,0,1,1],[16,19,(now/16.66)*256,26],[(now/16.66)*255,200,0,255]);
  else {
    gl2D.drawImage(nullTexture,[0,0,1,1],[16,19,256,26],[255,150,0,255]);
    gl2D.drawImage(nullTexture,[0,0,1,1],[16,19,(now/16.66)*256-256,26],[255,0,0,255]);
  }
  let fullTime = useTime + bindTime + renderTime;
  gl2D.drawImage(nullTexture,[0,0,1,1],[16,64,256,32],[100,100,100,255]);
  gl2D.drawImage(nullTexture,[0,0,1,1],[16,67,(useTime/fullTime)*256,26],[200,0,0,255]);
  gl2D.drawImage(nullTexture,[0,0,1,1],[16+(useTime/fullTime)*256,67,(bindTime/fullTime)*256,26],[0,200,0,255]);
  gl2D.drawImage(nullTexture,[0,0,1,1],[16+(useTime/fullTime)*256+(bindTime/fullTime)*256,67,(renderTime/fullTime)*256,26],[0,0,200,255]);

  date = Date.now();
  useTime = (useTime*3 + (date - tmplast))/4;

  tmplast = Date.now();
  gl2D.endScene();//--
  date = Date.now();
  bindTime = (bindTime*3 + (date - tmplast))/4;

  tmplast = Date.now();
  gl2D.renderScene();//--
  date = Date.now();
  renderTime = (renderTime*3 + (date - tmplast))/4;
  date = Date.now();
  now = (now*3 + (date - last))/4;

  // console.log("----------------------------------------------------");
  // console.log("startTime = "+ startTime);
  // console.log("useTime = "+ useTime);
  // console.log("bindTime = "+ bindTime);
  // console.log("renderTime = "+ renderTime);
  // console.log("functionTime = "+ (date - lastDate));
  // console.log("fullTime = "+ time);
  // console.log("fps = "+ 1000/time);

  window.requestAnimationFrame(render);
  //window.setTimeout(render,100);
}

window.addEventListener("mousemove", (e) => {
  mouseX = e.x;
  mouseY = e.y;
});