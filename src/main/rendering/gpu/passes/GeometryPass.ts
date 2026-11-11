import { Scene } from "../../../scene/Scene";
import Pass from "./Pass";
import { GameObject } from "../../../scene/game-objects";
import { Panel } from "../../../scene/game-objects/Panel";
import Rabbit from "../../../scene/game-objects/Rabbit";
import { Letter } from "../../../scene/scenes/CvScene/game-objects/Letter";
import { TextObject } from "../../../scene/scenes/CvScene/game-objects/TextObject";
import { Transform } from "../../../maths/Transform";
import { Matrix3, Matrix4 } from "../../../maths";
import GpuInstancingProgram from "../programs/GpuInstancingProgram";
import RegularProgram from "../programs/RegularProgram";
import { CanvasSize } from "../../../utils/types";
import AssetManager from "../../../app/AssetManager";
import { Boid } from "../../../scene/scenes/BoidsScene/game-objects/Boid";

const gpuInstancingBoundary = 5;

export default class GeometryPass implements Pass {
    size: CanvasSize;
    gl: WebGLRenderingContext;
    assetManager: AssetManager;
    
    gpuInstancingProgram: GpuInstancingProgram;
    regularProgram: RegularProgram;

    wallTexture: WebGLTexture;
    waterTexture: WebGLTexture;
    plainTexture: WebGLTexture;

    textures: Map<string, WebGLTexture>

    constructor(gl: WebGLRenderingContext, size: CanvasSize, assetManager: AssetManager){
        this.gl = gl;
        this.size = size;
        this.assetManager = assetManager;

        this.gpuInstancingProgram = new GpuInstancingProgram(this.gl, this.size);
        this.regularProgram = new RegularProgram(this.gl, this.size);
        
        this.gl.useProgram(this.gpuInstancingProgram.program)
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.positionBuffer);
        this.gl.vertexAttribPointer(this.gpuInstancingProgram.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        this.gpuInstancingProgram.ext.vertexAttribDivisorANGLE(this.gpuInstancingProgram.colourAttributeLocation, 0);

        this.loadTextures();
    }

