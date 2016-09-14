"use strict";

var gl; // global variable
var ut;
var vertices1, vertices2;
var vBuffer, vColor, cBuffer;
var vPosition1, vPosition2;

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

  var r = 0.3;
  for(var t = 0; t < 2*Math.PI; t+=2*Math.PI/5) {
    vertices1.push(r*Math.cos(t), r*Math.sin(t));
    vertices2.push(r*Math.cos(t)+0.6, r*Math.sin(t));
  }

  // Define two colors.
  var colors = [1.0, 0.5, 0.45,
                0.4, 0.6, 1.0 ];


  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices1), gl.STATIC_DRAW);
  
  // Do shader plumbing
  vPosition1 = gl.getAttribLocation(program, "vPosition1");
  gl.enableVertexAttribArray(vPosition1);

  // Do shader plumbing
  vPosition2 = gl.getAttribLocation(program, "vPosition2");
  gl.enableVertexAttribArray(vPosition2);


  //Draw a triangle
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices1.length/2);


  var vBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
  
  
  ut = gl.getUniformLocation(program, "t");
  requestAnimationFrame(render);
};

function render(now) {
  requestAnimationFrame(render);

  // Current time in seconds.
  var t = now*0.0005;

  // ut – uniform variable
  gl.uniform1f(ut, t);

  gl.clear(gl.COLOR_BUFFER_BIT);


  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices1), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vPosition1, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices1.length/2);

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices2), gl.STATIC_DRAW);
  gl.vertexAttribPointer(vPosition1, 2, gl.FLOAT, false, 0, 0);
  gl.drawArrays(gl.TRIANGLE_FAN, 0, vertices2.length/2);
}