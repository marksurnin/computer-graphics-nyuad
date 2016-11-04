"use strict";

// global variables
var gl; 
var canvas;
var program;
var vBuffer, cBuffer, iBuffer;

var cubeModelMatrix, floorModelMatrix;
var camera; // camera object
var trackball; // virtual trackball 
var numVertices, numIndices;


var uMVP; // location of Model-View-Projection matrix

window.onload = function init() {
			// Set up WebGL
			canvas = document.getElementById("gl-canvas");
			gl = WebGLUtils.setupWebGL( canvas );
			if(!gl){alert("WebGL setup failed!");}
			
			// set clear color 
			gl.clearColor(0.0, 0.0, 0.0, 1.0);
			
			//Enable depth test
			gl.enable(gl.DEPTH_TEST);
			gl.depthFunc(gl.LEQUAL); // since WebGL uses left handed
			gl.clearDepth(1.0); 	 // coordinate system
			
			// Load shaders and initialize attribute buffers
			program = initShaders( gl, "vertex-shader", "fragment-shader" );
			gl.useProgram( program );

			// Load data into a buffer
			var vertices = [];
			var colors = [];
			var indices = [];

			var R = vec3(1,0.6,0);
			var G = vec3(0,1,0);
			var B = vec3(0,0,1);

			// floor 
			var l = 1.0;

			var n = 10; // Cool stuff when n is 6, 10. 20 is super crazy, at your own risk, please :)
			var A = vec3(-l, l,0);
			var B = vec3(-l,-l,0);
			var C = vec3( l,-l,0);
			var D = vec3( l, l,0);

			function grid(A, B, C, D, n) {
				var prev = {};
				var next = {};
				prev.y = -l;
				next.y = -l;

				for (var row = 0; row <= n; row++) {
					next.x = -l;
					prev.x = -l;
					vertices.push(vec3(next.x, next.y, 0));
					for (var col = 0; col < n; col++) {
						next.x = prev.x + 2*l/n;
						vertices.push(vec3(next.x, next.y, 0));
						prev.x = next.x;
					}
					next.y = prev.y + 2*l/n;
					prev.y = next.y;
				}
			}

			function triangulate(numVertices) {
				var output = [];
				// Generate unique indices
				for (var i = 0; i < n*(n+1); i++) {
					output.push(i, i+n+1);
				}

				var triangles = [];
				for (var i = 0; i < output.length - 2; i++) {
					triangles.push([output[i], output[i+1], output[i+2]]);
				}

				var numTrianglesPerRow = Math.floor(triangles.length/n) - 1;
				var offset = 0;

				// Splice stuff
				for (var i = 1; i < n; i++) {
					offset = offset + numTrianglesPerRow;
					triangles.splice(offset, 2);
				}

				indices = flatten(triangles);
			}

			grid(A, B, C, D, n);
			triangulate(vertices.length);
			numIndices = indices.length;

			// the z function
			for (var i = 0; i < vertices.length; i++) {
				if (vertices[i][0] == 0 && vertices[i][1] == 0) {
					vertices[i][2] = 0;
				} else {
					var r = Math.sqrt(vertices[i][0]**2 + vertices[i][1]**2);
					vertices[i][2] = (Math.sin(20*r)/(20*r))
				}

				var gray = Math.random();
				colors.push(vec3(gray, gray, gray));
			}

			floorModelMatrix = translate(0,-0.3,0);


			// get location of MVP
			uMVP = gl.getUniformLocation(program,"MVP");


			vBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
			

			cBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);


			iBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

						
			// Do shader plumbing
			var vPosition = gl.getAttribLocation(program, "vPosition");
			gl.enableVertexAttribArray(vPosition);

			var vColor = gl.getAttribLocation(program,"vColor");
			gl.enableVertexAttribArray(vColor);

			gl.bindBuffer(gl.ARRAY_BUFFER,vBuffer);
			gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
			
			gl.bindBuffer(gl.ARRAY_BUFFER,cBuffer);
			gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);


			// set up virtual trackball
			trackball = Trackball(canvas);


			// set up Camera
			camera = Camera(canvas); 
			var eye = vec3(0,0, 3);
			var at = vec3(0, 0 ,0);
			var up = vec3(0,1,0);
			camera.lookAt(eye,at,up);
			camera.setPerspective(90,1,0.1,10);

			document.body.onkeydown = function(e){
				camera.keyPressed(e.keyCode);
			};
			
			requestAnimationFrame(render);

};

function render(now){
	var MVP;

	requestAnimationFrame(render);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


	//draw cube
	var t = fmod(now/1000,2);
	var h;
	if(t < 1){
		h = 1-t*t;
	}
	else{
		h = 1 - (2-t)*(2-t);
	}

	var tbMatrix = trackball.getMatrix();
	var cameraMatrix = camera.getMatrix();
	var M =  mult(cameraMatrix, tbMatrix); // combining camera and trackball matrices

	//MVP = mult( M, mult(translate(0,h,0), cubeModelMatrix) );
	//gl.uniformMatrix4fv(uMVP, gl.FALSE, flatten(MVP));
	
	//gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_BYTE,0);

	//draw floor
	MVP = mult(M, floorModelMatrix);
	gl.uniformMatrix4fv(uMVP, gl.FALSE, flatten(MVP));
	gl.drawElements(gl.TRIANGLES, numIndices, gl.UNSIGNED_BYTE, 0);

}

function fmod(a,b) { 
	return a - Math.floor(a / b) * b;
}




