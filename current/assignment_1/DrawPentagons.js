
"use strict";
var gl; // global variable

window.onload = function init() {
  // Set up WebGL
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL( canvas );
  if(!gl){alert("WebGL setup failed!");}
  
  // Clear canvas
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Load shaders and initialize attribute buffers
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );
  
  var vertices1 = [];
  var vertices2 = [];
  var r = 0.3;
  for(var t = 0; t < 2*Math.PI; t+=2*Math.PI/5) {
    vertices1.push(r*Math.cos(t), r*Math.sin(t));
    vertices2.push(r*Math.cos(t)+0.6, r*Math.sin(t));
  }

  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices1), gl.STATIC_DRAW);
  
  // Do shader plumbing
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  //Draw a triangle
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices1.length/2);

  /*
   * Draw the third triangle in another buffer
   */
  var vBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
  
  // Do shader plumbing
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

  //Draw a triangle
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices2.length/2);
};