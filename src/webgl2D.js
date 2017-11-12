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
    IndexOffset: 0,
    bufferOffset: 0,
    bufferCreatet: false,
    lastTexture: null,
    textureContinuous:[],
    textureOffset: 0,
    useMatrixResult: new Float32Array(2000),
    curOffset:0,
    textureCounter: 0,
    translateX:0,
    translateY:0,
    scaleX:0,
    scaleY:0,
    angle:0,

    sin:0,
    cos:1,

    drawImageDst: new Int32Array(4),

    pow : (input) => {
      let i = 1;
      while (true){
        if (input<=2<<i) return 2<<i;i++;
      }
    },
    useMatrix: (dst) => {
      let gl = gl2D.gl;
      let translateX = gl2D.translateX;
      let translateY = gl2D.translateY;
      let scaleX = gl2D.scaleX;
      let scaleY = gl2D.scaleY;
      let sin = gl2D.sin, cos = gl2D.cos;
      let sceneWidth = gl.viewportWidth*0.5, sceneHeight = gl.viewportHeight*0.5;
      let max = dst.length;

      if(gl2D.angle === 0){
          for (let i = 0;i < max;i+=2){
          gl2D.useMatrixResult[i+0] = (-1+(dst[i]+translateX)*scaleX/sceneWidth);
          gl2D.useMatrixResult[i+1] = (+1-(dst[i+1]+translateY)*scaleY/sceneHeight);
        }
      }
      else{
        for (let i = 0;i < max;i+=2){
          gl2D.useMatrixResult[i+0] = (-1+((dst[i]*scaleX * cos - dst[i+1]*scaleY * sin)+translateX)/sceneWidth);
          gl2D.useMatrixResult[i+1] = (+1-((dst[i+1]*scaleY * cos + dst[i]*scaleX * sin)+translateY)/sceneHeight);
        }
      }
      return gl2D.useMatrixResult;
    },

    //--public--
    compileShader: (vertexShaderCode ,fragmentShaderCode)=>{
      let gl = gl2D.gl;
      let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      let vertexShader = gl.createShader(gl.VERTEX_SHADER);

      gl.shaderSource(vertexShader, vertexShaderCode);

      gl.compileShader(vertexShader);

      gl.shaderSource(fragmentShader, fragmentShaderCode);

      gl.compileShader(fragmentShader);

      let shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);

      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
          alert("Could not initialise shaders");
      }

      shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
      gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

      shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
      gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

      shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
      gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

      shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");

      return shaderProgram;
    },
    useShader:(shaderProgram) => {
      gl.useProgram(shaderProgram);
      gl2D.shaderProgram = shaderProgram;
    },
    

    textureFromImage: (image) => {
      let gl = gl2D.gl;
      let texture
      texture = gl.createTexture();

      let canvas = document.createElement("canvas");
      let context  = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;//Chrome
      context.mozImageSmoothingEnabled = false;//Firefox
      canvas.width = gl2D.pow(image.width);
      canvas.height = gl2D.pow(image.height);
      context.drawImage(image, 0, 0, image.width, image.height);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);
      texture.width = canvas.width;
      texture.height = canvas.height;
      texture.imgwidth = image.width;
      texture.imgheight = image.height;
      texture.index = gl2D.textureCounter;
      gl2D.textureCounter++

      return texture;
    },
    textureFromFile: (path) => {
      let gl = gl2D.gl;
      let texture
      texture = gl.createTexture();
      texture.image = new Image();
      texture.image.onload = function () {
        let canvas = document.createElement("canvas");
        let context  = canvas.getContext("2d");
        context.imageSmoothingEnabled = false;//Chrome
        context.mozImageSmoothingEnabled = false;//Firefox
        canvas.width = gl2D.pow(texture.image.width);
        canvas.height = gl2D.pow(texture.image.height);
        context.drawImage(texture.image, 0, 0, texture.image.width, texture.image.height);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
        texture.width = canvas.width;
        texture.height = canvas.height;
        texture.imgwidth = texture.image.width;
        texture.imgheight = texture.image.height;
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
      texture.imgwidth = width;
      texture.imgheight = height;
      texture.index = gl2D.textureCounter;
      gl2D.textureCounter++
      return texture;
    },
    textureFromString: (string,font,size) => {
      let gl = gl2D.gl;
      let texture
      texture = gl.createTexture();

      let canvas = document.createElement("canvas");
      let context  = canvas.getContext("2d");
      context.imageSmoothingEnabled = false;//Chrome
      context.mozImageSmoothingEnabled = false;//Firefox
      canvas.width = gl2D.pow(512);
      canvas.height = gl2D.pow(512);
      context.drawImage(image, 0, 0, image.width, image.height);

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.bindTexture(gl.TEXTURE_2D, null);
      texture.width = canvas.width;
      texture.height = canvas.height;
      texture.imgwidth = image.width;
      texture.imgheight = image.height;
      texture.index = gl2D.textureCounter;
      gl2D.textureCounter++

      return texture;
    },
    startScene: () => {
      gl2D.gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
      gl2D.gl.clear(gl.COLOR_BUFFER_BIT);
      // gl2D.vertexPosition = [];
      // gl2D.vertexTextureCoord = [];
      // gl2D.vertexColor = [];
      // gl2D.vertexIndex = [];
      // gl2D.textureList = [];
      // gl2D.textureContinuous = [];

      gl2D.IndexOffset = 0;
      gl2D.bufferOffset = 0;
      gl2D.lastTexture = null;
      gl2D.textureOffset = -1;
    },
  
    drawTriangle : (texture,src,dst,color) => {
      let gl = gl2D.gl;
      let IndexOffset = gl2D.IndexOffset;
      let bufferOffset = gl2D.bufferOffset;
      let dstPos = gl2D.useMatrix(dst);

      let imageWidth = texture.width, imageHeight = texture.height;

      let offset = gl2D.curOffset;

      offset = bufferOffset*2;
      gl2D.vertexPosition[offset+0] = dstPos[0];
      gl2D.vertexPosition[offset+1] = dstPos[1];
      gl2D.vertexPosition[offset+2] = dstPos[2];
      gl2D.vertexPosition[offset+3] = dstPos[3];
      gl2D.vertexPosition[offset+4] = dstPos[4];
      gl2D.vertexPosition[offset+5] = dstPos[5];
      dstPos = null;

      offset = bufferOffset*2;
      gl2D.vertexTextureCoord[offset+0] = src[0]/ imageWidth;
      gl2D.vertexTextureCoord[offset+1] = src[1]/ imageHeight;
      gl2D.vertexTextureCoord[offset+2] = src[2]/ imageWidth;
      gl2D.vertexTextureCoord[offset+3] = src[3]/ imageHeight;
      gl2D.vertexTextureCoord[offset+4] = src[4]/ imageWidth;
      gl2D.vertexTextureCoord[offset+5] = src[5]/ imageHeight;

      offset = bufferOffset*4;
      gl2D.vertexColor[offset+0] = color[0];//r
      gl2D.vertexColor[offset+1] = color[1];//g
      gl2D.vertexColor[offset+2] = color[2];//b
      gl2D.vertexColor[offset+3] = color[3];//a
      gl2D.vertexColor[offset+4] = color[4];//r
      gl2D.vertexColor[offset+5] = color[5];//g
      gl2D.vertexColor[offset+6] = color[6];//b
      gl2D.vertexColor[offset+7] = color[7];//a
      gl2D.vertexColor[offset+8] = color[8];//r
      gl2D.vertexColor[offset+9] = color[9];//g
      gl2D.vertexColor[offset+10] = color[10];//b
      gl2D.vertexColor[offset+11] = color[11];//a

      gl2D.vertexIndex[IndexOffset*3+0] = bufferOffset+0;
      gl2D.vertexIndex[IndexOffset*3+1] = bufferOffset+1;
      gl2D.vertexIndex[IndexOffset*3+2] = bufferOffset+2;

      if (texture != gl2D.lastTexture){
        gl2D.textureOffset++;
        gl2D.lastTexture = texture;
        gl2D.textureList[gl2D.textureOffset] = texture;
        gl2D.textureContinuous[gl2D.textureOffset] = 0;
      }
      gl2D.textureContinuous[gl2D.textureOffset] +=1;

      gl2D.IndexOffset+=1;
      gl2D.bufferOffset+=3;

    },
    drawTriangleFan: (texture,src,dst,color) => {
      let gl = gl2D.gl;
      let IndexOffset = gl2D.IndexOffset;
      let bufferOffset = gl2D.bufferOffset;
      let size = dst.length/2;
      let dstPos = gl2D.useMatrix(dst);

      let imageWidth = texture.width, imageHeight = texture.height;

      let vertexOffset = bufferOffset*2;
      let textureOffset = bufferOffset*2;
      let colorOffset = bufferOffset*4;
      for (let i = 0;i < size; i++){
        gl2D.vertexPosition[vertexOffset+0+2*i] = dstPos[0+2*i];//ul
        gl2D.vertexPosition[vertexOffset+1+2*i] = dstPos[1+2*i];

        gl2D.vertexTextureCoord[textureOffset+0+2*i] = src[0+2*i]/ imageWidth;
        gl2D.vertexTextureCoord[textureOffset+1+2*i] = src[1+2*i]/ imageHeight;


        gl2D.vertexColor[colorOffset+0+4*i] = color[0+4*i];//r
        gl2D.vertexColor[colorOffset+1+4*i] = color[1+4*i];//g
        gl2D.vertexColor[colorOffset+2+4*i] = color[2+4*i];//b
        gl2D.vertexColor[colorOffset+3+4*i] = color[3+4*i];//a
      }
      for (let i = 0;i < size-2; i++){
        gl2D.vertexIndex[IndexOffset*3+0+3*i] = bufferOffset+0;
        gl2D.vertexIndex[IndexOffset*3+1+3*i] = bufferOffset+1+i;
        gl2D.vertexIndex[IndexOffset*3+2+3*i] = bufferOffset+2+i;
      }
    
      if (texture != gl2D.lastTexture){
        gl2D.textureOffset++;
        gl2D.lastTexture = texture;
        gl2D.textureList[gl2D.textureOffset] = texture;
        gl2D.textureContinuous[gl2D.textureOffset] = 0;
      }
      gl2D.textureContinuous[gl2D.textureOffset] +=size-2;

      gl2D.IndexOffset+=size-2;
      gl2D.bufferOffset+=size;
    },
    drawSquare : (texture,src,dst,color) => {
      let gl = gl2D.gl;
      let IndexOffset = gl2D.IndexOffset;
      let bufferOffset = gl2D.bufferOffset;
      let dstPos = gl2D.useMatrix(dst);

      let imageWidth = texture.width, imageHeight = texture.height;

      let offset = gl2D.curOffset;

      offset = bufferOffset*2;
      gl2D.vertexPosition[offset+0] = dstPos[0];
      gl2D.vertexPosition[offset+1] = dstPos[1];
      gl2D.vertexPosition[offset+2] = dstPos[2];
      gl2D.vertexPosition[offset+3] = dstPos[3];
      gl2D.vertexPosition[offset+4] = dstPos[4];
      gl2D.vertexPosition[offset+5] = dstPos[5];
      gl2D.vertexPosition[offset+6] = dstPos[6];
      gl2D.vertexPosition[offset+7] = dstPos[7];
      gl2D.vertexPosition[offset+8] = (dstPos[0]+dstPos[2]+dstPos[4]+dstPos[6])*0.25;
      gl2D.vertexPosition[offset+9] = (dstPos[1]+dstPos[3]+dstPos[5]+dstPos[7])*0.25;
      dstPos = null;

      offset = bufferOffset*2;
      gl2D.vertexTextureCoord[offset+0] = src[0]/ imageWidth;
      gl2D.vertexTextureCoord[offset+1] = src[1]/ imageHeight;
      gl2D.vertexTextureCoord[offset+2] = src[2]/ imageWidth;
      gl2D.vertexTextureCoord[offset+3] = src[3]/ imageHeight;
      gl2D.vertexTextureCoord[offset+4] = src[4]/ imageWidth;
      gl2D.vertexTextureCoord[offset+5] = src[5]/ imageHeight;
      gl2D.vertexTextureCoord[offset+6] = src[6]/ imageWidth;
      gl2D.vertexTextureCoord[offset+7] = src[7]/ imageHeight;
      gl2D.vertexTextureCoord[offset+8] = (gl2D.vertexTextureCoord[offset+0]+gl2D.vertexTextureCoord[offset+2]+gl2D.vertexTextureCoord[offset+4]+gl2D.vertexTextureCoord[offset+6])*0.25;
      gl2D.vertexTextureCoord[offset+9] = (gl2D.vertexTextureCoord[offset+1]+gl2D.vertexTextureCoord[offset+3]+gl2D.vertexTextureCoord[offset+5]+gl2D.vertexTextureCoord[offset+7])*0.25;

      offset = bufferOffset*4;
      gl2D.vertexColor[offset+0] = color[0];//r
      gl2D.vertexColor[offset+1] = color[1];//g
      gl2D.vertexColor[offset+2] = color[2];//b
      gl2D.vertexColor[offset+3] = color[3];//a
      gl2D.vertexColor[offset+4] = color[4];//r
      gl2D.vertexColor[offset+5] = color[5];//g
      gl2D.vertexColor[offset+6] = color[6];//b
      gl2D.vertexColor[offset+7] = color[7];//a
      gl2D.vertexColor[offset+8] = color[8];//r
      gl2D.vertexColor[offset+9] = color[9];//g
      gl2D.vertexColor[offset+10] = color[10];//b
      gl2D.vertexColor[offset+11] = color[11];//a
      gl2D.vertexColor[offset+12] = color[12];//r
      gl2D.vertexColor[offset+13] = color[13];//g
      gl2D.vertexColor[offset+14] = color[14];//b
      gl2D.vertexColor[offset+15] = color[15];//a
      gl2D.vertexColor[offset+16] = (color[0]+color[4]+color[8]+color[12])*0.25;//r
      gl2D.vertexColor[offset+17] = (color[1]+color[5]+color[9]+color[13])*0.25;;//g
      gl2D.vertexColor[offset+18] = (color[2]+color[6]+color[10]+color[14])*0.25;;//b
      gl2D.vertexColor[offset+19] = (color[3]+color[7]+color[11]+color[15])*0.25;;//a

      offset = IndexOffset*3;
      gl2D.vertexIndex[offset+0] = bufferOffset+0;
      gl2D.vertexIndex[offset+1] = bufferOffset+1;
      gl2D.vertexIndex[offset+2] = bufferOffset+4;

      gl2D.vertexIndex[offset+3] = bufferOffset+1;
      gl2D.vertexIndex[offset+4] = bufferOffset+2;
      gl2D.vertexIndex[offset+5] = bufferOffset+4;

      gl2D.vertexIndex[offset+6] = bufferOffset+2;
      gl2D.vertexIndex[offset+7] = bufferOffset+3;
      gl2D.vertexIndex[offset+8] = bufferOffset+4;

      gl2D.vertexIndex[offset+9] = bufferOffset+3;
      gl2D.vertexIndex[offset+10] = bufferOffset+0;
      gl2D.vertexIndex[offset+11] = bufferOffset+4;

      if (texture != gl2D.lastTexture){
        gl2D.textureOffset++;
        gl2D.lastTexture = texture;
        gl2D.textureList[gl2D.textureOffset] = texture;
        gl2D.textureContinuous[gl2D.textureOffset] = 0;
      }
      gl2D.textureContinuous[gl2D.textureOffset] +=4;

      gl2D.IndexOffset+=4;
      gl2D.bufferOffset+=5;


    },
    drawImage: (texture,src,dst,color) => {
      // let dst = gl2D.drawImageDst;
      // dst[0] = inputDst[0];
      // dst[1] = inputDst[1];
      // dst[2] = inputDst[2];
      // dst[3] = inputDst[3];

      let gl = gl2D.gl;
      let IndexOffset = gl2D.IndexOffset;
      let bufferOffset = gl2D.bufferOffset;

      let 
        startdstX = dst[0],
        enddstX = dst[2] + dst[0],
        startdstY = dst[1],
        enddstY = dst[3] + dst[1];

      let dstPos = gl2D.useMatrix([startdstX,enddstY,enddstX,enddstY,enddstX,startdstY,startdstX,startdstY]);

      let imageWidth = texture.width, imageHeight = texture.height;
      let
        startsrcX = src[0] / imageWidth,
        endsrcX = (src[0] + src[2]) / imageWidth,
        startsrcY = src[1] / imageHeight,
        endsrcY = (src[1] + src[3]) / imageHeight;

      let offset = gl2D.curOffset;

      offset = bufferOffset*2;
      gl2D.vertexPosition[offset+0] = dstPos[0];//ul
      gl2D.vertexPosition[offset+1] = dstPos[1];
      gl2D.vertexPosition[offset+2] = dstPos[2];//ur
      gl2D.vertexPosition[offset+3] = dstPos[3];
      gl2D.vertexPosition[offset+4] = dstPos[4];//or
      gl2D.vertexPosition[offset+5] = dstPos[5];
      gl2D.vertexPosition[offset+6] = dstPos[6];//ol
      gl2D.vertexPosition[offset+7] = dstPos[7];
      dstPos = null;

      offset = bufferOffset*2;
      gl2D.vertexTextureCoord[offset+0] = startsrcX;
      gl2D.vertexTextureCoord[offset+1] = endsrcY;
      gl2D.vertexTextureCoord[offset+2] = endsrcX;
      gl2D.vertexTextureCoord[offset+3] = endsrcY;
      gl2D.vertexTextureCoord[offset+4] = endsrcX;
      gl2D.vertexTextureCoord[offset+5] = startsrcY;
      gl2D.vertexTextureCoord[offset+6] = startsrcX;
      gl2D.vertexTextureCoord[offset+7] = startsrcY;

      offset = bufferOffset*4;
      gl2D.vertexColor[offset+0] = gl2D.vertexColor[offset+4] = gl2D.vertexColor[offset+8] = gl2D.vertexColor[offset+12] = color[0];//r
      gl2D.vertexColor[offset+1] = gl2D.vertexColor[offset+5] = gl2D.vertexColor[offset+9] = gl2D.vertexColor[offset+13] = color[1];//g
      gl2D.vertexColor[offset+2] = gl2D.vertexColor[offset+6] = gl2D.vertexColor[offset+10] = gl2D.vertexColor[offset+14] = color[2];//b
      gl2D.vertexColor[offset+3] = gl2D.vertexColor[offset+7] = gl2D.vertexColor[offset+11] = gl2D.vertexColor[offset+15] = color[3];//a

      color = null;

      offset = IndexOffset*3;
      gl2D.vertexIndex[offset+0] = bufferOffset+0;
      gl2D.vertexIndex[offset+1] = bufferOffset+1;
      gl2D.vertexIndex[offset+2] = bufferOffset+2;
      gl2D.vertexIndex[offset+3] = bufferOffset+0;
      gl2D.vertexIndex[offset+4] = bufferOffset+2;
      gl2D.vertexIndex[offset+5] = bufferOffset+3;

      if (texture != gl2D.lastTexture){
      gl2D.textureOffset++;
      gl2D.lastTexture = texture;
      gl2D.textureList[gl2D.textureOffset] = texture;
      gl2D.textureContinuous[gl2D.textureOffset] = 0;
      }
      gl2D.textureContinuous[gl2D.textureOffset] +=2;

      gl2D.IndexOffset+=2;
      gl2D.bufferOffset+=4;
    },
    
    endScene: () => {
      let gl = gl2D.gl;

      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexPositionBuffer);
      if (gl2D.bufferCreatet === false) gl.bufferData(gl.ARRAY_BUFFER, gl2D.vertexPosition, gl.DYNAMIC_DRAW);
      else gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl2D.vertexPosition, 0, gl2D.bufferOffset*2);
      gl.vertexAttribPointer(gl2D.shaderProgram.vertexPositionAttribute, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexColorBuffer);
      if (gl2D.bufferCreatet === false) gl.bufferData(gl.ARRAY_BUFFER, gl2D.vertexColor, gl.DYNAMIC_DRAW);
      else gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl2D.vertexColor, 0, gl2D.bufferOffset*4);
      gl.vertexAttribPointer(gl2D.shaderProgram.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, gl2D.vertexTextureCoordBuffer);
      if (gl2D.bufferCreatet === false) gl.bufferData(gl.ARRAY_BUFFER, gl2D.vertexTextureCoord, gl.DYNAMIC_DRAW);
      else gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl2D.vertexTextureCoord, 0, gl2D.bufferOffset*2);
      gl.vertexAttribPointer(gl2D.shaderProgram.textureCoordAttribute, 2, gl.FLOAT, false, 0, 0);
      
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl2D.vertexIndexBuffer);
      if (gl2D.bufferCreatet === false) gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, gl2D.vertexIndex, gl.DYNAMIC_DRAW);
      else gl.bufferSubData(gl.ARRAY_BUFFER, 0, gl2D.vertexIndex, 0, gl2D.IndexOffset);

      gl2D.bufferCreatet = true;
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
      setTranslate: (x,y) => {
        gl2D.translate = [x,y];
      },
      addTranslate: (x,y) => {
        gl2D.translateX += x;
        gl2D.translateY += y;
      },
      setScale: (x,y) => {
        gl2D.scaleX = x;
        gl2D.scaleY = y;
      },
      addScale: (x,y) => {
        gl2D.scaleX += x;
        gl2D.scaleY += y;
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
        gl2D.translateX = 0;
        gl2D.translateY = 0
        gl2D.scaleX = 1;
        gl2D.scaleY = 1;
        gl2D.angle = 0;
        gl2D.sin = 0, gl2D.cos = 1;
      },
      save: () => {
        return [gl2D.translateX,gl2D.translateY,gl2D.scaleX,gl2D.scaleY,gl2D.angle];
      },
      load: (input) => {
        gl2D.translateX = input[0];
        gl2D.translateY = input[1];
        gl2D.scaleX = input[2];
        gl2D.scaleY = input[3];
        gl2D.angle = input[4];
        gl2D.sin = Math.sin(gl2D.angle * 3.14159265 / 180), gl2D.cos = Math.cos(gl2D.angle * 3.14159265 / 180);
      },
    },
  };

  gl2D.gl = canvas.getContext("webgl2", {antialias: false, depth: false});
  if (gl2D.gl === void 0 || gl2D.gl === null) gl2D.gl = canvas.getContext("webgl", {antialias: false, depth: false});
  let gl = gl2D.gl;
  console.log(gl)
  gl2D.vertexPositionBuffer = gl.createBuffer();
  gl2D.vertexColorBuffer = gl.createBuffer ();
  gl2D.vertexTextureCoordBuffer = gl.createBuffer();
  gl2D.vertexIndexBuffer = gl.createBuffer();
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;

  let size = 50000

  gl2D.vertexPosition = new Float32Array(size*2*2);
  gl2D.vertexTextureCoord = new Float32Array(size*2*2);
  gl2D.vertexColor = new Float32Array(size*4*2);
  gl2D.vertexIndex = new Uint16Array(size*3);
  gl2D.textureList = [];
  gl2D.textureContinuous = [];

  gl2D.useShader(
    gl2D.compileShader(
      `
      attribute vec2 aVertexPosition;
      attribute vec2 aTextureCoord;
      attribute vec4 aVertexColor;

      varying vec2 vTextureCoord;
      varying vec4 vColor;

      void main(void) {
          gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, 0.0, 1.0);
          vTextureCoord = aTextureCoord;
          vColor = aVertexColor / vec4(255,255,255,255);
      }
      `
    ,
      `
      precision mediump float;

      varying vec2 vTextureCoord;
      varying vec4 vColor;

      uniform sampler2D uSampler;

      void main(void) {
        gl_FragColor = vec4(texture2D(uSampler, vTextureCoord) * vColor);
      }
      `
    )
  );

  gl.disable(gl.DEPTH_TEST);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.BLEND);
  
  gl2D.emptyTexture = gl2D.textureFromPixelArray(new Uint8Array([255,255,255]),1,1);
  
  //closure exports
  gl2D['emptyTexture'] = gl2D.emptyTexture;

  gl2D['textureFromImage'] = gl2D.textureFromImage;
  gl2D['textureFromFile'] = gl2D.textureFromFile;
  gl2D['textureFromPixelArray'] = gl2D.textureFromPixelArray;

  gl2D['startScene'] = gl2D.startScene;
  gl2D['endScene'] = gl2D.endScene;
  gl2D['renderScene'] = gl2D.renderScene;

  gl2D['drawTriangle'] = gl2D.drawTriangle;
  gl2D['drawTriangleFan'] = gl2D.drawTriangleFan;
  gl2D['drawSquare'] = gl2D.drawSquare;
  gl2D['drawImage'] = gl2D.drawImage;

  gl2D['compileShader'] = gl2D.compileShader;
  gl2D['useShader'] = gl2D.useShader;

  gl2D['matrix'] = gl2D.matrix;
  gl2D.matrix['setTranslate'] = gl2D.matrix.setTranslate;
  gl2D.matrix['addTranslate'] = gl2D.matrix.addTranslate;
  gl2D.matrix['setScale'] = gl2D.matrix.setScale;
  gl2D.matrix['addScale'] = gl2D.matrix.addScale;
  gl2D.matrix['setRotate'] = gl2D.matrix.setRotate;
  gl2D.matrix['addRotate'] = gl2D.matrix.addRotate;
  gl2D.matrix['reset'] = gl2D.matrix.reset;
  gl2D.matrix['save'] = gl2D.matrix.save;
  gl2D.matrix['load'] = gl2D.matrix.load;

  return gl2D;
};

//closure export
window['webGL2DStart'] = webGL2DStart;
