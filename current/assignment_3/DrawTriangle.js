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

	// Initialize vertices;
	var v1 = {};
	var v2 = {};
	var v3 = {};
	var v4 = {};

	// Two triangles that form a square
	var s = 0.2;
	var rectangles = new Float32Array(2**16);
	var colors = new Float32Array(2**16);
	var new_rectangle = [];
	var offsetv = 0;
	var offsetc = 0;
	var indexv = 0;
	var indexc = 0;
	var gray;
	var grayvec;
	var color;

	// Mouse click on canvas
	canvas.addEventListener("click", function(event) {
		var pos = getMousePosition(canvas, event);

		if (isEmpty(v1) && isEmpty(v3)) {
			v1.x = pos.x;
			v1.y = pos.y;
		} else if (!isEmpty(v1) && isEmpty(v3)) {
			v3.x = pos.x;
			v3.y = pos.y;
			v2.x = v1.x;
			v2.y = v3.y;
			v4.x = v3.x;
			v4.y = v1.y;

			// Compute vertices for the rectangle.
			new_rectangle = quad(v1, v2, v3, v4);

			// Compute color.
			gray = Math.random();
			grayvec = vec3(gray, gray, gray);
			color = repeatArray(grayvec, 6);
			// console.log(color.length);

			for (var i = 0; i<new_rectangle.length; i++) {
				rectangles[indexv] = new_rectangle[i];
				indexv++;
			}

			for (var i = 0; i<color.length; i++) {
				colors[indexc] = color[i];
				indexc++;
			}

			var subv = rectangles.subarray(indexv - 12);
			var subc = colors.subarray(indexc - 12);
			offsetv = 4*(indexv - 12);
			offsetc = 4*(indexc - 18);

			// console.log(rectangles, colors);
			// console.log(rectangles, colors);

			
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.bufferSubData(gl.ARRAY_BUFFER, offsetv, subv);

			gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, offsetc, subc);

			gl.drawArrays(gl.TRIANGLES, 0, 100);

			// Reset vertices
			v1 = {};
			v2 = {};
			v3 = {};
			v4 = {};
		}
	});

	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, rectangles, gl.DYNAMIC_DRAW);

	// Do shader plumbing
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);


	var cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

  // Do shader plumbing
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
 	gl.enableVertexAttribArray(vColor);

	//Draw rectangles
	// gl.drawArrays(gl.TRIANGLES, 0, rectangles.length/2);
	
};

function getMousePosition(canvas, event) {
	return {
		x: -1 + 2 * event.offsetX/canvas.width,
		y: -1 + 2 * (canvas.height - event.offsetY) / canvas.height
	};
}

// https://bencollier.net/2011/04/javascript-is-an-object-empty/
function isEmpty(object) {
	return Object.getOwnPropertyNames(object).length === 0;
}

// Generate vertices for 2 triangles that form a square.
// Input: 4 vertex object with `x` and `y` properties.
function quad(v1, v2, v3, v4) {
	return [v1.x, v1.y, v2.x, v2.y, v3.x, v3.y, v3.x, v3.y, v4.x, v4.y, v1.x, v1.y];
}

// Helper function.
function repeatArray(arr, n) {
  var result = [];
  for (var i = 0; i < n; i++) {
    result = result.concat(arr);
  }
  return result;
}