"use strict";
var gl; // global variable

window.onload = function init() {
			// Set up WebGL
			var canvas = document.getElementById("gl-canvas");
			gl = WebGLUtils.setupWebGL( canvas );
			if(!gl){alert("WebGL setup failed!");}
			
			// Clear canvas
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			
			// Load shaders and initialize attribute buffers
			var program = initShaders( gl, "vertex-shader", "fragment-shader" );
			gl.useProgram( program );
			
			var initial_config = {
			  x: 0, y:0, theta: 0	
			};

			var alpha = Math.PI/3;

			var axiom = "XF";

			var production_rules = {
				// F: "F[+F]F[-F]F"				  	//axiom:F, alpha = pi/8	
				// F: "FF+F+F+FF+F+F-F"    		//axiom:F, alpha = pi/2
				// F: "F+F-F-FF+F+F-F"      	//axiom:F, alpha = pi/2
				// F: "FF+[+F-F-F]-[-F+F+F]" 	//axiom:F, alpha = pi/8
				// F: "FF", X:"F[+X]F[-X]+X"	//axiom:X, alpha = pi/9
				// F: "F+f-F"									//axiom:F, alpha = pi/2
				// F: "F[+F]-F"

				// Sierpinski arrowhead curve: https://en.wikipedia.org/wiki/Sierpi%C5%84ski_arrowhead_curve
				X: "YF+XF+Y", Y:"XF-YF-X"			//axiom:XF, alpha = pi/2
			};

			var num_productions = 6;

			var v = turtle(initial_config, alpha, axiom, production_rules, num_productions);

			// Load data into a buffer
			var vBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
			
			// Do shader plumbing
			var vPosition = gl.getAttribLocation(program, "vPosition");
			gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(vPosition);
			
			// Draw 
			var num_vertices = v.length/2;
			gl.drawArrays(gl.LINES, 0, num_vertices); 
};

function turtle(initial_config, alpha, axiom, production_rules, num_productions) {

	// Initialize the points array, the newpoint, basepoint and statepoint objects.
	// Array that holds the final set of points to be drawn.
	var points = [];

	// Array that holds point objects used to save and retrieve states. 
	var states = [];

	// Temporary point objects used in the forEach loop.
	var newpoint = {}
	var basepoint = {};
	var statepoint = {};

	// Generate the full instruction string.
	var instructions = generateInstructions(axiom, production_rules, num_productions);

	// Copy the initial x, y coordinates and the theta into basepoint object.
	basepoint = clone(initial_config);

	instructions.forEach(function(instruction, i) {
		newpoint = {};
		switch (instruction) {

			// Move forward by distance 1 without drawing anything.
			case 'f':
				// Caclulate the coordinates of the new point.
				newpoint.x = basepoint.x + Math.cos(basepoint.theta);
				newpoint.y = basepoint.y + Math.sin(basepoint.theta);

				// Update the basepoint coordinates.
				basepoint.x = newpoint.x;
				basepoint.y = newpoint.y;

				break;

			// Move forward by distance 1 while drawing a line segment from the old position to the new position
			case 'F':
				// Push the start point of the line segment to the points array.
				points.push(basepoint.x, basepoint.y);

				// Calculcate and push the end point of the line segment to the points array.
				newpoint.x = basepoint.x + Math.cos(basepoint.theta);
				newpoint.y = basepoint.y + Math.sin(basepoint.theta);
				points.push(newpoint.x, newpoint.y);

				// Update the basepoint coordinates.
				basepoint.x = newpoint.x;
				basepoint.y = newpoint.y;

				break;

			// Turn to the right.	
			case '+':
				basepoint.theta -= alpha;
				break;

			// Turn to the left.
			case '-':
				basepoint.theta += alpha;
				break;

			// Save current state.	
			case '[':
				statepoint = clone(basepoint);
				states.push(statepoint);
				break;

			// Retrieve saved state.
			case ']':
				statepoint = states.pop();
				basepoint = clone(statepoint);
				break;

			// Default action: skip uknown instruction.	
			default:
				break;
		}
	});

	points = normalize(points);
	return points;
}

// Generates the full instuctions string.
function generateInstructions(axiom, production_rules, num_productions) {
	var instructions = axiom.split('');
	//  Array for storing temporary instructions.
	var output = [];

	for (var i = 0; i < num_productions; i++) {

		for (var j = 0; j < instructions.length; j++) {
			// If an instruction has a rule in production_rules,
			// append the expanded string to output.
			if (instructions[j] in production_rules) {
				output = output.concat(production_rules[instructions[j]].split(''));
			}
			// Else, just append the instruction as is to output.
			 	else {
				output = output.concat(instructions[j]);
			}
		}

		// Transfer the new instruction set into the instructions array
		// and empty the output array.
		instructions = output;
		output = [];
	}

	return instructions;
}

// Clone a JavaScript object.
function clone(obj) {
		return JSON.parse(JSON.stringify(obj));
}

// Convert between the canvas and WebGL coordinates.
function normalize(v) {
	var x = [], y =[], i;

	for (i=0; i<v.length; i+=2) {
		x.push(v[i]);
	}
	for (i=1; i<v.length; i+=2) {
		y.push(v[i]);
	}

	var xmin = Math.min.apply(null,x);
	var xmax = Math.max.apply(null,x);
	var ymin = Math.min.apply(null,y);
	var ymax = Math.max.apply(null,y);
	var xmid = (xmin+xmax)/2;
	var ymid = (ymin+ymax)/2;
	var xrange = xmax - xmin;
	var yrange = ymax - ymin;
	var s = 1.9/Math.max(xrange, yrange);

  for (i=0; i<v.length; i+=2) {
  	v[i] = s*(v[i] - xmid);
  }
  for (i=1; i<v.length; i+=2) {
  	v[i] = s*(v[i] - ymid);
  }

	return v;
}