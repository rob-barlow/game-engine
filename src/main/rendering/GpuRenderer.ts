import { Matrix4, Transform, Vec2, Vec3, Vec4 } from "../maths/index";
import Drone from "../scene/game-objects/Drone";
import { Panel } from "../scene/game-objects/Panel";
import Player from "../scene/game-objects/Player";
import { Scene } from "../scene/Scene";
import { TextObject } from "../scene/scenes/CvScene/game-objects/TextObject";
import { farPlaneZ, nearPlaneZ } from "../utils/constants";
import { CanvasSize } from "../utils/types";
import { Projection } from "./Projection";
import { Renderer } from "./Renderer";

export class GpuRenderer implements Renderer {
    positionBuffer: WebGLBuffer
    colourBuffer: WebGLBuffer
    worldMatrixBuffer: WebGLBuffer


    projectionMatrix: Matrix4

    positionAttributeLocation: number;
    colourAttributeLocation: number;
    worldMatrixAttributeLocation: number;

    viewMatrixUniformLocation: WebGLUniformLocation;
    projectionMatrixUniformLocation: WebGLUniformLocation;

    matrixData: Float32Array
    matrices: Float32Array[]

    gl: WebGLRenderingContext;
    ext: ANGLE_instanced_arrays;
    size: CanvasSize;

