"use strict";

var gl;
var points;
var vertices=[];
var th=0.0;
var theta = 0.0;
var thetaLoc;
var direction = 1;
var speed = 100;

function changeDir(){
	direction *= -1;
}
function initPicture(){
	var canvas = document.getElementById( "canvas" );
	gl = WebGLUtils.setupWebGL( canvas );
	if( !gl ){
		alert( "WebGL isn't available" );
	}

	var vertices = [
		-0.5 , 0.5,
		-0.25, 0.5,
		-0.4 , 0.6,
		-0.25, 0.5,
		-0.4 , 0.4,
		 0.5 , 0.5,
		 0.25, 0.5,
		 0.4 , 0.6,
		 0.25, 0.5,
		 0.4 , 0.4,
		 -0.25,0,
		 -0.25,-0.25,
		 0.25,-0.25,
		 0.25,0,
		 -0.1,0,
		 -0.1,-0.15,
		 0.1,0,
		 0.1,-0.15,
	];
	 
	for(var i=0;i<100;i++){  //脸
		th+=2*Math.PI/100;
		var x=Math.sin(th);
		var y=Math.cos(th);
		vertices.push(x,y);
	}
	// Configure WebGL
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

	// Load shaders and initialize attribute buffers
	var program = initShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( program );

	// Load the data into the GPU
	var bufferId = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
	gl.bufferData( gl.ARRAY_BUFFER, new Float32Array( vertices ), gl.STATIC_DRAW );

	// Associate external shader variables with data buffer
	var vPosition = gl.getAttribLocation( program, "vPosition" );
	gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vPosition );
		
	thetaLoc = gl.getUniformLocation( program, "theta" );
	
	document.getElementById( "speedcon" ).onchange = function( event ){
		speed = 100 - event.target.value;
	}
	
	renderSquare();
}

function render(){
	//gl.clear( gl.COLOR_BUFFER_BIT );
	
	gl.drawArrays(gl.LINES,0,2);
    gl.drawArrays(gl.LINE_STRIP,2,3);
	gl.drawArrays(gl.LINES,5,2);
	 gl.drawArrays(gl.LINE_STRIP,7,3);
	  gl.drawArrays(gl.LINE_LOOP,10,4);
	  gl.drawArrays(gl.LINES,14,4);
	  gl.drawArrays(gl.LINE_LOOP,18,100);
}

function renderSquare(){
	gl.clear( gl.COLOR_BUFFER_BIT );
	
	// set uniform values
	theta += direction * 0.2;
	gl.uniform1f( thetaLoc, theta );
    render();
	// update and render
	setTimeout( function(){ requestAnimFrame( renderSquare ); }, speed );
}