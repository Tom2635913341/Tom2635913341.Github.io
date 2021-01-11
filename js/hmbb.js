var canvas;
var gl;

var ms = 180; 

var points = []; 
var colors = []; 
var vColor, vPosition;
var cBuffer, vBuffer; 
var numVertices = 36*9 + ms*3*2*3 + 12; 
var modelViewMatrix = mat4(); 
var modelViewMatrixLoc; 
var CubeTx = 0, CubeTy = 0, CubeTz = 0; 
var CubeRotateAngle = 0; 
var scalePercent = 0.5; 
var direct = vec4( 0.0, 0.0, 1.0, 1.0 ); 

var points2 = []; 
var colors2 = []; 
var vColor2, vPosition2;
var cBuffer2, vBuffer2; 
var numVertices2 = 36*9 + ms*3*2*3 + 12; 
var CubeTx2 = 0, CubeTy2 = 0, CubeTz2 = 0; 
var CubeRotateAngle2 = 0; 
var scalePercent2 = 0.5; 
var direct2 = vec4( 0.0, 0.0, 1.0, 1.0 ); 

var viewMatrixLoc; 
var viewMatrix; 
var viewIndex = 0; 

var body = vec3( 0.4, 0.45, 0.2 );
var cloth = vec3( 0.4, 0.05, 0.2 );
var pants = vec3( 0.4, 0.1, 0.2 );
var leg = vec3( 0.06, 0.25, 0.05 );
var shoe = vec3( 0.12, 0.05, 0.05 );

var chooseColors = [
    vec4(1.0, 0.96, 0.30, 1.0), // 黄色
    vec4(1.0, 1.0, 1.0, 1.0), // 白色
    vec4(0.51, 0.33, 0.24, 1.0), // 褐色
    vec4(0.0, 0.0, 0.0, 1.0), // 黑色
    vec4(0.96, 0.64, 0.66, 1.0) // 粉色
];

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas, null );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.91, 0.92, 0.93, 1.0 ); 

    setPoints(); 
    gl.enable(gl.DEPTH_TEST); 

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    viewMatrixLoc = gl.getUniformLocation(program, 'viewMatrix');
    viewMatrix = lookAt(vec3(0, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0));
    gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));

    cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );
    vColor = gl.getAttribLocation( program, "vColor" );
    gl.enableVertexAttribArray( vColor );

    cBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors2), gl.STATIC_DRAW );
    vColor2 = gl.getAttribLocation( program, "vColor" );
    gl.enableVertexAttribArray( vColor2 );

    vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );
    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    vBuffer2 = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer2 );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points2), gl.STATIC_DRAW );
    vPosition2 = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition2 );

    modelViewMatrixLoc = gl.getUniformLocation(program, 'modelViewMatrix');

    document.getElementById("adjustView").onclick = function() {
        if (viewIndex === 0) {
            viewIndex = 1;
            viewMatrix = lookAt(vec3(0.10, 0.15, 0.15), vec3(0, 0, 0), vec3(0, 1, 0));
            gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        } else if (viewIndex === 1) {
            viewIndex = 0;
            viewMatrix = lookAt(vec3(0, 0, 0), vec3(0, 0, 0), vec3(0, 1, 0));
            gl.uniformMatrix4fv(viewMatrixLoc, false, flatten(viewMatrix));
        }
    };

    document.getElementById("cubeForward").onclick = function() {
        CubeTx += 0.1 * direct[0];
        CubeTy += 0.1 * direct[1];
        CubeTz += 0.1 * direct[2];
    };
    document.getElementById("cubeBack").onclick = function() {
        CubeTx -= 0.1 * direct[0];
        CubeTy -= 0.1 * direct[1];
        CubeTz -= 0.1 * direct[2];
    };
    document.getElementById("cubeR1").onclick = function() {
        CubeRotateAngle -= 5;
    };
    document.getElementById("cubeR2").onclick = function() {
        CubeRotateAngle += 5;
    };
    document.getElementById("small").onclick = function() {
        scalePercent -= 0.05;
    };
    document.getElementById("big").onclick = function() {
        scalePercent += 0.05;
    };

    document.getElementById("cubeForward2").onclick = function() {
        CubeTx2 += 0.1 * direct2[0];
        CubeTy2 += 0.1 * direct2[1];
        CubeTz2 += 0.1 * direct2[2];
    };
    document.getElementById("cubeBack2").onclick = function() {
        CubeTx2 -= 0.1 * direct2[0];
        CubeTy2 -= 0.1 * direct2[1];
        CubeTz2 -= 0.1 * direct2[2];
    };
    document.getElementById("cubeR12").onclick = function() {
        CubeRotateAngle2 -= 5;
    };
    document.getElementById("cubeR22").onclick = function() {
        CubeRotateAngle2 += 5;
    };
    document.getElementById("small2").onclick = function() {
        scalePercent2 -= 0.05;
    };
    document.getElementById("big2").onclick = function() {
        scalePercent2 += 0.05;
    };

    render();
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var init = translate(-0.3, 0, 0); 
    var S = scalem(scalePercent, scalePercent, scalePercent);
    var T = translate(CubeTx, CubeTy, CubeTz);
    var R = rotateY(CubeRotateAngle);

    modelViewMatrix = mult(mult(mult(init, T), R), S);
    var m = mult(mult(T, R), S); 

    direct = vec4( 0.0, 0.0, 1.0, 1.0 ); 
    direct = multMat4Vec4(m, direct);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, numVertices);

    init = translate(0.3, 0, 0); 
    S = scalem(scalePercent2, scalePercent2, scalePercent2);
    T = translate(CubeTx2, CubeTy2, CubeTz2);
    R = rotateY(CubeRotateAngle2);

    modelViewMatrix = mult(mult(mult(init, T), R), S);
    m = mult(mult(T, R), S);

    direct2 = vec4( 0.0, 0.0, 1.0, 1.0 ); 
    direct2 = multMat4Vec4(m, direct2);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    // 粉色海绵宝宝颜色
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer2);
    gl.vertexAttribPointer(vColor2, 4, gl.FLOAT, false, 0, 0);
    // 海绵宝宝顶点
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer2);
    gl.vertexAttribPointer(vPosition2, 4, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLES, 0, numVertices2);

    requestAnimFrame(render);
}

