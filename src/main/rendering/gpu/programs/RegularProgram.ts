import { Matrix4, Transform } from "../../../maths";
import { CanvasSize } from "../../../utils/types";

class RegularProgram {
    positionBuffer: WebGLBuffer
    positionAttributeLocation: number;
    
    colourUniformLocation: WebGLUniformLocation;
    worldMatrixUniformLocation: WebGLUniformLocation;
    viewMatrixUniformLocation: WebGLUniformLocation;
    projectionMatrixUniformLocation: WebGLUniformLocation;

    program: WebGLProgram;

    gl: WebGLRenderingContext;
    size: CanvasSize;
    
    constructor(gl : WebGLRenderingContext, size: CanvasSize){
        this.gl = gl;
        this.size = size;

        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, regularVertexShaderSource) as WebGLShader;
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource) as WebGLShader;
        this.program = createProgram(this.gl, vertexShader, fragmentShader) as WebGLProgram;

        this.gl.useProgram(this.program);

        this.colourUniformLocation = this.gl.getUniformLocation(this.program, "aVertexColour");
        this.worldMatrixUniformLocation = this.gl.getUniformLocation(this.program, 'worldMatrix');
        this.viewMatrixUniformLocation = this.gl.getUniformLocation(this.program, "viewMatrix");
        this.projectionMatrixUniformLocation = this.gl.getUniformLocation(this.program, "projectionMatrix");

        // set projection matrix
        this.gl.uniformMatrix4fv(this.projectionMatrixUniformLocation, false, Matrix4.toGlslArray(Transform.getProjectionMatrix(this.size)))
        
        // position buffer
        this.positionBuffer = this.gl.createBuffer();
        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'aVertexPosition');
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
    }
}

export default RegularProgram;

const regularVertexShaderSource = `
    attribute vec4 aVertexPosition;
    
    uniform vec3 aVertexColour;
    uniform mat4 worldMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;

    varying lowp vec4 vColour;

    void main() {
        gl_Position = projectionMatrix * viewMatrix * worldMatrix * aVertexPosition;
        vColour = vec4(aVertexColour, 1);
    }
`;

const fragmentShaderSource = `
    varying lowp vec4 vColour;
    void main() {
        gl_FragColor = vColour;
    }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
   const shader: WebGLShader = gl.createShader(type) as WebGLShader;
   gl.shaderSource(shader, source);
   gl.compileShader(shader);
   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
       console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
       gl.deleteShader(shader);
       return null;
   }
   return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
   const program = gl.createProgram();
   gl.attachShader(program, vertexShader);
   gl.attachShader(program, fragmentShader);
   gl.linkProgram(program);
   if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
       console.error("Error linking program:", gl.getProgramInfoLog(program));
       return null;
   }
   return program;
}
