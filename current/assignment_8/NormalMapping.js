"use strict";

// global variables
var gl, canvas, program, grid, cube, terrain;

var camera; 	// camera object
var trackball; 	// virtual trackball 

var Locations;  // object containing location ids of shader variables 

var obj1, obj2;

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

	// Get Locations of attributes and Locations
	var Attributes = [];
	var Uniforms = ["VP", "TB", "TBN", "cameraPosition", "cameraProjection", "Ia", "Id", "Is", "lightPosition", "cube", "terrain"];

	Locations = getLocations(Attributes, Uniforms); // defined in Utils.js
 
	// set up virtual trackball
	trackball = Trackball(canvas);

	// set up Camera
	camera = Camera(); // Camera(...) is defined in Camera.js
	var eye = vec3(0,0,0);
	var at = vec3(0,0,-100);
	var up = vec3(0,1,0);
	camera.lookAt(eye,at,up);
	camera.setPerspective(90,1,0.1,10);


	// set light source
	var Light = {
		position: vec3(0.1,0,0),
		Ia: vec3(0.3, 0.3, 0.3),
		Id: vec3(1,1,1),
		Is: vec3(1,1,1)
	};

	gl.uniform3fv( Locations.lightPosition, flatten(Light.position) );
	gl.uniform3fv( Locations.Ia, flatten(Light.Ia) );
	gl.uniform3fv( Locations.Id, flatten(Light.Id) );
	gl.uniform3fv( Locations.Is, flatten(Light.Is) );


	// set up scene	

	obj1 = Cube();
	obj1.diffuseMap = "cubemap.jpg";
	// obj1.normalMap = "Textures/earth-normal.jpg";
	objInit(obj1);
	obj1.setModelMatrix(rotateX(90));


	// obj2 = Square();
	// obj2.diffuseMap = "Textures/brick-diffuse.jpg";
	// obj2.normalMap = "Textures/brick-normal.jpg";
	// objInit(obj2);
	// var m = mult(scalem(2,2,2),rotateX(90));
	// m = mult(translate(0,-1.5,0), m);
	// obj2.setModelMatrix(m);


	// Grid code from previous assignment
	var l = 1.0;
	var n = 40; // Cool stuff when n is 6, 10. 20 is super crazy, at your own risk, please :)

	function Grid(n) {
		var gridObj = {};
		gridObj.positions = [];
		gridObj.triangles = [];	

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
				for (var col = 0; col < n; col++) {
					next.x = prev.x + 2*l/n;
					// vertices.push(vec3(next.x, next.y, 0));
					gridObj.positions.push(vec3(next.x, next.y, 0));
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
			// console.log(output);

			var triangles = [];
			for (var i = 0; i < output.length - 2; i++) {
				triangles.push([output[i], output[i+1], output[i+2]]);
				gridObj.triangles.push([output[i], output[i+1], output[i+2]]);
			}
			var numTrianglesPerRow = Math.floor(triangles.length/n) - 1;
			// console.log(triangles);

			var offset = 0;

			// Splice stuff
			for (var i = 1; i < n; i++) {
				offset = offset + numTrianglesPerRow;
				triangles.splice(offset, 2);
				gridObj.triangles.splice(offset, 2);
			}

			// Rectangles
			var rectangles = [];
			for (var i = 0; i < output.length - 2; i+=2) {
				// console.log(i);
				rectangles.push([output[i], output[i+1], output[i+3], output[i+2]]);
			}
			// console.log(rectangles);
			// console.log(rectangles[4]);
			var numRectanglesPerRow = numTrianglesPerRow / 2;
			offset = 0;

			// Splice stuff
			for (var i = 1; i < n; i++) {
				offset = offset + numRectanglesPerRow;
				rectangles.splice(offset, 1);
				// gridObj.triangles.splice(offset, 2);
			}
			console.log(rectangles);
			// gridObj.texCoords = rectangles;
		}

		generateGridVertices(n)
		triangulate(n);

		return gridObj;
	}

	grid = Grid(n);
	grid.diffuseMap = "moss-diffuse.jpg";
	grid.normalMap = "moss-normal.jpg";
	objInit(grid);
	console.log(grid);	

	var m = mult(scalem(3,3,3),rotateX(90));
	m = mult(translate(0,-0.9,0), m);
	grid.setModelMatrix(m);


	requestAnimationFrame(render);

};