    public render(scene: Scene) {
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    
            const gameObjects = scene.gameObjects
    
            const camera = scene.activeCamera;
            const viewMatrix = Transform.getInverseWorldMatrix(camera.transform)
    
            const batches = new Map<string, GameObject[]>()
    
            for (const gameObj of gameObjects){
                if (!gameObj.mesh) continue;
    
                let key: string = "";
    
                if (gameObj instanceof Panel) key = "panel"
                if (gameObj instanceof Rabbit) key = "rabbit"
                if (gameObj instanceof Letter) key = "letter"
                if (gameObj instanceof TextObject) key = "text"
    
                let batch = batches.get(key);
    
                if (!batch) {
                    batch = [];
                    batches.set(key, batch);
                }
    
                batch.push(gameObj); 
            }
    
            for (const batch of batches.values()) {
                if (batch.length > gpuInstancingBoundary){
                    this.gl.activeTexture(this.gl.TEXTURE0);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.waterTexture);
                    
                    this.gl.activeTexture(this.gl.TEXTURE1);
                    this.gl.bindTexture(this.gl.TEXTURE_2D, this.wallTexture);
                    
                    this.gpuInstancingProgram.ext.vertexAttribDivisorANGLE(this.gpuInstancingProgram.colourAttributeLocation, 1);
                    this.instanceBatch(batch, viewMatrix);
                    this.gpuInstancingProgram.ext.vertexAttribDivisorANGLE(this.gpuInstancingProgram.colourAttributeLocation, 0);

                }
                else {
                    this.renderBatch(batch, viewMatrix);
                }
            }
    }
    
    instanceBatch(batch: GameObject[], viewMatrix: Matrix4){
        this.gpuInstancingProgram.ext.vertexAttribDivisorANGLE(this.gpuInstancingProgram.colourAttributeLocation, 1);

        this.gl.useProgram(this.gpuInstancingProgram.program);
        
        if (batch[0].texture){
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.waterTexture)
            
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.wallTexture)
        }
        else {
            this.gl.activeTexture(this.gl.TEXTURE0);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.plainTexture)
            
            this.gl.activeTexture(this.gl.TEXTURE1);
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.plainTexture)
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.positionBuffer);
        this.gl.vertexAttribPointer(this.gpuInstancingProgram.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

        const meshVertices: number[] = []

        batch[0].mesh.triangles.forEach((triangle) => {
            triangle.forEach(vertex => {
                meshVertices.push(vertex.x)
                meshVertices.push(vertex.y)
                meshVertices.push(vertex.z)
            })
        })

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(meshVertices), this.gl.STATIC_DRAW);

        this.gpuInstancingProgram.setUniformMatrix(this.gpuInstancingProgram.viewMatrixUniformLocation, viewMatrix);

        const worldMatrices: Matrix4[] = [];
        const colours: number[] = [];

        for (let batchIndex = 0; batchIndex < batch.length; batchIndex++){
            const currentGameObject = batch[batchIndex];

            const worldMatrix = Transform.getWorldMatrix(currentGameObject.transform);
            worldMatrices.push(worldMatrix);
            colours.push(...currentGameObject.mesh.colour, 255);
        }

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.worldMatrixBuffer)

        const numInstances = worldMatrices.length;
        
        if (this.gpuInstancingProgram.matrices.length < numInstances){
            this.gpuInstancingProgram.createMatrixArray(numInstances)
        }

        for (let i = 0; i < numInstances; i++){
            const glslMatrix = Matrix4.toGlslArray(worldMatrices[i]);
            for (let j = 0; j < 16; j++){
                this.gpuInstancingProgram.matrices[i][j] = glslMatrix[j];
            }
        };


        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.matrixData.byteLength, this.gl.DYNAMIC_DRAW);
        this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.gpuInstancingProgram.matrixData);
        
        // set colours
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.colourBuffer);
        this.gl.vertexAttribPointer(this.gpuInstancingProgram.colourAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours.map(v => v/255)), this.gl.STATIC_DRAW);

        
        this.gpuInstancingProgram.ext.drawArraysInstancedANGLE(
            this.gl.TRIANGLES,
            0,             // offset
            meshVertices.length,   // num vertices per instance
            worldMatrices.length,  // num instances
        );

        // if (batch[0] instanceof Boid){
        //     for (let i = 0; i < numInstances; i++){
        //         const currentBoid = batch[i]

        //         const mesh = [
        //             0.45,0,0.2,
        //             0.45,0,2,
        //             0.55,0,2,
        //             0.45,0,0.2,
        //             0.55,0,2,
        //             0.55,0,0.2,
        //         ]

        //         const triangles = [
        //             [
        //                 {x: 0.45, y: 0, z: 0.2},
        //                 {x: 0.45, y: 0, z: 2},
        //                 {x: 0.55, y: 0, z: 2},
        //             ],
        //             [
        //                 {x: 0.45, y: 0, z: 0.2},
        //                 {x: 0.55, y: 0, z: 2},
        //                 {x: 0.55, y: 0, z: 0.2},
        //             ]
        //             ]

        //         this.gl.useProgram(this.regularProgram.program);
        //         this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.regularProgram.positionBuffer);
        //         this.gl.vertexAttribPointer(this.regularProgram.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

        //         this.gl.uniformMatrix4fv(this.regularProgram.viewMatrixUniformLocation, false, Matrix4.toGlslArray(viewMatrix))
                        
        //         const vertices: number[] = []
                
        //             const worldMatrix = Transform.getWorldMatrix(currentBoid.transform)
        //             this.gl.uniform3fv(this.regularProgram.colourUniformLocation, [1,1,1]);
        //             this.gl.uniformMatrix4fv(this.regularProgram.worldMatrixUniformLocation, false, Matrix4.toGlslArray(worldMatrix))
                    
        //             for (const triangle of triangles){
        //                 for (const vertex of triangle){
        //                     const angle = (batch[i] as Boid).angle
        //                     const m: Matrix3 = [
        //                         [Math.cos(angle), 0, Math.sin(angle)],
        //                         [0, 1, 0],
        //                         [-Math.sin(angle), 0, Math.cos(angle)],
        //                     ]

        //                     const currentTriangle = Matrix3.apply(m, vertex)
        //                     vertices.push(currentTriangle.x, currentTriangle.y, currentTriangle.z)
        //                 }
        //             }

        //         // vertices.push(...mesh)

        //         this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW)

        //         this.gl.drawArrays(this.gl.TRIANGLES, 0, vertices.length)
        //     }
        // //     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.positionBuffer);
        // //     const arrowVertices = [0.5, 2, 0, 0.5, 2, 2.5]
        // //     this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arrowVertices), this.gl.STATIC_DRAW)

        // //     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.worldMatrixBuffer)

        // //     for (let i = 0; i < numInstances; i++){
        // //         const angle = (batch[i] as Boid).angle
        // //         const m: Matrix4 = [
        // //             [Math.cos(angle), 0, Math.sin(angle), 0],
        // //             [0, 1, 0, 0],
        // //             [-Math.sin(angle), 0, Math.cos(angle), 0],
        // //             [0, 0, 0, 1],
        // //     ]
        // //         const glslMatrix = Matrix4.toGlslArray(Matrix4.multiply(worldMatrices[i], m));
        // //         for (let j = 0; j < 16; j++){
        // //             this.gpuInstancingProgram.matrices[i][j] = glslMatrix[j];
        // //         }
        // //     };

        // //     this.gl.bufferData(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.matrixData.byteLength, this.gl.DYNAMIC_DRAW);
        // //     this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, this.gpuInstancingProgram.matrixData);

        // //     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.colourBuffer);
        // //     this.gl.vertexAttribPointer(this.gpuInstancingProgram.colourAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);
        // //     const arrowColours = new Array(numInstances * 4).fill(1)

        // //     this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(arrowColours), this.gl.STATIC_DRAW);

        // //     this.gl.lineWidth(20);
        // //     this.gpuInstancingProgram.ext.drawArraysInstancedANGLE(
        // //     this.gl.LINES,
        // //     0,             // offset
        // //     2,   // num vertices per instance
        // //     worldMatrices.length,  // num instances
        // // );
        // }
    }

    renderBatch(batch: GameObject[], viewMatrix: Matrix4){
        this.gl.useProgram(this.regularProgram.program);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.regularProgram.positionBuffer);
        this.gl.vertexAttribPointer(this.regularProgram.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.gl.uniformMatrix4fv(this.regularProgram.viewMatrixUniformLocation, false, Matrix4.toGlslArray(viewMatrix))
                
        const vertices: number[] = []
        
        for (const gameObj of batch){
            const worldMatrix = Transform.getWorldMatrix(gameObj.transform)
            this.gl.uniform3fv(this.regularProgram.colourUniformLocation, gameObj.mesh.colour.map(v => v/255));
            this.gl.uniformMatrix4fv(this.regularProgram.worldMatrixUniformLocation, false, Matrix4.toGlslArray(worldMatrix))
            
            for (const triangle of gameObj.mesh.triangles){
                for (const vertex of triangle){
                    vertices.push(vertex.x, vertex.y, vertex.z)
                }
            }
        }

        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW)

        this.gl.drawArrays(this.gl.TRIANGLES, 0, vertices.length)
    }
    
    loadTexture(url: string) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = this.gl.RGBA;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;
      
        const image =  this.assetManager.getImage(url);

        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );

        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        } 
        else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        }

        return texture;
    }

    loadTextures() {
        this.textures = new Map<string, WebGLTexture>();
        this.textures.set("uWaterTexture", 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        const waterImageUrl = "./water.jpg";
        this.waterTexture = this.loadTexture(waterImageUrl);

        this.gl.activeTexture(this.gl.TEXTURE1);
        const wallImageUrl = "./cave-wall.webp";
        this.wallTexture = this.loadTexture(wallImageUrl);

        this.gl.uniform1i(this.gl.getUniformLocation(this.gpuInstancingProgram.program, "uWaterTexture"), 0)
        this.gl.uniform1i(this.gl.getUniformLocation(this.gpuInstancingProgram.program, "uBrickTexture"), 1)

        
        // Plain texture stuff
        this.plainTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D,  this.plainTexture);

        const level = 0;
        const internalFormat = this.gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([255, 255, 255, 255]);
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel,
        );
    }

    isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }
}