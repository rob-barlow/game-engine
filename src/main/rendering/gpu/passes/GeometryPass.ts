import { Scene } from "../../../scene/Scene";
import Pass from "./Pass";
import { GameObject } from "../../../scene/game-objects";
import { Panel } from "../../../scene/game-objects/Panel";
import Rabbit from "../../../scene/game-objects/Rabbit";
import { Letter } from "../../../scene/scenes/CvScene/game-objects/Letter";
import { TextObject } from "../../../scene/scenes/CvScene/game-objects/TextObject";
import { Transform } from "../../../maths/Transform";
import { Matrix4 } from "../../../maths";
import GpuInstancingProgram from "../programs/GpuInstancingProgram";
import RegularProgram from "../programs/RegularProgram";
import { CanvasSize } from "../../../utils/types";
import AssetManager from "../../../app/AssetManager";
import Texture from "../../../meshes/Textures/Textures";

const gpuInstancingBoundary = 9;

export default class GeometryPass implements Pass {
    size: CanvasSize;
    gl: WebGLRenderingContext;
    assetManager: AssetManager;
    
    gpuInstancingProgram: GpuInstancingProgram;
    regularProgram: RegularProgram;

    // wallTexture: WebGLTexture;
    // waterTexture: WebGLTexture;
    // plainTexture: WebGLTexture;

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

        // this.loadTextures();
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
    
        this.gl.activeTexture(this.gl.TEXTURE0);
        const texture = this.assetManager.getTexture(batch[0].texture)
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture)
        
            // this.gl.activeTexture(this.gl.TEXTURE1);
            // this.gl.bindTexture(this.gl.TEXTURE_2D, this.wallTexture)

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
            meshVertices.length / 3,   // num vertices per instance
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
            this.gl.uniform3fv(this.regularProgram.colourUniformLocation, gameObj.mesh!.colour.map(v => v/255));
            this.gl.uniformMatrix4fv(this.regularProgram.worldMatrixUniformLocation, false, Matrix4.toGlslArray(worldMatrix))
            
            for (const triangle of gameObj.mesh!.triangles){
                for (const vertex of triangle){
                    vertices.push(vertex.x, vertex.y, vertex.z)
                }
            }
            
            this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.DYNAMIC_DRAW)
            this.gl.drawArrays(this.gl.TRIANGLES, 0, vertices.length/3)
            vertices.length = 0;
        }
    }
}