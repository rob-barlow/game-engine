import { Matrix4, Transform } from "../../../maths";
import { CanvasSize } from "../../../utils/types";

class GpuInstancingProgram {
    positionBuffer: WebGLBuffer
    colourBuffer: WebGLBuffer
    worldMatrixBuffer: WebGLBuffer
    textureCoordBuffer: WebGLBuffer
    textureIndexBuffer: WebGLBuffer
    normalBuffer: WebGLBuffer

    projectionMatrix: Matrix4

    positionAttributeLocation: number;
    colourAttributeLocation: number;
    worldMatrixAttributeLocation: number;
    textureCoordAttributeLocation: number;
    textureIndexAttributeLocation: number;
    normalAttributeLocation: number;

    viewMatrixUniformLocation: WebGLUniformLocation;
    projectionMatrixUniformLocation: WebGLUniformLocation;
    lightColourUniformLocation: WebGLUniformLocation;
    lightPositionUniformLocation: WebGLUniformLocation;

    matrixData: Float32Array
    matrices: Float32Array[]

    regularProgram: WebGLProgram;
    program: WebGLProgram;

    gl: WebGL2RenderingContext;
    size: CanvasSize;
    
    constructor(gl : WebGL2RenderingContext, size: CanvasSize){
        this.gl = gl;
        this.size = size;

        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, gpuInstancingVertexShaderSource) as WebGLShader;
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource) as WebGLShader;
        this.program = createProgram(this.gl, vertexShader, fragmentShader) as WebGLProgram;

        this.gl.useProgram(this.program);

        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'aVertexPosition');
        this.colourAttributeLocation = this.gl.getAttribLocation(this.program, 'aVertexColour');
        this.worldMatrixAttributeLocation = this.gl.getAttribLocation(this.program, 'worldMatrix');
        this.textureCoordAttributeLocation = this.gl.getAttribLocation(this.program, 'aTextureCoord');
        this.textureIndexAttributeLocation = this.gl.getAttribLocation(this.program, 'aTextureIndex');
        this.normalAttributeLocation = this.gl.getAttribLocation(this.program, 'aNormal');

        this.viewMatrixUniformLocation = this.gl.getUniformLocation(this.program, "viewMatrix");
        this.projectionMatrixUniformLocation = this.gl.getUniformLocation(this.program, "projectionMatrix");
        this.lightColourUniformLocation = this.gl.getUniformLocation(this.program, "lightColour");
        this.lightPositionUniformLocation = this.gl.getUniformLocation(this.program, "lightPosition");

        this.setUniformMatrix(this.projectionMatrixUniformLocation, Transform.getProjectionMatrix(this.size))
        this.gl.uniform3f(this.lightColourUniformLocation, 1.0, 1.0, 1.0)
        this.gl.uniform3f(this.lightPositionUniformLocation, 0.0, 0.0, 0.0)
        
        // position buffer
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

        // setup matrices, one per instance
        this.createMatrixArray(100);
        
        this.worldMatrixBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldMatrixBuffer);
        
        // set all 4 attributes for matrix
        const bytesPerMatrix = 4 * 16;
        for (let i = 0; i < 4; ++i) {
            const loc = this.worldMatrixAttributeLocation + i;
            this.gl.enableVertexAttribArray(loc);
            // note the stride and offset
            const offset = i * 16;  // 4 floats per row, 4 bytes per float
            this.gl.vertexAttribPointer(
                loc,              // location
                4,                // size (num values to pull from buffer per iteration)
                this.gl.FLOAT,         // type of data in buffer
                false,            // normalize
                bytesPerMatrix,   // stride, num bytes to advance to get to next set of values
                offset,           // offset in buffer
            );
            // this line says this attribute only changes for each 1 instance
            this.gl.vertexAttribDivisor(loc, 1)
        }

        // just allocate the buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.matrixData.byteLength, this.gl.DYNAMIC_DRAW);

        this.normalBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        this.gl.enableVertexAttribArray(this.normalAttributeLocation);
        this.gl.vertexAttribPointer(this.normalAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.textureIndexBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureIndexBuffer);
        this.gl.enableVertexAttribArray(this.textureIndexAttributeLocation);
        this.gl.vertexAttribPointer(this.textureIndexAttributeLocation, 1, this.gl.FLOAT, false, 0, 0);

        // setup colors, one per instance
        this.colourBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.enableVertexAttribArray(this.colourAttributeLocation);
        this.gl.vertexAttribPointer(this.colourAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);

        const textureCoordinates = [
            0.0, 0.0,
            0.0, 1.0,
            1.0, 1.0,
            0.0, 0.0,
            1.0, 1.0,
            1.0, 0.0,
         ]

        this.textureCoordBuffer = this.gl.createBuffer();
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
        this.gl.enableVertexAttribArray(this.textureCoordAttributeLocation);
        this.gl.vertexAttribPointer(this.textureCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureCoordinates), this.gl.STATIC_DRAW);
    }

    setUniformMatrix(location: WebGLUniformLocation, matrix: Matrix4){
        this.gl.uniformMatrix4fv(location, false, Matrix4.toGlslArray(matrix))
    }

    createMatrixArray(numInstances: number){
        // make a typed array with one view per matrix
        this.matrixData = new Float32Array(numInstances * 16);

        this.matrices = [];
        for (let i = 0; i < numInstances; ++i) {
            const byteOffsetToMatrix = i * 16 * 4;
            const numFloatsForView = 16;
            this.matrices.push(new Float32Array(
                this.matrixData.buffer,
                byteOffsetToMatrix,
                numFloatsForView));
        }
    }
}

export default GpuInstancingProgram;

const gpuInstancingVertexShaderSource = `#version 300 es
    layout( location = 0 ) in vec4 aVertexPosition;
    layout( location = 1 ) in vec4 aVertexColour;
    layout( location = 2 ) in vec2 aTextureCoord;
    layout( location = 3 ) in float aTextureIndex;
    layout( location = 4 ) in vec3 aNormal;
    layout( location = 5 ) in mat4 worldMatrix;
    
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;
    uniform vec3 lightPosition;

    out lowp vec4 vColour;
    out highp vec3 vTextureCoord;
    out highp float vNormalDot;

    void main() {
        gl_Position = projectionMatrix * viewMatrix * worldMatrix * aVertexPosition;
        vColour = aVertexColour;
        vec3 lightDirection = lightPosition - vec3(worldMatrix * aVertexPosition);
        float lightDistance = length(lightDirection);
        float lightStrength = 2.0 / (lightDistance * lightDistance);
        vNormalDot = dot(normalize(lightDirection), aNormal)  * lightStrength;
        
        vTextureCoord = vec3(aTextureCoord, aTextureIndex);
    }
`;

const fragmentShaderSource = `#version 300 es
    precision highp float;
    precision lowp sampler2DArray;

    in lowp vec4 vColour;
    in highp vec3 vTextureCoord;
    in highp float vNormalDot;

    uniform vec3 lightColour;
    uniform highp sampler2DArray uTexture;

    out vec4 fragColor;
    void main() {
        float ambientStrength = 0.1;
        float actualStrength = vNormalDot > 0.0 ? mix(ambientStrength, 1.0, vNormalDot) : ambientStrength;

        vec4 ambient = vec4(actualStrength * lightColour, 1.0);
        vec4 colour = vColour * ambient;
        fragColor = mix(colour, texture(uTexture, vTextureCoord), 0.0);
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

// vec4 colour = vColour * ambient;
