
let testTexture;
let testTexture2;
let width,height
function main(){
  let canvas = document.getElementById("canvas");
  canvas.width = width = window.innerWidth;
  canvas.height = height = window.innerHeight;
  let context = canvas.getContext("experimental-webgl")
  webGLStart(context);
  loadImages();

  render();
}
function loadImages(){
  testTexture = loadTexture("./assets/test.png");
  testTexture2 = loadTexture("./assets/test2.png");
}
function render(){
  let date = Date.now();
  let last = date;

  gl.clearColor(0.2, 0.2, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let ix = 0;ix < width/64-1;ix++){
    for (let iy = 0;iy < height/64-1;iy++){
    drawImage(testTexture2,[0,0,64,64],[ix*64,iy*64,64,64]);
    }
  }
  date = Date.now();
  let now = date - last;
  console.log(now);
  setTimeout(render, 500);
}