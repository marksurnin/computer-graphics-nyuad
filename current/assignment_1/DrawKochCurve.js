"use strict";
var gl; // global variable
var vertices = [];

function kochCurve(a, b, levels) {
	var points = [];
	var result = [];

	if (!levels || levels < 1) {
		console.error("Variable levels has to be greater than 0.");
		return [];
	}

	// Base case of the recursive function.
	if (levels === 1) {		
		// Adapted from http://stackoverflow.com/questions/15367165/finding-coordinates-of-koch-curve/15368026#15368026

		// Set up 2 orthogonal direction vectors.
		var u = subtract(b, a);
		var v = vec2(a[1]-b[1],b[0]-a[0]);

		// Generate points p, q and r that form an equilateral triangle.

		// p is one third between a and b.
		// The next iteration of the program would define helper functions for such vector operations. 
		var p = add(a, vec2(u[0]/3, u[1]/3));

		// Calculate the midpoint between a and b.
		var mid = add(a, vec2(u[0]/2, u[1]/2));
		// Calculate q (the top vertex of the equilateral triangle) by following the orthogonal vector v from the midpoint.
		var q = add(mid, vec2(Math.sqrt(3)*v[0]/6, Math.sqrt(3)*v[1]/6));

		// r is two thirds between a and b.
		var r = add(a, vec2(2*u[0]/3, 2*u[1]/3));

		points = points.concat(a, p, q, r, b);
		return points;

	} else if (levels > 1) {
		// Generate the first Koch curve segment.
		var basepoints = kochCurve(a, b, levels - 1);

		// Generate a Koch curve segment for every pair of points (a, p), (p, q), (q, r), (r, b)
		for (var i = 0; i < basepoints.length-2; i+=2) {
			var newhead = vec2(basepoints[i], basepoints[i+1]);
			var newtail = vec2(basepoints[i+2], basepoints[i+3]);

			// New Koch curve segment (e.g. [a, x1, x2, x3, p]).
			var newpoints = kochCurve(newhead, newtail, levels - 1);

			// Append the elements of newpoints to the result. Small overlap in endpoints is okay.
			result = result.concat(newpoints);
		}
		return result;
	}
}

window.onload = function init() {
			// Set up WebGL
			var canvas = document.getElementById("gl-canvas");
			gl = WebGLUtils.setupWebGL( canvas );
			if(!gl){alert("WebGL setup failed!");}
			
			// Clear canvas
			gl.clearColor(0.0, 0.15, 0.2, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			
			// Load shaders and initialize attribute buffers
			var program = initShaders( gl, "vertex-shader", "fragment-shader" );
			gl.useProgram( program );
			
			// Set up initial head and tail.
			var head = vec2(-1.0, -0.2);
			var tail = vec2(1.0, -0.2);

			// Call the main kochCurve function. Works well with values in the range {1, 4}.
			vertices = kochCurve(head, tail, 4);

			// Load data into a buffer
			var vBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
			
			// Do shader plumbing
			var vPosition = gl.getAttribLocation(program, "vPosition");
			gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(vPosition);
			
			//Draw a triangle
			gl.drawArrays(gl.LINE_STRIP, 0, vertices.length/2); // note that the last argument is 3, not 1
};
