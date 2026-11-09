import { CanvasSize } from "../../../utils/types";

class DarknessProgram {
    positionBuffer: WebGLBuffer
    textureCoordBuffer: WebGLBuffer

    positionAttributeLocation: number;
    textureCoordAttributeLocation: number;

    screenTextureUniformLocation: WebGLUniformLocation;
    
    program: WebGLProgram;

    gl: WebGLRenderingContext;
    size: CanvasSize;
    
    constructor(gl : WebGLRenderingContext, size: CanvasSize, frameBufferTexture: WebGLTexture){
        this.gl = gl;
        this.size = size;
        this.gl.activeTexture(this.gl.TEXTURE0);

        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, regularVertexShaderSource) as WebGLShader;
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource) as WebGLShader;
        this.program = createProgram(this.gl, vertexShader, fragmentShader) as WebGLProgram;

        this.gl.useProgram(this.program);

        // position buffer
        this.positionBuffer = this.gl.createBuffer();
        this.textureCoordBuffer = this.gl.createBuffer();


        this.positionAttributeLocation = this.gl.getAttribLocation(this.program, 'aVertexPosition');
        this.textureCoordAttributeLocation = this.gl.getAttribLocation(this.program, "aTextureCoord");

        const screenVertices = [
            -1,-1,
            -1,1,
            1,1,
            -1,-1,
            1,1,
            1,-1
        ]

         const texVertices = [
            0,0,
            0,1,
            1,1,
            0,0,
            1,1,
            1,0
        ]
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(screenVertices), this.gl.STATIC_DRAW)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.textureCoordBuffer);
        this.gl.enableVertexAttribArray(this.textureCoordAttributeLocation);
        this.gl.vertexAttribPointer(this.textureCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(texVertices), this.gl.STATIC_DRAW);

        this.gl.bindTexture(this.gl.TEXTURE_2D, frameBufferTexture);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.size.width, this.size.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null)
        
        this.screenTextureUniformLocation = this.gl.getUniformLocation(this.program, "uScreenTexture");
        this.gl.uniform1i(this.screenTextureUniformLocation, 0)

        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
    }
}

export default DarknessProgram;

const regularVertexShaderSource = `
    attribute vec2 aVertexPosition;
    attribute vec2 aTextureCoord;

    varying highp vec2 vTextureCoord;

    void main() {
        gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, 0.0, 1.0);
        vTextureCoord = aTextureCoord;
    }
`;

const pixelationFragmentShaderSource = `
    precision mediump float;

    varying highp vec2 vTextureCoord;
    uniform sampler2D uScreenTexture;

    void main() {
        vec2 pixelSize = vec2(2.0, 2.0); // Size of the pixelation effect
        vec2 resolution = vec2(800.0, 600.0); // Resolution of the screen

        vec2 normalizedPixelSize = pixelSize / resolution;
        vec2 uvPixel = normalizedPixelSize * floor(vTextureCoord / normalizedPixelSize);

        gl_FragColor = texture2D(uScreenTexture, uvPixel);
    }
`;

const fogFragmentShaderSource = `
    precision mediump float;

    varying highp vec2 vTextureCoord;
    uniform sampler2D uScreenTexture;

    void main() {
        vec2 pixelSize = vec2(2.0, 2.0); // Size of the pixelation effect
        vec2 resolution = vec2(800.0, 600.0); // Resolution of the screen

        vec2 normalizedPixelSize = pixelSize / resolution;
        vec2 uvPixel = normalizedPixelSize * floor(vTextureCoord / normalizedPixelSize);

        gl_FragColor = gl_FragCoord;
    }
`;

const regularFragmentShaderSource = `
    varying highp vec2 vTextureCoord;
    uniform sampler2D uScreenTexture;

    void main() {
        gl_FragColor = texture2D(uScreenTexture, vTextureCoord);
    }
`;

// const fragmentShaderSource = regularFragmentShaderSource;
const fragmentShaderSource = pixelationFragmentShaderSource;
// const fragmentShaderSource = fogFragmentShaderSource;


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
