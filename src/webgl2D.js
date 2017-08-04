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
      lastTexture: 0,

      translate:[0,0],
      angle:0,

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
        }
        texture.image.src = path;
        return texture;
      },
      textureFromPixelArray: (dataArray, type, width, height) => {
        let gl = gl2D.gl;
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

      addImage: (texture,src,dst,inputColor) => {
        let gl = gl2D.gl;
        let mtrx = gl2D.matrix;
        let offset = gl2D.curOffset;
        let translate = gl2D.translate;
        let sceneWidth = gl.viewportWidth, sceneHeight = gl.viewportHeight;
        let imageWidth = texture.width, imageHeight = texture.height;
        let color = [inputColor[0]/255,inputColor[1]/255,inputColor[2]/255,inputColor[3]/255];
        dst[2]+=dst[0];dst[3]+=dst[1];
        let midx = 0,midy = 0;
        let sin = Math.sin(gl2D.angle * 3.14159265 / 180), cos = Math.cos(gl2D.angle * 3.14159265 / 180);
        let 
          pos1X = (dst[0] * cos - dst[3] * sin)+translate[0],
          pos1Y = (dst[3] * cos + dst[0] * sin)+translate[1],

          pos2X = (dst[2] * cos - dst[3] * sin)+translate[0],
          pos2Y = (dst[3] * cos + dst[2] * sin)+translate[1],

          pos3X = (dst[2] * cos - dst[1] * sin)+translate[0],
          pos3Y = (dst[1] * cos + dst[2] * sin)+translate[1],

          pos4X = (dst[0] * cos - dst[1] * sin)+translate[0],
          pos4Y = (dst[1] * cos + dst[0] * sin)+translate[1];

          pos1X = -1+pos1X/sceneWidth*2,
          pos1Y = +1-pos1Y/sceneHeight*2,
          pos2X = -1+pos2X/sceneWidth*2,
          pos2Y = +1-pos2Y/sceneHeight*2,
          pos3X = -1+pos3X/sceneWidth*2,
          pos3Y = +1-pos3Y/sceneHeight*2,
          pos4X = -1+pos4X/sceneWidth*2,
          pos4Y = +1-pos4Y/sceneHeight*2;
        let
          startsrcX = src[0] / imageWidth,
          endsrcX = (src[0] + src[2]) / imageWidth,
          startsrcY = 1- (src[1] + src[3]) / imageHeight,
          endsrcY = 1- src[1] / imageHeight;

        gl2D.vertexPosition[offset*3*4+0] = pos1X;//ul
        gl2D.vertexPosition[offset*3*4+1] = pos1Y;
        gl2D.vertexPosition[offset*3*4+2] = 0;
        gl2D.vertexPosition[offset*3*4+3] = pos2X;//ur
        gl2D.vertexPosition[offset*3*4+4] = pos2Y;
        gl2D.vertexPosition[offset*3*4+5] = 0;
        gl2D.vertexPosition[offset*3*4+6] = pos3X;//or
        gl2D.vertexPosition[offset*3*4+7] = pos3Y;
        gl2D.vertexPosition[offset*3*4+8] = 0;
        gl2D.vertexPosition[offset*3*4+9] = pos4X;//ol
        gl2D.vertexPosition[offset*3*4+10] = pos4Y;
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
        },
        addRotate: (angle) => {
          gl2D.angle += angle;
        },
        reset: () => {
          gl2D.translate = [0,0];
          gl2D.angle = 0;
        },
      },
  };

  gl2D.gl = canvas.getContext("webgl");
  gl2D.gl.viewportWidth = canvas.width;
  gl2D.gl.viewportHeight = canvas.height;
  gl2D.initShaders();
  return gl2D;
};
