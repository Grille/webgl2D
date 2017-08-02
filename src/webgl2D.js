"use strict";



let gl;
let shaderProgram;

function initShaders(gl) {
  let fragmentShaderCode = `
    precision mediump float;

    varying vec2 vTextureCoord;

    uniform float uAlpha;

    uniform sampler2D uSampler;

    void main(void) {
      vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
      gl_FragColor = vec4(textureColor.rgb, textureColor.a);
    }
  `;
  let vertexShaderCode = `
    attribute vec3 aVertexPosition;
    attribute vec2 aTextureCoord;

    varying vec2 vTextureCoord;

    void main(void) {
        gl_Position = vec4(aVertexPosition, 1.0);
        vTextureCoord = aTextureCoord;
    }
  `;
  let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  let vertexShader = gl.createShader(gl.VERTEX_SHADER);

  // Attach vertex shader source code
  gl.shaderSource(vertexShader, vertexShaderCode);
  // Compile the vertex shader
  gl.compileShader(vertexShader);

  // Attach fragment shader source code
  gl.shaderSource(fragmentShader, fragmentShaderCode);
  // Compile the fragmentt shader
  gl.compileShader(fragmentShader);

  shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert("Could not initialise shaders");
  }

  gl.useProgram(shaderProgram);

  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

  shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
  gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
  shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
}


function loadTexture(path) {
  let texture
  texture = gl.createTexture();
  texture.image = new Image();
  texture.image.onload = function () {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }

  texture.image.src = path;
  return texture;
}

function drawImage(texture,src,dst) {
    let cubeVertexPositionBuffer;
    let cubeVertexTextureCoordBuffer;
    let cubeVertexColorBuffer
    let cubeVertexIndexBuffer;
    
    let glwidth = gl.viewportWidth, glheight = gl.viewportHeight;
    let imagewitdh = dst[2]/glwidth*2, imageheight = dst[2]/glheight*2;
    let 
      posX1 = -1+dst[0]/glwidth*2, 
      posX2 = posX1+imagewitdh, 
      posY1 = 1-(dst[1]/glheight*2+imageheight), 
      posY2 = posY1+imageheight;
    let width = testTexture.image.width, height = testTexture.image.height;
    let
      startsrcX = src[0] / width,
      endsrcX = (src[0] + src[2]) / width,
      startsrcY = 1- src[1] / height,
      endsrcY = 1- (src[1] + src[3]) / height;

    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    let vertices = [
      //x,y,z
      posX1,   posY1,  0.0,
      posX2,   posY1,  0.0,
      posX2,   posY2,  0.0,
      posX1,   posY2,  0.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;

    // cubeVertexColorBuffer = gl.createBuffer ();
    // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    // let colors = [0,0,1, 1,0,0, 1,0,0, 0,1,0,];
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    // cubeVertexColorBuffer.itemSize = 3;
    // cubeVertexColorBuffer.numItems = 4;

    cubeVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    let textureCoords = [
      // x,Y
      startsrcX, endsrcY,//ul
      endsrcX, endsrcY,//ur
      endsrcX, startsrcY,//or
      startsrcX, startsrcY,//ol
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cubeVertexTextureCoordBuffer.itemSize = 2;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    let cubeVertexIndices = [
      0, 1, 2,      0, 2, 3,    // Front face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 6;






    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
   // gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    //setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
}
let _ = 7;
function webGLStart(context) {
    gl = context;
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    initShaders(gl);
}



