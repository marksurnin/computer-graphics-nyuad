"use strict";
var gl; // global variable
var time; 

window.onload = function init() {
  // Set up WebGL
  var canvas = document.getElementById("gl-canvas");
  gl = WebGLUtils.setupWebGL( canvas );
  if(!gl){alert("WebGL setup failed!");}
  
  // set clear color 
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  //Enable depth test
  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearDepth(1.0);
      
  
  // Load shaders and initialize attribute buffers
  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );
  
  // Load data into a buffer
  var s = 0.4;

  var a = vec3(-s,-s, s);
  var b = vec3( s,-s, s);
  var c = vec3( s, s, s);
  var d = vec3(-s, s, s);

  var e = vec3(-s,-s,-s);
  var f = vec3( s,-s,-s);
  var g = vec3( s, s,-s);
  var h = vec3(-s, s,-s);

  var vertices = [];
  vertices = vertices.concat(
                  square(a,b,c,d), //front
                  square(e,f,g,h), //end

                  square(d,c,g,h), //top
                  square(a,b,f,e), //bottom

                  square(a,d,h,e), //left
                  square(b,c,g,f) //right                  
                  );

  var c1 = vec3(0.3, 0.5, 0.4);
  var c2 = vec3(1.0, 0.9, 0.6);
  var c3 = vec3(1.0, 0.7, 0.2);
  var c4 = vec3(0.7, 0.3, 0.1);
  var c5 = vec3(0.5, 0.1, 0.0);
  var c6 = vec3(0.4, 0.6, 0.8);

  var colors = [];

  colors = colors.concat(repeatArray(c1, 6),
                         repeatArray(c2, 6),
                         repeatArray(c3, 6),
                         repeatArray(c4, 6),
                         repeatArray(c5, 6),
                         repeatArray(c6, 6));
  
  var vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

  var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);      
        
  // Do shader plumbing
  var vPosition = gl.getAttribLocation(program, "vPosition");
  gl.enableVertexAttribArray(vPosition);

  var vColor = gl.getAttribLocation(program,"vColor");
  gl.enableVertexAttribArray(vColor);

  gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  
  gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);

  time = gl.getUniformLocation(program,"time");

  requestAnimationFrame(render);

};

function render(now) {
  requestAnimationFrame(render);
  gl.uniform1f(time,0.001*now);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES,0,36);
}

function square(a, b, c, d) {
  return [a, b, c, c, d, a];
}

function repeatArray(arr, n) {
  var result = [];
  for (var i = 0; i < n; i++) {
    result = result.concat(arr);
  }
  return result;
}