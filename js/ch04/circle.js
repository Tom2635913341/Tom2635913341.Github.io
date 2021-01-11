"use strict";

var canvas;
var gl;

var points = [];
var colors = [];

var index = 0;
var num;

var Rmove = [];
var rRmove = [];
var moveLoc;
var zoom = 0.0;
var zoomLoc;
var theta = 0.0;
var thetaLoc;

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
	
	function circlecreate(){
		index++;
		var alpha = 2 * Math.PI/num;
		points = [];
		colors = [];
		points.push(0.0, 0.0, 1.0);
		colors.push(1.0, 0.0, 1.0, 1.0);
		for(var i=0;i<=num;i++){
			points.push(0.2 * Math.cos(Math.PI-alpha*i), 0.2 * Math.sin(Math.PI-alpha*i), 0.0);
			colors.push(1.0, 0.0, 1.0, 1.0);
		}
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
	}
	
	zoomLoc = gl.getUniformLocation(program, "zoom");
	moveLoc = gl.getUniformLocation(program, "move");
	thetaLoc = gl.getUniformLocation(program, "theta");
	
	canvas.addEventListener("mousedown", function(event){
		var rect = canvas.getBoundingClientRect();
		var cx = event.clientX - rect.left;
		var cy = event.clientY - rect.top; // offset
		var t = 2 * cx / canvas.width - 1;
		var c = 2 * (canvas.height - cy) / canvas.height - 1;
		
		Rmove.push([t, c]);
		rRmove.push([t, c]);
		circlecreate();

	});
	
	num = document.getElementById("sel").value * 3;
	
	document.getElementById("sel").onchange = function(){
		num = document.getElementById("sel").value * 3;
		index--;
		circlecreate();
	}
	
	render();

}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.uniform2fv(thetaLoc, [0.0, 0.0]);
	gl.uniform2fv(zoomLoc, [0.0, 0.0]);
	for(var i=0;i<index;i++){
		rRmove[i][0] += Math.random()/10 - 0.05;
		rRmove[i][1] += Math.random()/10 - 0.05;		
		if(rRmove[i][0] > 1 || rRmove[i][0] < -1 || rRmove[i][1] > 1 || rRmove[i][1] < -1){
			rRmove[i][0] -= rRmove[i][0]/5;
			rRmove[i][1] -= rRmove[i][1]/5;
		}
		gl.uniform2fv(moveLoc, rRmove[i]);
		gl.drawArrays(gl.TRIANGLE_FAN, 0, num+2);
	}
	
	requestAnimFrame(render);
}

