function Camera(canvas){

	var Mcam = mat4(); // camera matrix 
	var P = mat4();    // projection matrix
	var theta = 5;
	var distance = 0.2;

	var prevKeyCode = 0;
	
	var Cam = { /* object to be returned */
		 	
		 	lookAt: function (eye, at, up) {
		 		Mcam = cameraMatrix(eye, at, up); 
		 	},

		 	setPerspective: function(fovy, aspect, near, far){
				P = perspectiveMatrix(fovy, aspect, near, far );
			},

			setOrthographic: function (r,l,t,b,n,f){
				P = orthoProjMatrix(r,l,t,b,n,f);
			},
			
			getCameraTransformationMatrix(){
				return MCam;
			},
			
			getProjectionMatrix(){
				return P;
			},

			getMatrix: function(){
				// combines camera transformation and projection
				return mult(P,Mcam);
			},

			keyPressed: function(keyCode) {

				//console.log(prevKeyCode, keyCode);

				if (prevKeyCode === 17 && (keyCode === 38 || keyCode === 40)) {

					if (keyCode === 38) {
						translation = distance;
					} else if (keyCode === 40) {
						translation = -distance;
					}

					//console.log(translation);

					var rowX = vec4(1,0,0,0);
					var rowY = vec4(0,1,0,translation);
					var rowZ = vec4(0,0,1,0);
					var rowW = vec4(0,0,0,1);
					translationMatrix = mat4(rowX, rowY, rowZ, rowW);
					Mcam = mult(translationMatrix, Mcam);
				}

				else if (keyCode === 38 || keyCode === 40) {
					//console.log('up');

					if (keyCode === 38) {
						angle = -theta;
					} else if (keyCode === 40) {
						angle = theta;
					}

					var angleR = angle * Math.PI/180;
					var rowX = vec4(1,0,0,0);
					var rowY = vec4(0, Math.cos(angleR), -Math.sin(angleR), 0);
					var rowZ = vec4(0, Math.sin(angleR), Math.cos(angleR), 0);
					var rowW = vec4(0,0,0,1);
					rotationMatrix = mat4(rowX, rowY, rowZ, rowW);
					Mcam = mult(rotationMatrix, Mcam);
				}

				if (prevKeyCode === 17 && (keyCode === 37 || keyCode === 39)) {

					if (keyCode === 37) {
						translation = -distance;
					} else if (keyCode === 39) {
						translation = distance;
					}

					var rowX = vec4(1,0,0,translation);
					var rowY = vec4(0,1,0,0);
					var rowZ = vec4(0,0,1,0);
					var rowW = vec4(0,0,0,1);
					translationMatrix = mat4(rowX, rowY, rowZ, rowW);
					Mcam = mult(translationMatrix, Mcam);
				}

				else if (keyCode === 37 || keyCode === 39) {
					if (keyCode === 37) {
						angle = -theta;
					} else if (keyCode === 39) {
						angle = theta;
					}

					var angleR = angle * Math.PI/180;
					//console.log('up');
					var rowX = vec4(Math.cos(angleR), 0, Math.sin(angleR), 0);
					var rowY = vec4(0,1,0,0);
					var rowZ = vec4(-Math.sin(angleR), 0, Math.cos(angleR), 0);
					var rowW = vec4(0,0,0,1);
					rotationMatrix = mat4(rowX, rowY, rowZ, rowW);
					Mcam = mult(rotationMatrix, Mcam);
				}


				//az

				if (keyCode === 65 || keyCode === 90) {
					if (keyCode === 65) {
						translation = -distance;
					} else if (keyCode === 90) {
						translation = distance;
					}

					var rowX = vec4(1,0,0,0);
					var rowY = vec4(0,1,0,0);
					var rowZ = vec4(0,0,1,translation);
					var rowW = vec4(0,0,0,1);
					rotationMatrix = mat4(rowX, rowY, rowZ, rowW);
					Mcam = mult(rotationMatrix, Mcam);
				}

				prevKeyCode = keyCode;

				return 0;
			}

	};

	function cameraMatrix(eye, at, up){
	  var w = normalize(subtract(eye,at));
	  var u = cross(up, w);
	  var v = cross(w,u);
	  return mat4( vec4(u, -dot(u,eye)),
				vec4(v, -dot(v,eye)),
				vec4(w, -dot(w,eye)),
				vec4(0,0,0,1)
			);
	}

	function orthoProjMatrix(r,l,t,b,n,f){ // n and f should be -ve

		return mat4(2/(r-l), 0, 0, -(r+l)/(r-l),
					0, 2/(t-b), 0, -(t+b)/(t-b),
					0, 0, 2/(n-f), -(n+f)/(n-f),
					0, 0, 0, 1);

	}

	function perspProjectionMatrix(r,l,t,b,n,f){ // n and f should be -ve

		return mat4(-2*n/(r-l), 0, (r+l)/(r-l), 0,
					0, -2*n/(t-b),(t+b)/(t-b), 0,
					0, 0, -(n+f)/(n-f), 2*f*n/(n-f),
					0, 0, -1, 0 );
	}

	function perspectiveMatrix(fovy, aspect, near, far ){ // near and far are +ve
		var t = near*Math.tan(radians(fovy/2));
		var r = t*aspect;
		return perspProjectionMatrix(r,-r, t,-t, -near, -far);
	}

	return Cam;

}