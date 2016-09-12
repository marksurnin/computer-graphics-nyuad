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
	
	// Load data into a buffer
	var vertices1 = [ Math.cos(2*Math.PI/3), Math.sin(2*Math.PI/3), Math.cos(0), Math.sin(0), Math.cos(2*Math.PI/3), -Math.sin(2*Math.PI/3)];
	
	// Same thing with a for loop
	var vertices2 = [];
	var r = 0.5
	for (var theta = 0; theta < 2*Math.PI; theta += 2*Math.PI/3) {
		vertices2.push(r * Math.cos(theta), r * Math.sin(theta));
	}

	// Two triangles that form a square
	var s = 0.2;
	var vertices3 = [-s, -s, // bottom left
										s,  s, // top right
										s, -s, // bottom right

									 -s, -s, // bottom left
										s,  s, // top right
									 -s,  s];// top left

	var vertices4 = [-s, s, s, s, 0.0, 2*s]


	/*
	 * Draw 2 triangles that form a square in one buffer
	 */
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices3), gl.STATIC_DRAW);
	
	// Do shader plumbing
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);

	//Draw a triangle
	gl.drawArrays(gl.TRIANGLES, 0, 6); // the last argument is the number of vertices to draw


	/*
	 * Draw the third triangle in another buffer
	 */
	var vBuffer2 = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices4), gl.STATIC_DRAW);
	
	// Do shader plumbing
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

	//Draw a triangle
	gl.drawArrays(gl.TRIANGLES, 0, 3);
	
};
