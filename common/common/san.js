"use strict";

var canvas;
var gl;

var index = 0;

var m = [];
var mLoc;
var z = 0.0;
var zLoc;
var theta = 0.0;
var thetaLoc;

var points = [
	0.0,  0.2, 0.0,
   -0.2, -0.2, 0.0,
	0.2, -0.2, 0.0,
];
var colors = [
	0.0, 1.0, 1.0, 1.0,
	0.0, 1.0, 1.0, 1.0,
	0.0, 1.0, 1.0, 1.0,
];

window.onload = function init(){
	
	canvas = document.getElementById("canvas");
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl) {
	    alert("WebGL isn't available");
	}
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	
	var program = initShaders(gl, "v-shader", "f-shader");
	gl.useProgram(program);
	
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
	
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);
	
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);		
	
	zLoc = gl.getUniformLocation(program, "z");
	mLoc = gl.getUniformLocation(program, "m");
	thetaLoc = gl.getUniformLocation(program, "theta");
	
	canvas.addEventListener("mousedown", function(event){
		var r = canvas.getBoundingClientRect();
		var clx = event.clientX - r.left;
		var cly = event.clientY - r.top; 
		var t = 2 * clx / canvas.width - 1;
		var c = 2 * (canvas.height - cly) / canvas.height - 1;
		m.push([t, c]);
		index++;
	});
	
	render();
	
}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	z -= 0.01;
	if(z < -0.5) z = 0.0;
	gl.uniform2fv(zLoc, [z, z]);
	gl.uniform2fv(thetaLoc, [0.0, 0.0]);
	for(var i=0;i<index;i++){
		gl.uniform2fv(mLoc, m[i]);
		gl.drawArrays(gl.TRIANGLES, 0, 3);
	}
	
	requestAnimFrame(render);
}


