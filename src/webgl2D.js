"use strict";

function webGL2DStart(canvas) {
  let gl2D = {

    //--private--
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
      lastTexture: null,
      textureContinuous:[],
      textureOffset: 0,

      textureCounter: 0,
      translate:[0,0],
      angle:0,
      sin:0,
      cos:0,

      //draw used

    //--public--
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
      textureFromFile: (path) => {
        let gl = gl2D.gl;
        let texture
        texture = gl.createTexture();
        texture.image = new Image();
        texture.image.onload = function () {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.bindTexture(gl.TEXTURE_2D, null);
          texture.width = texture.image.width;
          texture.height = texture.image.height;
          texture.index = gl2D.textureCounter;
          gl2D.textureCounter++
        }
        texture.image.src = path;
        return texture;
      },
      textureFromPixelArray: (dataArray, width, height) => {
        let gl = gl2D.gl;
        let type = gl.RGB;
        // if (dataArray.lenght / (width * height)==3) type = gl.RGB;
        // else type = gl.RGBA;
        let texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, type, width, height, 0, type, gl.UNSIGNED_BYTE, dataArray);
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST );
        gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST );
        gl.generateMipmap( gl.TEXTURE_2D );
        gl.bindTexture( gl.TEXTURE_2D, null )
        texture.width = width;
        texture.height = height;
        texture.index = gl2D.textureCounter;
        gl2D.textureCounter++
        return texture;
      },

      startScene: () => {

        // gl2D.vertexPosition = [];
        // gl2D.vertexTextureCoord = [];
        // gl2D.vertexColor = [];
        // gl2D.vertexIndex = [];
        // gl2D.textureList = [];
        // gl2D.textureContinuous = [];

        gl2D.curOffset = 0;
        gl2D.lastTexture = null;
        gl2D.textureOffset = -1;
      },
      useMatrix: (dst) => {
        let gl = gl2D.gl;
        let translate = gl2D.translate;
        let sin = gl2D.sin, cos = gl2D.cos;
        let sceneWidth = gl.viewportWidth, sceneHeight = gl.viewportHeight;
        return [
          -1+((dst[0] * cos - dst[1] * sin)+translate[0])/sceneWidth*2,
          +1-((dst[1] * cos + dst[0] * sin)+translate[1])/sceneHeight*2,
          -1+((dst[2] * cos - dst[3] * sin)+translate[0])/sceneWidth*2,
          +1-((dst[3] * cos + dst[2] * sin)+translate[1])/sceneHeight*2,
          -1+((dst[4] * cos - dst[5] * sin)+translate[0])/sceneWidth*2,
          +1-((dst[5] * cos + dst[4] * sin)+translate[1])/sceneHeight*2,
          -1+((dst[6] * cos - dst[7] * sin)+translate[0])/sceneWidth*2,
          +1-((dst[7] * cos + dst[6] * sin)+translate[1])/sceneHeight*2,
        ];
      },
    
      addQuadImage: (texture,src,dst,inputColor) => {
        let gl = gl2D.gl;
        let offset = gl2D.curOffset;
        let translate = gl2D.translate;
        let color = [inputColor[0]/255,inputColor[1]/255,inputColor[2]/255,inputColor[3]/255];
        let dstPos = gl2D.useMatrix(dst);

        let imageWidth = texture.width, imageHeight = texture.height;
        let
          startsrcX = src[0] / imageWidth,
          endsrcX = (src[0] + src[2]) / imageWidth,
          startsrcY = src[1] / imageHeight,
          endsrcY = (src[1] + src[3]) / imageHeight;

        gl2D.vertexPosition[offset*3*4+0] = dstPos[0];//ul
        gl2D.vertexPosition[offset*3*4+1] = dstPos[1];
        gl2D.vertexPosition[offset*3*4+2] = 0;
        gl2D.vertexPosition[offset*3*4+3] = dstPos[2];//ur
        gl2D.vertexPosition[offset*3*4+4] = dstPos[3];
        gl2D.vertexPosition[offset*3*4+5] = 0;
        gl2D.vertexPosition[offset*3*4+6] = dstPos[4];//or
        gl2D.vertexPosition[offset*3*4+7] = dstPos[5];
        gl2D.vertexPosition[offset*3*4+8] = 0;
        gl2D.vertexPosition[offset*3*4+9] = dstPos[6];//ol
        gl2D.vertexPosition[offset*3*4+10] = dstPos[7];
        gl2D.vertexPosition[offset*3*4+11] = 0;
        dstPos = null;

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
        color = null;

        gl2D.vertexIndex[offset*6+0] = offset*4+0;
        gl2D.vertexIndex[offset*6+1] = offset*4+1;
        gl2D.vertexIndex[offset*6+2] = offset*4+2;
        gl2D.vertexIndex[offset*6+3] = offset*4+0;
        gl2D.vertexIndex[offset*6+4] = offset*4+2;
        gl2D.vertexIndex[offset*6+5] = offset*4+3;

        if (texture != gl2D.lastTexture){
        gl2D.textureOffset++;
        // gl.deleteTexture(gl2D.lastTexture);
        // gl2D.lastTexture = null;
        gl2D.lastTexture = texture;
        gl2D.textureList[gl2D.textureOffset] = texture;
        gl2D.textureContinuous[gl2D.textureOffset] = 0;
        }
        gl2D.textureContinuous[gl2D.textureOffset] +=2;

        gl2D.curOffset+=1;
      },
      addImage: (texture,src,dst,inputColor) => {
        let gl = gl2D.gl;
        let offset = gl2D.curOffset;
        let translate = gl2D.translate;
        let color = [inputColor[0]/255,inputColor[1]/255,inputColor[2]/255,inputColor[3]/255];
        dst[2]+=dst[0];dst[3]+=dst[1];
        let dstPos = gl2D.useMatrix([dst[0],dst[3],dst[2],dst[3],dst[2],dst[1],dst[0],dst[1]]);

        let imageWidth = texture.width, imageHeight = texture.height;
        let
          startsrcX = src[0] / imageWidth,
          endsrcX = (src[0] + src[2]) / imageWidth,
          startsrcY = src[1] / imageHeight,
          endsrcY = (src[1] + src[3]) / imageHeight;

        gl2D.vertexPosition[offset*3*4+0] = dstPos[0];//ul
        gl2D.vertexPosition[offset*3*4+1] = dstPos[1];
        gl2D.vertexPosition[offset*3*4+2] = 0;
        gl2D.vertexPosition[offset*3*4+3] = dstPos[2];//ur
        gl2D.vertexPosition[offset*3*4+4] = dstPos[3];
        gl2D.vertexPosition[offset*3*4+5] = 0;
        gl2D.vertexPosition[offset*3*4+6] = dstPos[4];//or
        gl2D.vertexPosition[offset*3*4+7] = dstPos[5];
        gl2D.vertexPosition[offset*3*4+8] = 0;
        gl2D.vertexPosition[offset*3*4+9] = dstPos[6];//ol
        gl2D.vertexPosition[offset*3*4+10] = dstPos[7];
        gl2D.vertexPosition[offset*3*4+11] = 0;
        dstPos = null;

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
        color = null;

        gl2D.vertexIndex[offset*6+0] = offset*4+0;
        gl2D.vertexIndex[offset*6+1] = offset*4+1;
        gl2D.vertexIndex[offset*6+2] = offset*4+2;
        gl2D.vertexIndex[offset*6+3] = offset*4+0;
        gl2D.vertexIndex[offset*6+4] = offset*4+2;
        gl2D.vertexIndex[offset*6+5] = offset*4+3;

        if (texture != gl2D.lastTexture){
        gl2D.textureOffset++;
        // gl.deleteTexture(gl2D.lastTexture);
        // gl2D.lastTexture = null;
        gl2D.lastTexture = texture;
        gl2D.textureList[gl2D.textureOffset] = texture;
        gl2D.textureContinuous[gl2D.textureOffset] = 0;
        }
        gl2D.textureContinuous[gl2D.textureOffset] +=2;

        gl2D.curOffset+=1;
      },
      endScene: () => {
        let gl = gl2D.gl;

        gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gl2D.vertexPosition, gl.STATIC_DRAW);
        gl.vertexAttribPointer(gl2D.shaderProgram.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexColorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gl2D.vertexColor, gl.STATIC_DRAW);
        gl.vertexAttribPointer(gl2D.shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexTextureCoordBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, gl2D.vertexTextureCoord, gl.STATIC_DRAW);
        gl.vertexAttribPointer(gl2D.shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl2D.vertexIndexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gl2D.vertexIndex, gl.STATIC_DRAW);
      },
      renderScene: () => {
        let gl = gl2D.gl;

        let it = 0;
        let offset = 0;
        let amount = 0;
        while (it <= gl2D.textureOffset){
          amount = gl2D.textureContinuous[it]
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D, gl2D.textureList[it]);
          gl.drawElements(gl.TRIANGLES, 3*amount, gl.UNSIGNED_SHORT, offset*6*1);
          offset+=amount;
          it++;
        };
      },

      matrix: {
        setTranslate: (pos) => {
          gl2D.translate = pos;
        },
        addTranslate: (pos) => {
          gl2D.translate[0] += pos[0];
          gl2D.translate[1] += pos[1];
        },
        setRotate: (angle) => {
          gl2D.angle = angle;
          gl2D.sin = Math.sin(gl2D.angle * 3.14159265 / 180), gl2D.cos = Math.cos(gl2D.angle * 3.14159265 / 180);
        },
        addRotate: (angle) => {
          gl2D.angle += angle;
          gl2D.sin = Math.sin(gl2D.angle * 3.14159265 / 180), gl2D.cos = Math.cos(gl2D.angle * 3.14159265 / 180);
        },
        reset: () => {
          gl2D.translate = [0,0];
          gl2D.angle = 0;
          gl2D.sin = Math.sin(gl2D.angle * 3.14159265 / 180), gl2D.cos = Math.cos(gl2D.angle * 3.14159265 / 180);
        },
      },
  };

  gl2D.gl = canvas.getContext("webgl");
  let gl = gl2D.gl;
  gl2D.vertexPositionBuffer = gl.createBuffer();
  gl2D.vertexColorBuffer = gl.createBuffer ();
  gl2D.vertexTextureCoordBuffer = gl.createBuffer();
  gl2D.vertexIndexBuffer = gl.createBuffer();
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  let size = 20000

  gl2D.vertexPosition = new Float32Array(size*3*4);
  gl2D.vertexTextureCoord = new Float32Array(size*2*4);
  gl2D.vertexColor = new Float32Array(size*4*4);
  gl2D.vertexIndex = new Uint16Array(size*6);
  gl2D.textureList = [];
  gl2D.textureContinuous = [];

  gl2D.initShaders();
  return gl2D;
};
