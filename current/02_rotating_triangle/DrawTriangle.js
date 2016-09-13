"use strict";
var gl; // global variable
var vertices;
var vBuffer, vColor, cBuffer;
var ut;
	
window.onload = function init() {
	// Set up WebGL
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas );
	if(!gl){alert("WebGL setup failed!");}
	
	// Clear canvas
	gl.clearColor(0.0, 0.0, 0.0, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Load shaders and initialize attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );
	
	// Load data into a buffer
	vertices = [];
	var r = 0.6;
	for(var t = 0; t < 2*Math.PI; t+=2*Math.PI/3) {
		vertices.push(r*Math.cos(t), r*Math.sin(t));
	}

	vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	
	var colors = [1,0,0, 0,1,0, 0,0,1];

	cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	// Do shader plumbing
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	var vColor = gl.getAttribLocation(program, "vColor");
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);	

	ut = gl.getUniformLocation(program, "t");

	requestAnimationFrame(render);
};

function render(now) {
	requestAnimationFrame(render);

	// Current time in seconds
	var t = now*0.0005;

	// ut - uniform variable
	gl.uniform1f(ut, t);

	gl.clear(gl.COLOR_BUFFER_BIT);
	//Draw a triangle
	gl.drawArrays(gl.TRIANGLES,0,3); // note that the last argument is 3, not 1
}