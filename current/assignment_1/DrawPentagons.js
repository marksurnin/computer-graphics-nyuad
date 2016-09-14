"use strict";

var gl;
var ut, idLoc, id;
var vertices1, vertices2;
var vBuffer1, vBuffer2;
var vPosition;

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
  
  // Generate points for two pentagons;
  vertices1 = [];
  vertices2 = [];

  var r1 = 0.2;
  var r2 = 0.3;
  for(var t = 0; t < 2*Math.PI; t+=2*Math.PI/5) {
    vertices1.push(r1*Math.cos(t), r1*Math.sin(t));
    vertices2.push(r2*Math.cos(t)+0.6, r2*Math.sin(t));
  }

  // Create buffers.
  vBuffer1 = gl.createBuffer();
  vBuffer2 = gl.createBuffer();

  // Do shader plumbing.
  vPosition = gl.getAttribLocation(program, "vPosition");
  gl.enableVertexAttribArray(vPosition);
  
  // Query the corresponding uniform variables in the shaders.
  ut = gl.getUniformLocation(program, "t");
  idLoc = gl.getUniformLocation(program, "id");

  requestAnimationFrame(render);
};

function render(now) {
  requestAnimationFrame(render);

  // Current time in seconds.
  var t = now*0.001;

  // uniform1f – floating point variable.
  gl.uniform1f(ut, t);

  gl.clear(gl.COLOR_BUFFER_BIT);

  // Centered pentagon
  id = 0;
  gl.uniform1f(idLoc, id);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer1);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices1), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices1.length/2);

  // Revolving pentagon
  id = 1;
  gl.uniform1f(idLoc, id);

  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices2.length/2);
}