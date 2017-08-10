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

let worldWidth = 64;
let worldHeight = 64;

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
  nullTexture = gl2D.textureFromPixelArray(new Uint8Array([1,1,1]),1,1);
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
  tmpdate = Date.now();
  tmpnow = tmpdate - tmplast;
  console.log("start time = "+tmpnow);
  tmpdate = Date.now();
  tmplast = tmpdate;
  for (let ix = 0;ix < width/64;ix++){
    for (let iy = 0;iy < height/32;iy++){


    }
  }
  //gl2D.addQuadImage(testTexture,[0,0,64,32],[64,128, 128,100, 128,64, 64,64],[0,255,0,255]);
  angle++;
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
  setTimeout(render5, 100);
}

function render() {

  let date = Date.now();
  let last = date;

  waterCoustics++;
  if (waterCoustics > 100) waterCoustics=0;
  gl2D.startScene();

  let Indentation = 0;
  let posx = 0;
  let posy = 0;
  let addPosX = (width / 64 + 2)|0 ;
  let addPosY = 1;
  let aktPosX = ((mapPosX|0) + addPosX + addPosY);
  let aktPosY = ((mapPosY|0) + addPosX - addPosY);
  for (let iy = -1; iy <= (height/16)|0; iy++) {
    if (Indentation == 0) {Indentation=1;posy++;posx--;}
    else Indentation = 0;
    aktPosX = ((mapPosX|0)+addPosX+addPosY+posx+Indentation);
    aktPosY = ((mapPosY|0)+addPosX-addPosY+posy);
    for (let ix = (width / 64)|0; ix >= -1;ix--){
      aktPosX--;
      aktPosY--;
      if (aktPosX < worldWidth && aktPosX >= 0 && aktPosY < worldHeight && aktPosY >= 0){
        let drawPosX = 64*ix+32*Indentation;
        let drawPosY = 16*iy;

        let worldPos = aktPosX+aktPosY*(worldWidth+1);
        drawGround(worldPos,[drawPosX,drawPosY]);

    //  gl2D.addImage(testTexture,[0,0,64,64],[drawPosX,drawPosY,64,32],[255,255,255,255]);

        //drawTree([drawPosX+32,drawPosY+16]);
        // context.drawImage(
        // staticEntity.sprite[version][envcode].texture,
        // 0, 0,
        // 64, 64,
        // drawPosX*cscale, ((drawPosY-overDraw))*cscale|0,
        // 64*cscale, ((32+overDraw)*cscale)|0
        // );

      }
    }
  }
  gl2D.endScene();
  gl2D.renderScene();

  date = Date.now();
  let now = date - last;
  console.log("total time = "+now);
  console.log("--size()---------------------------------------");

  setTimeout(render, 10);
}