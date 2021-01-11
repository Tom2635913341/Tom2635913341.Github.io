"use strict";

const { vec4 } = glMatrix;

var canvas;
var gl;

var points = [];
var colors = [];

var index = 0;

var move = [];
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
	
	makeCube();
	
	gl.viewport(0, 0, canvas.width, canvas.height);
	gl.clearColor(1.0, 1.0, 1.0, 1.0);
	
	gl.enable(gl.DEPTH_TEST);
	
	// load shaders and initialize attribute buffer
	var program = initShaders(gl, "v-shader", "f-shader");
	gl.useProgram(program);
	
	var cBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
		
	var vColor = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vColor);
		
	var vBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
		
	var vPosition = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(vPosition);		

	zoomLoc = gl.getUniformLocation(program, "zoom");
	moveLoc = gl.getUniformLocation(program, "move");
	thetaLoc = gl.getUniformLocation(program, "theta");
	
	canvas.addEventListener("mousedown", function(event){
		var rect = canvas.getBoundingClientRect();
		var cx = event.clientX - rect.left;
		var cy = event.clientY - rect.top; 
		var t = 2 * cx / canvas.width - 1;
		var c = 2 * (canvas.height - cy) / canvas.height - 1;
		
		move.push([t, c]);
		index++;
	});
	
	render();
	
}

function makeCube() {
    var vertices = [
        vec4.fromValues(-0.1, -0.1, 0.1, 1.0),
        vec4.fromValues(-0.1, 0.1, 0.1, 1.0),
        vec4.fromValues(0.1, 0.1, 0.1, 1.0),
        vec4.fromValues(0.1, -0.1, 0.1, 1.0),
        vec4.fromValues(-0.1, -0.1, -0.1, 1.0),
        vec4.fromValues(-0.1, 0.1, -0.1, 1.0),
        vec4.fromValues(0.1, 0.1, -0.1, 1.0),
        vec4.fromValues(0.1, -0.1, -0.1, 1.0),
    ];

    var vertexColors = [
        vec4.fromValues(0.0, 0.0, 0.0, 1.0),
        vec4.fromValues(1.0, 0.0, 0.0, 1.0),
        vec4.fromValues(1.0, 1.0, 0.0, 1.0),
        vec4.fromValues(0.0, 1.0, 0.0, 1.0),
        vec4.fromValues(0.0, 0.0, 1.0, 1.0),
        vec4.fromValues(1.0, 0.0, 1.0, 1.0),
        vec4.fromValues(0.0, 1.0, 1.0, 1.0),
        vec4.fromValues(1.0, 1.0, 1.0, 1.0)
    ];

    var faces = [
        1, 0, 3, 1, 3, 2, //正
        2, 3, 7, 2, 7, 6, //右
        3, 0, 4, 3, 4, 7, //底
        6, 5, 1, 6, 1, 2, //顶
        4, 5, 6, 4, 6, 7, //背
        5, 4, 0, 5, 0, 1  //左
    ];

    for (var i = 0; i < faces.length; i++) {
        points.push(vertices[faces[i]][0], vertices[faces[i]][1], vertices[faces[i]][2]);
        colors.push(vertexColors[Math.floor(i / 6)][0], vertexColors[Math.floor(i / 6)][1], vertexColors[Math.floor(i / 6)][2], vertexColors[Math.floor(i / 6)][3]);
    }
}

function render(){
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	theta += 0.02;
	gl.uniform2fv(thetaLoc, [theta, theta]);
	gl.uniform2fv(zoomLoc, [0.0, 0.0]);
	for(var i=0;i<index;i++){
		gl.uniform2fv(moveLoc, move[i]);
		gl.drawArrays(gl.TRIANGLES, 0, 36);
	}
	
	requestAnimFrame(render);
}