function render(now){
	
	requestAnimationFrame(render);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	var TB = trackballWorldMatrix(trackball, camera);
	gl.uniformMatrix4fv(Locations.TB, gl.FALSE, flatten(TB));

	var TBN = normalTransformationMatrix(TB); 
	gl.uniformMatrix3fv(Locations.TBN, gl.FALSE, flatten(TBN));
	
	var VP = camera.getMatrix(); 
	gl.uniformMatrix4fv(Locations.VP, gl.FALSE, flatten(VP));	

	var cameraProjection = camera.getProjectionMatrix();
	gl.uniformMatrix4fv(Locations.cameraProjection, gl.FALSE, flatten(cameraProjection));

	var cameraPosition = camera.getFrame().e;
	gl.uniform3fv(Locations.cameraPosition, flatten(cameraPosition));

	obj1.setModelMatrix(mult(translate(cameraPosition), rotateX(90)));
  gl.uniform1f(Locations.cube, 1.0);
	obj1.draw();
	gl.uniform1f(Locations.cube, 0.0);

	gl.depthMask(false);
	gl.uniform1f(Locations.terrain, 1.0);
	grid.draw();
	gl.uniform1f(Locations.terrain, 0.0);
	// gl.depthMask(true);

	TB = mat4();
	gl.uniformMatrix4fv(Locations.TB, gl.FALSE, flatten(TB));

	TBN = mat3();
	gl.uniformMatrix3fv(Locations.TBN, gl.FALSE, flatten(TBN));

	// obj2.draw();
}

//-------------------------- CREATE SPHERE ----------------------------------- 
// create sphere with texture coordinates
function Sphere(){

	var S = { 	positions: [],
				normals: [],
				texCoords: [],
				triangles: [],
				material: {	Ka: vec3(0.1, 0.1, 0.1),
							Kd: vec3(0.7, 0.1, 0.6),
							Ks: vec3(0.1, 0.1, 0.1),
							shininess: 1
				},
			};

	var N = 100; // # latitudes (excluding poles) = N, # longitudes = 2*N+3
	var i, j;

	S.normals = S.positions; // for unit sphere with center (0,0,0), normal = position

	S.positions[0] = (vec3(0,0,1)); // north pole
	S.positions[(2*N+3)*N +1] = vec3(0,0,-1); // south pole
	
	// fill positions array
	for(i=0; i< N; ++i){ 
		for(j=0; j< 2*N+3; ++j){
			S.positions[index(i,j)] = pos(i,j);
		}
	}

	// fill triangles array
	for(j = 0; j< 2*N+2; ++j) {
		// north pole triangle fan
		S.triangles.push( vec3(0, index(0,j), index(0,j+1)) ); 
		// south pole tri fan
		S.triangles.push( vec3( index(N-1,j), (2*N+3)*N+1, index(N-1,j+1)) ); 
	}
	
	// the rest of the quads
	for(i = 0; i<N-1; ++i){ 
		for(j=0; j< 2*N+2; ++j){
			S.triangles.push( vec3(index(i,j), index(i+1,j), index(i+1,j+1)) );
			S.triangles.push( vec3(index(i,j), index(i+1, j+1), index(i,j+1)) );	
		}
	}
	
	// fill texCooords array
	for(i = 0; i < S.positions.length; ++i){ 	
		S.texCoords.push(textureCoords(S.positions[i])); 
	}

	function index(i,j){
		return i*(2*N+3) + j + 1;
	}

	function pos(i, j){
		var theta = (i+1)*Math.PI/(N+1);
		var phi = j*Math.PI/(N+1);
		return vec3(Math.sin(theta)*Math.cos(phi), 
					Math.sin(theta)*Math.sin(phi), 
					Math.cos(theta));
	}
	
	function textureCoords(pos){
		var x = pos[0];
		var y = pos[1];
		var z = pos[2];
		var theta = Math.atan2(Math.sqrt(x*x+y*y), z);
		var phi = Math.atan2(y,x);
		if(phi<0){phi += 2*Math.PI; }
		var t = vec2(phi/(2*Math.PI), 1 - theta/Math.PI);
		return t;
	}
	
	return S;
}

