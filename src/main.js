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

let typMap = new Uint16Array(worldWidth*worldHeight);
let heightMap = new Int16Array((worldWidth+1)*(worldHeight+1));
let mapPosX = 7;
let mapPosY = -10;
function main(){
  let canvas = document.getElementById("canvas");
  canvas.width = width = window.innerWidth;
  canvas.height = height = window.innerHeight;
  gl2D = webGL2DStart(canvas);
  ctx = canvas.getContext("2D");

  for (let i = 0;i <(worldWidth+1)*(worldHeight+1);i++)heightMap[i] = -1;
  for (let ix = 0;ix<10;ix++){
      for (let iy = 0;iy<10;iy++){
        heightMap[ix+iy*(worldWidth+1)]=0;
      }
  }
  for (let ix = 0;ix<8;ix++){
      for (let iy = 0;iy<6;iy++){
        heightMap[ix+iy*(worldWidth+1)]=10;
      }
  }
    for (let ix = 0;ix<4;ix++){
      for (let iy = 0;iy<9;iy++){
        heightMap[ix+iy*(worldWidth+1)]=20;
      }
  }
    for (let ix = 0;ix<4;ix++){
      for (let iy = 0;iy<3;iy++){
        heightMap[ix+iy*(worldWidth+1)]=30;
      }
  }
  for (let ix = 10;ix<14;ix++){
      for (let iy = 0;iy<4;iy++){
        heightMap[ix+iy*(worldWidth+1)]=0;
      }
  }

  for (let ix = 5;ix<8;ix++){
      for (let iy = 12;iy<14;iy++){
        heightMap[ix+iy*(worldWidth+1)]=0;
      }
  }
  loadImages();

  render();
}
function loadImages(){
  nullTexture = gl2D.textureFromPixelArray(new Uint8Array([255,255,255]),1,1);
  testTexture = gl2D.textureFromFile("./assets/test.png");
  testTexture = gl2D.textureFromFile("./assets/test.png");
  testTexture2 = gl2D.textureFromFile("./assets/test2.png");
  treeTexture = gl2D.textureFromFile("./assets/tree.png");
  groundTexture = gl2D.textureFromFile("./assets/ground.png");
}
function drawGround(worldPos,pos){
  let color = [];
  let waterColor = [];
  let waterCousticsX = waterCoustics;
  let waterCousticsY = waterCoustics;
  while (waterCousticsX>100)waterCousticsX-=100;
  while (waterCousticsY>50)waterCousticsY-=50;
  if(waterCousticsX>=50)waterCousticsX = 50-(waterCousticsX-50);
  if(waterCousticsY>=25)waterCousticsY = 50-waterCousticsY;
  waterCousticsX/=10;
  waterCousticsY/=10;
  let src = [0,0, 64,0, 64,64, 0,64];
  let vertexPos = [32,32-heightMap[worldPos+(worldWidth+1)]/*u*/, 64,16-heightMap[worldPos+1+(worldWidth+1)]/*r*/, 32,0-heightMap[worldPos+1]/*o*/, 0,16-heightMap[worldPos]];
  for (let i = 0;i<4;i++){
    color[i*4+0] = 60;
    color[i*4+1] = 100;
    color[i*4+2] = 30;
    color[i*4+3] = 255;
  }
  for (let i = 0;i<4;i++){
    waterColor[i*4+0] = 50;
    waterColor[i*4+1] = 100;
    waterColor[i*4+2] = 200;
    waterColor[i*4+3] = 0;
  }
  let curWorldPos;
  let index = 0;
  curWorldPos = worldPos+(worldWidth+1);
  if (heightMap[curWorldPos]<0){
    color[index*4+0] = 200;
    color[index*4+1] = 200;
    color[index*4+2] = 150;
    waterColor[index*4+3] = 255;
  }
  else {
    color[index*4+0] += heightMap[curWorldPos];
  }
  curWorldPos = worldPos+1+(worldWidth+1);index=1;
  if (heightMap[curWorldPos]<0){
    color[index*4+0] = 200;
    color[index*4+1] = 200;
    color[index*4+2] = 150;
    waterColor[index*4+3] = 255;
  }
  else {
    color[index*4+0] += heightMap[curWorldPos];
  }
  curWorldPos = worldPos+1;index=2;
  if (heightMap[curWorldPos]<0){
    color[index*4+0] = 200;
    color[index*4+1] = 200;
    color[index*4+2] = 150;
    waterColor[index*4+3] = 255;
  }
  else {
    color[index*4+0] += heightMap[curWorldPos];
  }
  curWorldPos = worldPos;index=3;
  if (heightMap[curWorldPos]<0){
    color[index*4+0] = 200;
    color[index*4+1] = 200;
    color[index*4+2] = 150;
    waterColor[index*4+3] = 255;
  }
  else {
    color[index*4+0] += heightMap[curWorldPos];
  }
  // for (let i = 0;i<16;i++){
  //   if (color[i]<0)color[i]=0;
  //   if (color[i]>255)color[i]=255;
  // }
  gl2D.matrix.setTranslate([pos[0],pos[1]])
  gl2D.drawPrimitives(groundTexture,src,vertexPos/*l*/,color);
  gl2D.drawPrimitives(groundTexture,src,[32,32, 64,16, 32,0, 0,16]/*l*/,waterColor);
  gl2D.matrix.reset();
}
function drawTree(pos){
  gl2D.matrix.setTranslate([pos[0],pos[1]])
  gl2D.matrix.setRotate(60)
  gl2D.addImage(treeTexture,[0,0,32,64],[-16,-64,32,64],[0,0,0,50]);
  gl2D.matrix.setRotate(0)
  gl2D.addImage(treeTexture,[0,0,32,64],[-16,-64,32,64],[255,255,255,255]);
  gl2D.matrix.reset();
}
function render5(){
  let date = Date.now();
  let last = date;
  let counter = 0;
  let tmplast,tmpdate,tmpnow;
  tmpdate = Date.now();
  tmplast = tmpdate;
  gl2D.startScene();

  for (let ix = 0;ix < width/64;ix++){
    for (let iy = 0;iy < height/32;iy++){


    }
  }
  //gl2D.addQuadImage(testTexture,[0,0,64,32],[64,128, 128,100, 128,64, 64,64],[0,255,0,255]);
  angle++;
  gl2D.matrix.reset();
  gl2D.endScene();
  gl2D.renderScene();

  date = Date.now();
  let now = date - last;
  console.log("total time = "+now);
  console.log("--size("+counter+")---------------------------------------");
  setTimeout(render5, 100);
}

function render() {

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

  for (let ix = 0;ix<100;ix++){
    for (let iy = 0;iy<50;iy++){
      gl2D.matrix.setTranslate([ix*20,iy*20])
      gl2D.matrix.addRotate(0.1)
      gl2D.drawImage(treeTexture,[0,0,32,64],[-16,-64,32,64],[255,255,255,255]);
    }
  }

  gl2D.matrix.reset();

  gl2D.drawImage(nullTexture,[0,0,1,1],[16,16,256,32],[100,100,100,255]);
  if ((now/16.66) < 1) gl2D.drawImage(nullTexture,[0,0,1,1],[16,19,(now/16.66)*256,26],[(now/16.66)*255,200,0,255]);
  else gl2D.drawImage(nullTexture,[0,0,1,1],[16,19,256,26],[200,0,0,255]);

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

  setTimeout(render, 10);
}