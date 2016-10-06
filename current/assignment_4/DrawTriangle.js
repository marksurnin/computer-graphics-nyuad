"use strict";
var gl; // global variable

window.onload = function init() {
	// Set up WebGL
	var canvas = document.getElementById("gl-canvas");
	gl = WebGLUtils.setupWebGL( canvas );
	if(!gl){alert("WebGL setup failed!");}
	
	// Clear canvas
	gl.clearColor(0.0, 0.0, 0.0, 0.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	// Load shaders and initialize attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	var vertices = [
		-1.0, -1.0,
		 1.0, -1.0,
		-1.0,  1.0,
		 1.0, -1.0,
		-1.0,  1.0,
		 1.0,  1.0];

	/*
	 * Draw the third triangle in another buffer
	 */
	var vBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
	
	// Do shader plumbing
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	//Draw a triangle
	gl.drawArrays(gl.TRIANGLES, 0, 6);
	
};
