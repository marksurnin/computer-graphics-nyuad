function objInit(Obj){
	/* Assumes Obj contains a "positions" array.
	   Note: the elements of these arrays are arrays of length 3. */
	
	var vBuffer, nBuffer, iBuffer;
	var modelMatrix = mat4();
	
	var trianglesPresent = 
		(Obj.triangles !== undefined) && (Obj.triangles.length > 0);

	var normalsPresent = 
	    (Obj.normals!==undefined) && (Obj.normals.length > 0);

	if(!trianglesPresent){ 
		/* Obj.triangles = [[0,1,2], [3,4,5], ...] */
		Obj.triangles = [];
		for(var i = 0; i<Obj.positions.length/3; ++i){
			Obj.triangles[i] = [3*i, 3*i+1, 3*i+2];
		}
	}
	
	if(!normalsPresent){
		computeNormals();
	}
	
	setupBuffers();
	
	
	/*----- Attach functions to Obj -----*/
	 
	Obj.setModelMatrix = function(M){ modelMatrix = M; }

	Obj.getModelMatrix = function(M){ return modelMatrix; }
	
	Obj.getNormalTransformationMatrix = function (){
		var m = modelMatrix;
		// take the 3x3 part of m, transpose it and take inverse 
		return inverse3 ( mat3(m[0][0], m[1][0], m[2][0],
							   m[0][1], m[1][1], m[2][1],
							   m[0][2], m[1][2], m[2][2] ) );
	}
	
	Obj.draw = function(){
		// Set attribute pointers
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.vertexAttribPointer( gl.getAttribLocation(program,"vPosition"), 
		                        3, gl.FLOAT, false, 0, 0);
		
		// gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		// gl.vertexAttribPointer( gl.getAttribLocation(program,"vNormal"), 
		// 						3, gl.FLOAT, false, 0, 0);

		// Draw
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
		gl.drawElements(gl.TRIANGLES, 3*Obj.triangles.length, 
										 gl.UNSIGNED_SHORT, 0);
		
	}
	
	/*----- Helper functions defined below -----*/
	
	function setupBuffers(){
		// setup vertex buffer 
		vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.positions), gl.STATIC_DRAW);
		
		//setup normals buffer
		// nBuffer = gl.createBuffer();
		// gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
		// gl.bufferData(gl.ARRAY_BUFFER, flatten(Obj.normals), gl.STATIC_DRAW);

		// setup index buffer
		iBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 
						  new Uint16Array(flatten(Obj.triangles)),gl.STATIC_DRAW);
	
	}
	
	function computeNormals(){
		/* Go over each triangle and compute the normals.
		   The normal at a vertex is the weighted sum of the 
		   normals of adjacent triangles. The weight of a 
		   triangle is proportional to its area. */
		var info = {};

		for (var i = 0; i < Obj.triangles.length; i++) {
			var triangle = Obj.triangles[i];
			//console.log('triangle', triangle);

			var A = Obj.positions[triangle[0]];
			var B = Obj.positions[triangle[1]];
			var C = Obj.positions[triangle[2]];

			var area = Math.abs((A[0]*(B[1]-C[1]) + B[0]*(C[1]-A[1]) + C[0]*(A[1]-B[1]))/2);
			info[i.toString()] = area;
		}
		info['0']['normal'] = 7;
		console.log(info);


		Obj.normals = [];
		// Add your code here.
	}
}



