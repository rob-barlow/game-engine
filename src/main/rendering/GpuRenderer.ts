import { Matrix4, Transform, Vec2, Vec3, Vec4 } from "../maths/index";
import { GameObject } from "../scene/game-objects";
import { Panel } from "../scene/game-objects/Panel";
import Rabbit from "../scene/game-objects/Rabbit";
import { Scene } from "../scene/Scene";
import { Letter } from "../scene/scenes/CvScene/game-objects/Letter";
import { TextObject } from "../scene/scenes/CvScene/game-objects/TextObject";
import { farPlaneZ, nearPlaneZ } from "../utils/constants";
import { CanvasSize } from "../utils/types";
import GpuInstancingProgram from "./programs/GpuInstancingProgram";
import RegularProgram from "./programs/RegularProgram";
import { Renderer } from "./Renderer";

const gpuInstancingBoundary = 5;

export class GpuRenderer implements Renderer {
    gpuInstancingProgram: GpuInstancingProgram;
    regularProgram: RegularProgram;

    gl: WebGLRenderingContext;
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

        this.gpuInstancingProgram = new GpuInstancingProgram(this.gl, this.size);
        this.regularProgram = new RegularProgram(this.gl, this.size);
        
        this.gl.useProgram(this.gpuInstancingProgram.program)
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.positionBuffer);
        this.gl.vertexAttribPointer(this.gpuInstancingProgram.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

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
                this.instanceBatch(batch, viewMatrix);
            }
            else {
                this.renderBatch(batch, viewMatrix);
            }
        }
    }

    instanceBatch(batch: GameObject[], viewMatrix: Matrix4){
        this.gl.useProgram(this.gpuInstancingProgram.program);
        
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
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(colours.map(v => v/255)), this.gl.STATIC_DRAW);

        this.gpuInstancingProgram.ext.drawArraysInstancedANGLE(
            this.gl.TRIANGLES,
            0,             // offset
            meshVertices.length,   // num vertices per instance
            worldMatrices.length,  // num instances
        );
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
}

