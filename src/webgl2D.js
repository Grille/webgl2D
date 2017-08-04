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
    lastTexture: 0,


    initShaders: ()=>{
      let gl = gl2D.gl;
      let fragmentShaderCode = `
        precision mediump float;

        varying vec2 vTextureCoord;
        varying vec4 vColor;

        uniform float uAlpha;
        uniform sampler2D uSampler;

        void main(void) {
          vec4 textureColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));
          gl_FragColor = vec4(textureColor.rgb * vColor.rgb, textureColor.a * vColor.a);
        }
      `;
      let vertexShaderCode = `
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;
        attribute vec4 aVertexColor;

        varying vec2 vTextureCoord;
        varying vec4 vColor;

        void main(void) {
            gl_Position = vec4(aVertexPosition, 1.0);
            vTextureCoord = aTextureCoord;
            vColor = aVertexColor;
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

      shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
      gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

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
      gl2D.vertexColor = [];
      gl2D.vertexIndex = [];
      gl2D.textureList = [];
      gl2D.curOffset = 0;
    },
    addImage: (texture,src,dst,color) => {
      let gl = gl2D.gl;
      let offset = gl2D.curOffset;
      let sceneWidth = gl.viewportWidth, sceneHeight = gl.viewportHeight;
      let imageWidth = testTexture.image.width, imageHeight = testTexture.image.height;
      let midx = dst[0]+dst[2] / 2;
      let midy = dst[1]+dst[3] / 2;
      dst[2]+=dst[0];dst[3]+=dst[1];
      
                    // let tx = (int)((dst[0] - midx) * cos - (dst[1] - midy) * sin) + (int)(midx * 1.5f);
                    // let ty = (int)((dst[1] - midy) * cos + (dst[0] - midx) * sin) + (int)(midy * 1.5f);
      let 
        posX1 = -1+dst[0]/sceneWidth*2, 
        posX2 = -1+dst[2]/sceneWidth*2, 
        posY1 = 1-(dst[1]/sceneHeight*2),
        posY2 = 1-(dst[3]/sceneHeight*2);
      let
        startsrcX = src[0] / imageWidth,
        endsrcX = (src[0] + src[2]) / imageWidth,
        startsrcY = 1- src[1] / imageHeight,
        endsrcY = 1- (src[1] + src[3]) / imageHeight;

      gl2D.vertexPosition[offset*3*4+0] = posX1;//ul
      gl2D.vertexPosition[offset*3*4+1] = posY2;
      gl2D.vertexPosition[offset*3*4+2] = 0;
      gl2D.vertexPosition[offset*3*4+3] = posX2;//ur
      gl2D.vertexPosition[offset*3*4+4] = posY2;
      gl2D.vertexPosition[offset*3*4+5] = 0;
      gl2D.vertexPosition[offset*3*4+6] = posX2;//or
      gl2D.vertexPosition[offset*3*4+7] = posY1;
      gl2D.vertexPosition[offset*3*4+8] = 0;
      gl2D.vertexPosition[offset*3*4+9] = posX1;//ol
      gl2D.vertexPosition[offset*3*4+10] = posY1;
      gl2D.vertexPosition[offset*3*4+11] = 0;

      gl2D.vertexTextureCoord[offset*2*4+0] = startsrcX;
      gl2D.vertexTextureCoord[offset*2*4+1] = endsrcY;
      gl2D.vertexTextureCoord[offset*2*4+2] = endsrcX;
      gl2D.vertexTextureCoord[offset*2*4+3] = endsrcY;
      gl2D.vertexTextureCoord[offset*2*4+4] = endsrcX;
      gl2D.vertexTextureCoord[offset*2*4+5] = startsrcY;
      gl2D.vertexTextureCoord[offset*2*4+6] = startsrcX;
      gl2D.vertexTextureCoord[offset*2*4+7] = startsrcY;

      gl2D.vertexColor[offset*4*4+0] = color[0];//r
      gl2D.vertexColor[offset*4*4+1] = color[1];//g
      gl2D.vertexColor[offset*4*4+2] = color[2];//b
      gl2D.vertexColor[offset*4*4+3] = color[3];//a
      gl2D.vertexColor[offset*4*4+4] = color[0];
      gl2D.vertexColor[offset*4*4+5] = color[1];
      gl2D.vertexColor[offset*4*4+6] = color[2];
      gl2D.vertexColor[offset*4*4+7] = color[3];
      gl2D.vertexColor[offset*4*4+8] = color[0];
      gl2D.vertexColor[offset*4*4+9] = color[1];
      gl2D.vertexColor[offset*4*4+10] = color[2];
      gl2D.vertexColor[offset*4*4+11] = color[3];
      gl2D.vertexColor[offset*4*4+12] = color[0];
      gl2D.vertexColor[offset*4*4+13] = color[1];
      gl2D.vertexColor[offset*4*4+14] = color[2];
      gl2D.vertexColor[offset*4*4+15] = color[3];

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

      gl2D.vertexColorBuffer = gl.createBuffer ();
      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexColorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gl2D.vertexColor), gl.STATIC_DRAW);

      gl2D.vertexTextureCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexTextureCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gl2D.vertexTextureCoord), gl.STATIC_DRAW);

      gl2D.vertexIndexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl2D.vertexIndexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(gl2D.vertexIndex), gl.STATIC_DRAW);
      gl2D.vertexIndexBuffer.numItems = gl2D.curOffset*6;

      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexPositionBuffer);
      gl.vertexAttribPointer(gl2D.shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexColorBuffer);
      gl.vertexAttribPointer(gl2D.shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

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
      // gl.bindTexture(gl.TEXTURE_2D, gl2D.textureList[0]);
      // gl.drawElements(gl.TRIANGLES, 6*(gl2D.curOffset), gl.UNSIGNED_SHORT, 0*6);
    },
  };
  gl2D.gl = canvas.getContext("webgl");
  gl2D.gl.viewportWidth = canvas.width;
  gl2D.gl.viewportHeight = canvas.height;
  gl2D.initShaders();
  return gl2D;
};
