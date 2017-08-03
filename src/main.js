
let testTexture;
let testTexture2;
let width,height
let gl2D;
function main(){
  let canvas = document.getElementById("canvas");
  canvas.width = width = window.innerWidth;
  canvas.height = height = window.innerHeight;
  gl2D = webGL2DStart(canvas);
  loadImages();

  render();
}
function loadImages(){
   testTexture = gl2D.loadTexture("./assets/test.png");
   testTexture2 = gl2D.loadTexture("./assets/test2.png");
}
function render(){
  let date = Date.now();
  let last = date;

  // gl.clearColor(0.2, 0.2, 1, 1);
  // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl2D.startScene();
  for (let ix = 0;ix < width/64-1;ix++){
    for (let iy = 0;iy < height/32-1;iy++){
      gl2D.addImage(testTexture,[0,0,64,32],[ix*64,iy*32,64,32]);
      gl2D.addImage(testTexture2,[0,0,64,32],[ix*64,iy*32,64,32]);
    // gl2D.drawImage(testTexture,[0,0,64,32],[ix*64,iy*32,64,32]);
    // gl2D.drawImage(testTexture2,[0,0,64,32],[ix*64,iy*32,64,32]);
    }
  }
  gl2D.endScene();
  gl2D.renderScene();
//drawImage(testTexture,[0,0,64,32],[0,0,64,32]);
       //gl2D.drawImage(testTexture,[0,0,64,32],[0,0,64,32]);
  date = Date.now();
  let now = date - last;
  console.log(now);
  setTimeout(render, 500);
}