function multMat4Vec4(mat4, vector) {
    var newVec = [];
    for (var i = 0; i < 4; i++) {
        newVec.push(mat4[i][0] * vector[0] +
            mat4[i][1] * vector[1] +
            mat4[i][2] * vector[2] +
            mat4[i][3] * vector[3]);
    }
    return newVec;
}

function setPoints() {
    // 画海绵宝宝
    drawMouse(points, colors, 0);

    drawBody(0, 1, 2, 3, 0, points, colors); 
    drawBody(0, 3, 7, 4, 0, points, colors); 
    drawBody(4, 5, 6, 7, 0, points, colors); 
    drawBody(1, 5, 6, 2, 0, points, colors); 
    drawBody(0, 4, 5, 1, 0, points, colors); 
    drawBody(3, 7, 6, 2, 0, points, colors); 

    drawCloth(0, 1, 2, 3, 1, points, colors); 
    drawCloth(0, 3, 7, 4, 1, points, colors); 
    drawCloth(4, 5, 6, 7, 1, points, colors); 
    drawCloth(1, 5, 6, 2, 1, points, colors); 
    drawCloth(0, 4, 5, 1, 1, points, colors); 
    drawCloth(3, 7, 6, 2, 1, points, colors); 
    
    drawPants(0, 1, 2, 3, 2, points, colors); 
    drawPants(0, 3, 7, 4, 2, points, colors); 
    drawPants(4, 5, 6, 7, 2, points, colors); 
    drawPants(1, 5, 6, 2, 2, points, colors); 
    drawPants(0, 4, 5, 1, 2, points, colors); 
    drawPants(3, 7, 6, 2, 2, points, colors); 
    
    drawLeftLeg(0, 1, 2, 3, 1, points, colors); 
    drawLeftLeg(0, 3, 7, 4, 1, points, colors); 
    drawLeftLeg(4, 5, 6, 7, 1, points, colors); 
    drawLeftLeg(1, 5, 6, 2, 1, points, colors); 
    drawLeftLeg(0, 4, 5, 1, 1, points, colors); 
    drawLeftLeg(3, 7, 6, 2, 1, points, colors); 

    drawRightLeg(0, 1, 2, 3, 1, points, colors); 
    drawRightLeg(0, 3, 7, 4, 1, points, colors); 
    drawRightLeg(4, 5, 6, 7, 1, points, colors); 
    drawRightLeg(1, 5, 6, 2, 1, points, colors); 
    drawRightLeg(0, 4, 5, 1, 1, points, colors); 
    drawRightLeg(3, 7, 6, 2, 1, points, colors); 

    drawLeftArm(0, 1, 2, 3, 0, points, colors); 
    drawLeftArm(0, 3, 7, 4, 0, points, colors); 
    drawLeftArm(4, 5, 6, 7, 0, points, colors); 
    drawLeftArm(1, 5, 6, 2, 0, points, colors); 
    drawLeftArm(0, 4, 5, 1, 0, points, colors); 
    drawLeftArm(3, 7, 6, 2, 0, points, colors); 

    drawRightArm(0, 1, 2, 3, 0, points, colors); 
    drawRightArm(0, 3, 7, 4, 0, points, colors); 
    drawRightArm(4, 5, 6, 7, 0, points, colors); 
    drawRightArm(1, 5, 6, 2, 0, points, colors); 
    drawRightArm(0, 4, 5, 1, 0, points, colors); 
    drawRightArm(3, 7, 6, 2, 0, points, colors); 

    drawLeftEye(points, colors);
    drawRightEye(points, colors);

    // 画粉色海绵宝宝
    drawMouse(points2, colors2, 4);

    drawBody(0, 1, 2, 3, 4, points2, colors2); 
    drawBody(0, 3, 7, 4, 4, points2, colors2); 
    drawBody(4, 5, 6, 7, 4, points2, colors2); 
    drawBody(1, 5, 6, 2, 4, points2, colors2); 
    drawBody(0, 4, 5, 1, 4, points2, colors2); 
    drawBody(3, 7, 6, 2, 4, points2, colors2); 

    drawCloth(0, 1, 2, 3, 1, points2, colors2); 
    drawCloth(0, 3, 7, 4, 1, points2, colors2); 
    drawCloth(4, 5, 6, 7, 1, points2, colors2); 
    drawCloth(1, 5, 6, 2, 1, points2, colors2); 
    drawCloth(0, 4, 5, 1, 1, points2, colors2); 
    drawCloth(3, 7, 6, 2, 1, points2, colors2); 
    
    drawPants(0, 1, 2, 3, 2, points2, colors2); 
    drawPants(0, 3, 7, 4, 2, points2, colors2); 
    drawPants(4, 5, 6, 7, 2, points2, colors2); 
    drawPants(1, 5, 6, 2, 2, points2, colors2); 
    drawPants(0, 4, 5, 1, 2, points2, colors2); 
    drawPants(3, 7, 6, 2, 2, points2, colors2); 
    
    drawLeftLeg(0, 1, 2, 3, 1, points2, colors2); 
    drawLeftLeg(0, 3, 7, 4, 1, points2, colors2); 
    drawLeftLeg(4, 5, 6, 7, 1, points2, colors2); 
    drawLeftLeg(1, 5, 6, 2, 1, points2, colors2); 
    drawLeftLeg(0, 4, 5, 1, 1, points2, colors2); 
    drawLeftLeg(3, 7, 6, 2, 1, points2, colors2); 

    drawRightLeg(0, 1, 2, 3, 1, points2, colors2); 
    drawRightLeg(0, 3, 7, 4, 1, points2, colors2); 
    drawRightLeg(4, 5, 6, 7, 1, points2, colors2); 
    drawRightLeg(1, 5, 6, 2, 1, points2, colors2); 
    drawRightLeg(0, 4, 5, 1, 1, points2, colors2); 
    drawRightLeg(3, 7, 6, 2, 1, points2, colors2); 

    drawLeftArm(0, 1, 2, 3, 4, points2, colors2); 
    drawLeftArm(0, 3, 7, 4, 4, points2, colors2); 
    drawLeftArm(4, 5, 6, 7, 4, points2, colors2); 
    drawLeftArm(1, 5, 6, 2, 4, points2, colors2); 
    drawLeftArm(0, 4, 5, 1, 4, points2, colors2); 
    drawLeftArm(3, 7, 6, 2, 4, points2, colors2); 

    drawRightArm(0, 1, 2, 3, 4, points2, colors2); 
    drawRightArm(0, 3, 7, 4, 4, points2, colors2); 
    drawRightArm(4, 5, 6, 7, 4, points2, colors2); 
    drawRightArm(1, 5, 6, 2, 4, points2, colors2); 
    drawRightArm(0, 4, 5, 1, 4, points2, colors2); 
    drawRightArm(3, 7, 6, 2, 4, points2, colors2); 

    drawLeftEye(points2, colors2);
    drawRightEye(points2, colors2);

}

