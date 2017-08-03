"use strict";

function webGL2DStart(canvas) {
  let gl2D = 
  {
    gl:null,
    shaderProgram:null,
    vertexPosition:[],
    vertexTextureCoord:[],
    vertexColor:[],
    vertexIndex:[],
    textureList:[],
    vertexPositionBuffer:null,
    vertexTextureCoordBuffer:null,
    vertexColorBuffer:null,
    vertexIndexBuffer:null,
    curOffset: 0,

    initShaders: ()=>{
      let gl = gl2D.gl;
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

      let shaderProgram = gl.createProgram();
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
      gl2D.shaderProgram = shaderProgram;
    },
    loadTexture: (path) => {
      let gl = gl2D.gl;
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
    },
    startScene: () => {
      gl2D.vertexPosition = [];
      gl2D.vertexTextureCoord = [];
      //gl2D.vertexColor = [];
      gl2D.vertexIndex = [];
      gl2D.textureList = [];
      gl2D.curOffset = 0;
    },
    addImage: (texture,src,dst) => {
      let gl = gl2D.gl;
      let offset = gl2D.curOffset;

      let glwidth = gl.viewportWidth, glheight = gl.viewportHeight;
      let imagewitdh = dst[2]/glwidth*2, imageheight = dst[3]/glheight*2;
      let width = testTexture.image.width, height = testTexture.image.height;
      let 
        posX1 = -1+dst[0]/glwidth*2, 
        posX2 = posX1+imagewitdh, 
        posY1 = 1-(dst[1]/glheight*2+imageheight), 
        posY2 = posY1+imageheight;
      let
        startsrcX = src[0] / width,
        endsrcX = (src[0] + src[2]) / width,
        startsrcY = 1- src[1] / height,
        endsrcY = 1- (src[1] + src[3]) / height;

      gl2D.vertexPosition[offset*3*4+0] = posX1;
      gl2D.vertexPosition[offset*3*4+1] = posY1;
      gl2D.vertexPosition[offset*3*4+2] = 0;
      gl2D.vertexPosition[offset*3*4+3] = posX2;
      gl2D.vertexPosition[offset*3*4+4] = posY1;
      gl2D.vertexPosition[offset*3*4+5] = 0;
      gl2D.vertexPosition[offset*3*4+6] = posX2;
      gl2D.vertexPosition[offset*3*4+7] = posY2;
      gl2D.vertexPosition[offset*3*4+8] = 0;
      gl2D.vertexPosition[offset*3*4+9] = posX1;
      gl2D.vertexPosition[offset*3*4+10] = posY2;
      gl2D.vertexPosition[offset*3*4+11] = 0;

      gl2D.vertexTextureCoord[offset*2*4+0] = startsrcX;
      gl2D.vertexTextureCoord[offset*2*4+1] = endsrcY;
      gl2D.vertexTextureCoord[offset*2*4+2] = endsrcX;
      gl2D.vertexTextureCoord[offset*2*4+3] = endsrcY;
      gl2D.vertexTextureCoord[offset*2*4+4] = endsrcX;
      gl2D.vertexTextureCoord[offset*2*4+5] = startsrcY;
      gl2D.vertexTextureCoord[offset*2*4+6] = startsrcX;
      gl2D.vertexTextureCoord[offset*2*4+7] = startsrcY;

      //gl2D.vertexColor[offset*6+0] = 0;

      gl2D.vertexIndex[offset*6+0] = offset*4+0;
      gl2D.vertexIndex[offset*6+1] = offset*4+1;
      gl2D.vertexIndex[offset*6+2] = offset*4+2;
      gl2D.vertexIndex[offset*6+3] = offset*4+0;
      gl2D.vertexIndex[offset*6+4] = offset*4+2;
      gl2D.vertexIndex[offset*6+5] = offset*4+3;

      gl2D.textureList[offset] = texture;
      gl2D.curOffset++;
    },
    endScene: () => {
      let gl = gl2D.gl;
      gl2D.vertexPositionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexPositionBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gl2D.vertexPosition), gl.STATIC_DRAW);

      // cubeVertexColorBuffer = gl.createBuffer ();
      // gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
      // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColor), gl.STATIC_DRAW);

      gl2D.vertexTextureCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexTextureCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gl2D.vertexTextureCoord), gl.STATIC_DRAW);

      gl2D.vertexIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl2D.vertexIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gl2D.vertexIndex), gl.STATIC_DRAW);
      gl2D.vertexIndexBuffer.numItems = gl2D.curOffset*6;

      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexPositionBuffer);
      gl.vertexAttribPointer(gl2D.shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexTextureCoordBuffer);
      gl.vertexAttribPointer(gl2D.shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl2D.vertexIndexBuffer);
    },
    renderScene: () => {
      let gl = gl2D.gl;

      // gl.uniform1i(shaderProgram.samplerUniform, 0);

      //gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
      //setMatrixUniforms();
      for (let i = 0;i<gl2D.curOffset;i++){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, gl2D.textureList[i]);
        gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, i*6*2);
      };
      //gl.drawElements(gl.TRIANGLES, 6*(gl2D.curOffset), gl.UNSIGNED_SHORT, 0*6);
    },
    drawImage:(texture,src,dst) => {
      let gl = gl2D.gl;
      let shaderProgram = gl2D.shaderProgram;
      let cubeVertexPositionBuffer;
      let cubeVertexTextureCoordBuffer;
      let cubeVertexColorBuffer
      let cubeVertexIndexBuffer;

      let glwidth = gl.viewportWidth, glheight = gl.viewportHeight;
      let imagewitdh = dst[2]/glwidth*2, imageheight = dst[3]/glheight*2;
      let width = testTexture.image.width, height = testTexture.image.height;
      let 
        posX1 = -1+dst[0]/glwidth*2, 
        posX2 = posX1+imagewitdh, 
        posY1 = 1-(dst[1]/glheight*2+imageheight), 
        posY2 = posY1+imageheight;
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

      cubeVertexIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
      let cubeVertexIndices = [
        0, 1, 2,      0, 2, 3,    // Front face
      ];
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
      cubeVertexIndexBuffer.numItems = 6;

      gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
      gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer);
      gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);




      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      // gl.uniform1i(shaderProgram.samplerUniform, 0);

      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
      //setMatrixUniforms();
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0*6);
    },
  };
  gl2D.gl = canvas.getContext("webgl");
  gl2D.gl.viewportWidth = canvas.width;
  gl2D.gl.viewportHeight = canvas.height;
  gl2D.initShaders();
  return gl2D;
};