    constructor(){
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.size = {
            width: canvas.width,
            height: canvas.height
        };

        this.gl = canvas.getContext("webgl") as WebGLRenderingContext;

        this.ext = this.gl.getExtension('ANGLE_instanced_arrays');
        if (!this.ext) {
            console.log("Cannot use GPU instancing")
            alert('need ANGLE_instanced_arrays');
        }

                
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource) as WebGLShader;
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource) as WebGLShader;
        const program = createProgram(this.gl, vertexShader, fragmentShader) as WebGLProgram;
        this.gl.useProgram(program);

        this.positionAttributeLocation = this.gl.getAttribLocation(program, 'aVertexPosition');
        this.colourAttributeLocation = this.gl.getAttribLocation(program, 'aVertexColour');
        this.worldMatrixAttributeLocation = this.gl.getAttribLocation(program, 'worldMatrix');

        this.viewMatrixUniformLocation = this.gl.getUniformLocation(program, "viewMatrix");
        this.projectionMatrixUniformLocation = this.gl.getUniformLocation(program, "projectionMatrix");

        this.setUniformMatrix(this.projectionMatrixUniformLocation, Transform.getProjectionMatrix(this.size))
        
        // position buffer
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);

        this.gl.enableVertexAttribArray(this.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
   
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
            0,0,0,
            0,0,1,
            1,0,1,
            0,0,0,
            1,0,1,
            1,0,0,
        ]), this.gl.STATIC_DRAW);

        const numVertices = 6;

        // setup matrices, one per instance
        const numInstances = 100;
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
        this.ext.vertexAttribDivisorANGLE(loc, 1);
        }

        // just allocate the buffer
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.matrixData.byteLength, this.gl.DYNAMIC_DRAW);

        // setup colors, one per instance
        this.colourBuffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.enableVertexAttribArray(this.colourAttributeLocation);
        this.gl.vertexAttribPointer(this.colourAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);
        this.ext.vertexAttribDivisorANGLE(this.colourAttributeLocation, 1);

       

       
        // face culling
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.FRONT)

        // depth test
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        // viewport
        this.gl.viewport(0, 0, this.size.width, this.size.height)
        this.gl.depthRange(nearPlaneZ, farPlaneZ)
        
        this.gl.clearColor(0, 0, 0, 1.0);
    }
    
    public render(scene: Scene) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        const gameObjects = scene.gameObjects

        const camera = scene.activeCamera;
        this.setUniformMatrix(this.viewMatrixUniformLocation, Transform.getInverseWorldMatrix(camera.transform));

        const worldMatrices: Matrix4[] = [];
        const colours: number[] = [];

        for (let gameObjectIndex = 0; gameObjectIndex < gameObjects.length; gameObjectIndex++){
            const currentGameObject = gameObjects[gameObjectIndex];

            if (!currentGameObject.mesh) continue;

            if (currentGameObject instanceof Panel){
                const worldMatrix = Transform.getWorldMatrix(currentGameObject.transform);
                worldMatrices.push(worldMatrix);
                colours.push(...currentGameObject.mesh.colour, 1);
            }
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldMatrixBuffer)

        const numInstances = worldMatrices.length;
        this.matrixData = new Float32Array(numInstances * 16);

        // this.matrices = [];
        // for (let i = 0; i < numInstances; ++i) {
        //     const byteOffsetToMatrix = i * 16 * 4;
        //     const numFloatsForView = 16;
        //     this.matrices.push(new Float32Array(
        //         this.matrixData.buffer,
        //         byteOffsetToMatrix,
        //         numFloatsForView));
        // }
        
        this.matrices.forEach((mat, ndx) => {
            const glslMatrix = Matrix4.toGlslArray(worldMatrices[ndx]);
            for (let i = 0; i < 16; i++){
                mat[i] = glslMatrix[i];
            }
        });
        
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.matrixData.byteLength, this.gl.DYNAMIC_DRAW);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.matrixData);
        
        // set colours
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours), this.gl.STATIC_DRAW);

        this.ext.drawArraysInstancedANGLE(
            this.gl.TRIANGLES,
            0,             // offset
            6,   // num vertices per instance
            worldMatrices.length,  // num instances
        );
    }

    // public render(scene: Scene){
    //      // webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    //     this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
    //     const camera = scene.activeCamera;

    //     // sort by type for gpu instancing
    //     const gameObjects = scene.gameObjects.sort((a) => {
    //         if (a instanceof Panel){
    //             return 1;
    //         }
    //         if (a instanceof Player){
    //             return 2;
    //         }
    //         if (a instanceof Drone){
    //             return 3;
    //         }
    //         if (a instanceof TextObject){
    //             return 4;
    //         }
    //         if (a instanceof Drone){
    //             return 5;
    //         }
            
    //         return 6;
    //     });
        
        
    //     // it might be faster to calculate viewProjMatrix and use as a single uniform
    //     // const viewProjectionMatrix = Matrix4.multiply(this.projectionMatrix, viewMatrix)
        
    //     const viewMatrix = Transform.getInverseWorldMatrix(camera.transform);
    //     this.gl.uniformMatrix4fv(this.viewMatrixLocation, false, Matrix4.toGlslArray(viewMatrix))


    //     // const verticesData: Float32Array = new Float32Array([
    //     //         0,0,0,
    //     //         0,0,1,
    //     //         1,0,1,
    //     //         0,0,0,
    //     //         1,0,1,
    //     //         1,0,0
    //     //     ])


        

    //     ///

    //     let currentVerticesData: Float32Array
    //     let coloursData: Float32Array
    //     let worldMatricesData: Float32Array

    //     const colours: number[] = []
    //     const worldMatrices: number[] = []

    //     let numInstances = 0

    //     gameObjects.forEach((gameObject, gameObjectIndex) => {
    //         if (!gameObject.mesh) return;
            
    //         numInstances++;

    //         let colour = gameObject.mesh?.colour.map(c => c / 255);
    //         colour = colour ? colour : [0, 0, 0];
            
    //         for (let i = 0; i < 3 * gameObject.mesh.triangles.length; i++) {
    //             colours[4 * i] = colour[0];
    //             colours[(4 * i) + 1] = colour[1];
    //             colours[(4 * i) + 2] = colour[2];
    //             colours[(4 * i) + 3] = 1.0;
    //         }

    //         const worldMatrix = Transform.getWorldMatrix(gameObject.transform)
    //         worldMatrices.push(...Matrix4.toGlslArray(worldMatrix));

    //         // draw all of a certain game object
    //         if (typeof(gameObject) != typeof(gameObjects[gameObjectIndex + 1])){
    //             // set mesh
    //             currentVerticesData = this.trianglesToArray(gameObject.mesh.triangles)
    //             coloursData = new Float32Array(colours);
    //             worldMatricesData = new Float32Array(worldMatrices);

    //             // set vertices
    //             this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    //             this.gl.bufferData(this.gl.ARRAY_BUFFER, currentVerticesData, this.gl.STATIC_DRAW);

    //             // set matrix array
    //             this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.worldMatrixBuffer);
    //             this.gl.bufferData(this.gl.ARRAY_BUFFER, worldMatricesData, this.gl.DYNAMIC_DRAW);

    //             // set colours
    //             this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
    //             this.gl.bufferData(this.gl.ARRAY_BUFFER, coloursData, this.gl.STATIC_DRAW);

    //             // draw
    //             // this.gl.drawArrays(this.gl.TRIANGLES, 0,  / 3);
    //             const numVertices = currentVerticesData.length / 3;
    //             this.ext.drawArraysInstancedANGLE(
    //                 this.gl.TRIANGLES,
    //                 0,             // offset
    //                 numVertices,   // num vertices per instance
    //                 numInstances,  // num instances
    //                 );
                
    //             // reset
    //             colours.length = 0;
    //             worldMatrices.length = 0;
    //             numInstances = 0;
    //         }
    //     })  
    // }

    setUniformMatrix(location: WebGLUniformLocation, matrix: Matrix4){
        this.gl.uniformMatrix4fv(location, false, Matrix4.toGlslArray(matrix))
    }
}

const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColour;
    
    attribute mat4 worldMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 projectionMatrix;

    varying lowp vec4 vColour;

    void main() {
        gl_Position = projectionMatrix * viewMatrix * worldMatrix * aVertexPosition;
        vColour = aVertexColour;
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