function drawBody(a, b, c, d, colorIndex, points, colors) {
    var bodyVertices = [
        vec4(-body[0]/2, body[1]*2/3, body[2]/2, 1.0),
        vec4(body[0]/2, body[1]*2/3, body[2]/2, 1.0),
        vec4(body[0]/2, -body[1]/3, body[2]/2, 1.0),
        vec4(-body[0]/2, -body[1]/3, body[2]/2, 1.0),
        vec4(-body[0]/2, body[1]*2/3, -body[2]/2, 1.0),
        vec4(body[0]/2, body[1]*2/3, -body[2]/2, 1.0),
        vec4(body[0]/2, -body[1]/3, -body[2]/2, 1.0),
        vec4(-body[0]/2, -body[1]/3, -body[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; 
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(bodyVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

function drawCloth(a, b, c, d, colorIndex, points, colors) {
    var clothVertices = [
        vec4(-cloth[0]/2, -body[1]/3, cloth[2]/2, 1.0),
        vec4(cloth[0]/2, -body[1]/3, cloth[2]/2, 1.0),
        vec4(cloth[0]/2, -body[1]/3 - cloth[1], cloth[2]/2, 1.0),
        vec4(-cloth[0]/2, -body[1]/3 - cloth[1], cloth[2]/2, 1.0),
        vec4(-cloth[0]/2, -body[1]/3, -cloth[2]/2, 1.0),
        vec4(cloth[0]/2, -body[1]/3, -cloth[2]/2, 1.0),
        vec4(cloth[0]/2, -body[1]/3 - cloth[1], -cloth[2]/2, 1.0),
        vec4(-cloth[0]/2, -body[1]/3 - cloth[1], -cloth[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; 
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(clothVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

function drawPants(a, b, c, d, colorIndex, points, colors) {
    var clothVertices = [
        vec4(-pants[0]/2, -body[1]/3 - cloth[1], pants[2]/2, 1.0),
        vec4(pants[0]/2, -body[1]/3 - cloth[1], pants[2]/2, 1.0),
        vec4(pants[0]/2, -body[1]/3 - cloth[1] - pants[1], pants[2]/2, 1.0),
        vec4(-pants[0]/2, -body[1]/3 - cloth[1] - pants[1], pants[2]/2, 1.0),
        vec4(-pants[0]/2, -body[1]/3 - cloth[1], -pants[2]/2, 1.0),
        vec4(pants[0]/2, -body[1]/3 - cloth[1], -pants[2]/2, 1.0),
        vec4(pants[0]/2, -body[1]/3 - cloth[1] - pants[1], -pants[2]/2, 1.0),
        vec4(-pants[0]/2, -body[1]/3 - cloth[1] - pants[1], -pants[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; 
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(clothVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

function drawLeftLeg(a, b, c, d, colorIndex, points, colors) {
    var leftLegVertices = [
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1], leg[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1], leg[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], leg[2]/2, 1.0),
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], leg[2]/2, 1.0),
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1], -leg[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1], -leg[2]/2, 1.0),
        vec4(-pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -leg[2]/2, 1.0),
        vec4(-pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -leg[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; 
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(leftLegVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

function drawRightLeg(a, b, c, d, colorIndex, points, colors) {
    var rightLegVertices = [
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1], leg[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1], leg[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], leg[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], leg[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1], -leg[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1], -leg[2]/2, 1.0),
        vec4(pants[0]/4 + leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -leg[2]/2, 1.0),
        vec4(pants[0]/4 - leg[0]/2, -body[1]/3 - cloth[1] - pants[1] - leg[1], -leg[2]/2, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ];
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(rightLegVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]);
    }
}

function drawLeftArm(a, b, c, d, colorIndex, points, colors) {
    var leftArmVertices = [
        vec4(-0.2, 0.0, 0.025, 1.0),
        vec4(-0.2, 0.0, -0.025, 1.0),
        vec4(-0.2, -0.05, -0.025, 1.0),
        vec4(-0.2, 0.05, 0.025, 1.0),
        vec4(-0.3, -0.3, 0.025, 1.0),
        vec4(-0.3, -0.3, -0.025, 1.0),
        vec4(-0.25, -0.3, -0.025, 1.0),
        vec4(-0.25, -0.3, 0.025, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; 
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(leftArmVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]); 
    }
}

function drawRightArm(a, b, c, d, colorIndex, points, colors) {
    var leftArmVertices = [
        vec4(0.2, 0.0, 0.025, 1.0),
        vec4(0.2, 0.0, -0.025, 1.0),
        vec4(0.2, -0.05, -0.025, 1.0),
        vec4(0.2, 0.05, 0.025, 1.0),
        vec4(0.3, -0.3, 0.025, 1.0),
        vec4(0.3, -0.3, -0.025, 1.0),
        vec4(0.25, -0.3, -0.025, 1.0),
        vec4(0.25, -0.3, 0.025, 1.0)
    ];
    var indices = [ a, b, c, a, c, d ]; 
    for ( var i = 0; i < indices.length; i++ ) {
        points.push(leftArmVertices[indices[i]]);
        colors.push(chooseColors[colorIndex]); 
    }
}

function drawLeftEye(points, colors) {

    leftEyeVertices = getCircleVertex(-0.06, 0.15, 0.104, 0.02, ms, 360, 0);
    for (var i = 0; i < leftEyeVertices.length; i++) {
        points.push(leftEyeVertices[i]);
        colors.push(chooseColors[3]);
    }
}

function drawRightEye(points, colors) {
    var rightEyeVertices = getCircleVertex(0.06, 0.15, 0.104, 0.02, ms, 360, 0);
    for (var i = 0; i < rightEyeVertices.length; i++) {
        points.push(rightEyeVertices[i]);
        colors.push(chooseColors[3]); 
    }
}

function drawMouse(points, colors, colorIndex) {
    var mouseVertices = getCircleVertex(0.0, 0.24, 0.1019, 0.21, ms, 80, 140);
    for (var i = 0; i < mouseVertices.length; i++) {
        points.push(mouseVertices[i]);
        colors.push(chooseColors[3]); 
    }
    mouseVertices = getCircleVertex(0.0, 0.24, 0.102, 0.205, ms, 80, 140);
    for (var i = 0; i < mouseVertices.length; i++) {
        points.push(mouseVertices[i]);
        colors.push(chooseColors[colorIndex]); 
    }
}

function getCircleVertex(x, y, z, r, m, c, offset) {
    var arr = [];
    var addAng = c / m;
    var angle = 0;
    for (var i = 0; i < m; i++) {
        arr.push(vec4(x + Math.sin(Math.PI / 180 * (angle+offset)) * r, y + Math.cos(Math.PI / 180 * (angle+offset)) * r, z, 1.0));
        arr.push(vec4(x, y, z, 1.0));
        angle = angle + addAng;
        arr.push(vec4(x + Math.sin(Math.PI / 180 * (angle+offset)) * r, y + Math.cos(Math.PI / 180 * (angle+offset)) * r, z, 1.0));
    }
    return arr;
}

