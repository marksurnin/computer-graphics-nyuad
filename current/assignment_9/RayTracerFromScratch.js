"use strict";
var gl; // global variable
var ut;

window.onload = function init(){
  //Set  up WebGL
    var canvas = document.getElementById( "gl-canvas" );
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) {alert( "WebGL isn't available" );}
    
    // Set viewport and clear canvas
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.0, 0.0, 1.0, 1.0 );
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Set up buffers and attributes
  var s = 1.0;
  var vertices = [-s, -s, s, -s, s, s, -s, -s, s, s, -s, s];
  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);  

  ut = gl.getUniformLocation(program, "time");
  var diffuseMapSampler = gl.getUniformLocation(program, "diffuseMapSampler")
  //setupTextureMaps
  var diffuseMapTexture = setupTexture("billiard_ball_texture.jpg"); 
  gl.uniform1i(diffuseMapSampler, 0);
    // we use texture unit 0 for diffuse map
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, diffuseMapTexture);
  
  //Draw
  requestAnimationFrame(render);
}; 

function render(now) {
  requestAnimationFrame(render);
  
  gl.uniform1f(ut, now/1000);
  gl.drawArrays(gl.TRIANGLES,0,6);

}

function setupTexture(src){
  var texture = gl.createTexture();
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 0, 255])); // single red pixel image
      gl.bindTexture(gl.TEXTURE_2D, null);

  texture.image = new Image();
  texture.image.onload = handler; 
  texture.image.src = src;

  function handler(){
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
  }
}