//-------------------------- CREATE SQUARE ----------------------------------- 

function Square(){
// create sphere with texture coordinates
	var a = vec3(-1,-1,0);
	var b = vec3(1,-1,0);
	var c = vec3(1,1,0);
	var d = vec3(-1,1,0);
	var n = vec3(0,0,1);
	var ta = vec2(0,0);
	var tb = vec2(1,0);
	var tc = vec2(1,1);
	var td = vec2(0,1);

	var S = {	positions: [a,b,c,d],
		 	  	normals:   [n,n,n,n], 
		 	  	texCoords: [ta,tb,tc,td],
		 	  	triangles: [[0,1,2],[0,2,3]],
		 	  	material: {	
							Ka: vec3(0.2, 0.2, 0.2),
							Kd: vec3(0.0, 1.0, 0.5),
							Ks: vec3(0.0, 0.0, 0.0),
		 	  				shininess: 10
		 	  	}
	};

	return S;
}


//-------------------------- CREATE CUBE ----------------------------------- 

function Cube(){
// create sphere with texture coordinates
	var l = 1;
	var a = vec3(-l,-l,-l);
	var b = vec3( l,-l,-l);
	var c = vec3( l, l,-l);
	var d = vec3(-l, l,-l);
	var e = vec3(-l,-l, l);
	var f = vec3( l,-l, l);
	var g = vec3( l, l, l);
	var h = vec3(-l, l, l);

	var n_top = vec3(0,-1,0);
	var n_bottom = vec3(0,1,0);
	var n_left = vec3(1,0,0);
	var n_right = vec3(-1,0,0);
	var n_front = vec3(0,0,-1);
	var n_back = vec3(0,0,1);
	
	var ta = vec2(0,0);
	var tb = vec2(1,0);
	var tc = vec2(1,1);
	var td = vec2(0,1);

	var S = {	positions: [a,a,a,b,b,b,c,c,c,d,d,d,e,e,e,f,f,f,g,g,g,h,h,h],
		 	  	
		 	  	texCoords: [  vec2(0.25, 0.00),  vec2(0.00, 0.33),  vec2(1.00, 0.33),  vec2(0.50, 0.00),
		 	  								vec2(0.75, 0.33),  vec2(0.75, 0.33),  vec2(0.50, 0.33),  vec2(0.50, 0.33),
		 	  								vec2(0.50, 0.33),  vec2(0.25, 0.33),  vec2(0.25, 0.33),  vec2(0.25, 0.33),
		 	  								vec2(0.25, 1.00),  vec2(0.00, 0.66),  vec2(1.00, 0.66),  vec2(0.50, 1.00),
		 	  								vec2(0.75, 0.66),  vec2(0.75, 0.66),  vec2(0.50, 0.66),  vec2(0.50, 0.66),
		 	  								vec2(0.50, 0.66),  vec2(0.25, 0.66),  vec2(0.25, 0.66),  vec2(0.25, 0.66)], 
		 	  	triangles: [ [ 0, 3, 6], [ 0, 6, 9],	// bottom
		 	  							 [18,15,12], [12,21,18],	// top
		                   [13, 1,10], [13,10,22],	// left
		                   [ 4,16,19], [ 4,19, 7],	// right
		                   [11, 8,20], [11,20,23], 	// back
		                   [14,17, 5], [14, 5, 2]],	// front

		                   // Old vertices
		 	  							 // [0,1,2], [0,2,3], // bottom
		 	  							 // [6,5,4], [4,7,6], // top
		            			 // [4,0,3], [4,3,7], // left
		            			 // [1,5,6], [1,6,2], // right
		            			 // [3,2,6], [3,6,7], // back
		            			 // [4,5,1], [4,1,0]	// front
		 	  	material: {	
							Ka: vec3(0.2, 0.2, 0.2),
							Kd: vec3(0.0, 1.0, 0.5),
							Ks: vec3(0.0, 0.0, 0.0),
		 	  				shininess: 10
		 	  	}
	};

	return S;
}

