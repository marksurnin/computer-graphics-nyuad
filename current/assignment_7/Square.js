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
var grid;
var Locations;


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

			// floor 
			var l = 1.0;

			var n = 100; // Cool stuff when n is 6, 10. 20 is super crazy, at your own risk, please :)
			

			function Grid(n) {
				var gridObj = {};
				gridObj.positions = [];
				gridObj.triangles = [];	
				gridObj.normals = [];	

				function generateGridVertices(n) {
					var prev = {};
					var next = {};
					prev.y = -l;
					next.y = -l;

					for (var row = 0; row <= n; row++) {
						next.x = -l;
						prev.x = -l;

						// vertices.push(vec3(next.x, next.y, 0));
						gridObj.positions.push(vec3(next.x, next.y, 0));
						gridObj.normals.push(vec3(0, 1, 0));						

						for (var col = 0; col < n; col++) {
							next.x = prev.x + 2*l/n;
							// vertices.push(vec3(next.x, next.y, 0));
							gridObj.positions.push(vec3(next.x, next.y, 0));
							gridObj.normals.push(vec3(0, 1, 0));
							
							prev.x = next.x;
						}
						next.y = prev.y + 2*l/n;
						prev.y = next.y;
					}
				}

				function triangulate(n) {
					var output = [];
					// Generate unique indices
					for (var i = 0; i < n*(n+1); i++) {
						output.push(i, i+n+1);
					}

					var triangles = [];
					for (var i = 0; i < output.length - 2; i++) {
						triangles.push([output[i], output[i+1], output[i+2]]);
						gridObj.triangles.push([output[i], output[i+1], output[i+2]]);
					}

					var numTrianglesPerRow = Math.floor(triangles.length/n) - 1;
					var offset = 0;

					// Splice stuff
					for (var i = 1; i < n; i++) {
						offset = offset + numTrianglesPerRow;
						triangles.splice(offset, 2);
						gridObj.triangles.splice(offset, 2);
					}
				}

				generateGridVertices(n)
				triangulate(n);

				return gridObj;
			}

			grid = Grid(n);
			objInit(grid);
			console.log(grid);

			// get location of MVP
			uMVP = gl.getUniformLocation(program,"MVP");

			var Uniforms = ["VP", "TBNT", "TB", "cameraPosition", 
			  "Ka", "Kd", "Ks", "shininess", 
			  "Ia", "Id", "Is", "lightPosition", "shading", "t"];
			var Attributes = ["vPosition"];
			Locations = getLocations(Attributes, Uniforms);

			// set light source
			var Light = {
				position: vec3(-30,50,100),
				Ia: vec3(0.2, 0.2, 0.2),
				Id: vec3(1,1,1),
				Is: vec3(0.8,0.8,0.8)
			};

			gl.uniform3fv( Locations.lightPosition, flatten(Light.position) );
			gl.uniform3fv( Locations.Ia, flatten(Light.Ia) );
			gl.uniform3fv( Locations.Id, flatten(Light.Id) );
			gl.uniform3fv( Locations.Is, flatten(Light.Is) );

			// set material
			var Material = {	
				Ka: vec3(1.0, 1.0, 1.0),
				Kd: vec3(0.1, 0.2, 0.8),
				Ks: vec3(1.0, 1.0, 1.0),
				shininess: 500 
			};

			gl.uniform3fv(Locations.Ka, flatten(Material.Ka));
			gl.uniform3fv(Locations.Kd, flatten(Material.Kd));
			gl.uniform3fv(Locations.Ks, flatten(Material.Ks));
			gl.uniform1f(Locations.shininess, Material.shininess);

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

	requestAnimationFrame(render);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var TB = trackball.getMatrix();
	gl.uniformMatrix4fv(Locations.TB, gl.FALSE, flatten(TB));

	var TBNT = trackball.getNormalTransformationMatrix();
	gl.uniformMatrix3fv(Locations.TBNT, gl.FALSE, flatten(TBNT));	

	var VP = camera.getMatrix(); 
	gl.uniformMatrix4fv(Locations.VP, gl.FALSE, flatten(VP));	

	var cameraPosition = vec3(0,0,3);
	gl.uniform3fv(Locations.cameraPosition, flatten(cameraPosition));

	var t = now * 0.0008;
	t = t.toFixed(2);
	gl.uniform1f(Locations.t, t);

	grid.draw();
}

function fmod(a,b) { 
	return a - Math.floor(a / b) * b;
}




