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
    gl: WebGL2RenderingContext;
    assetManager: AssetManager;
    
    gpuInstancingProgram: GpuInstancingProgram;
    regularProgram: RegularProgram;

    textureArray: WebGLTexture;

    constructor(gl: WebGL2RenderingContext, size: CanvasSize, assetManager: AssetManager){
        this.gl = gl;
        this.size = size;
        this.assetManager = assetManager;

        this.gpuInstancingProgram = new GpuInstancingProgram(this.gl, this.size);
        this.regularProgram = new RegularProgram(this.gl, this.size);
        
        this.gl.useProgram(this.gpuInstancingProgram.program)
        
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.positionBuffer);
        this.gl.vertexAttribPointer(this.gpuInstancingProgram.positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        
        // this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
        
        this.createTextureArray();
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
        this.gl.vertexAttribDivisor(this.gpuInstancingProgram.colourAttributeLocation, 1);
        this.gl.vertexAttribDivisor(this.gpuInstancingProgram.textureIndexAttributeLocation, 1);

        this.gl.useProgram(this.gpuInstancingProgram.program);
    
        this.gl.bindTexture(this.gl.TEXTURE_2D_ARRAY, this.textureArray)
        
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
        const textureIndices: number[] = [];

        for (let batchIndex = 0; batchIndex < batch.length; batchIndex++){
            const currentGameObject = batch[batchIndex];

            const worldMatrix = Transform.getWorldMatrix(currentGameObject.transform);
            worldMatrices.push(worldMatrix);
            colours.push(...currentGameObject.mesh.colour, 255);
            textureIndices.push(currentGameObject.texture)
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

        // set texture indices
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gpuInstancingProgram.textureIndexBuffer);
        this.gl.vertexAttribPointer(this.gpuInstancingProgram.textureIndexAttributeLocation, 1, this.gl.FLOAT, false, 0, 0);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(textureIndices), this.gl.STATIC_DRAW);

        this.gl.drawArraysInstanced(
            this.gl.TRIANGLES,
            0,             // offset
            meshVertices.length / 3,   // num vertices per instance
            worldMatrices.length,  // num instances
        );

        this.gl.vertexAttribDivisor(this.gpuInstancingProgram.colourAttributeLocation, 0);
        this.gl.vertexAttribDivisor(this.gpuInstancingProgram.textureIndexAttributeLocation, 0);
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

    createTextureArray(){
        this.textureArray = this.gl.createTexture();

        this.gl.bindTexture( this.gl.TEXTURE_2D_ARRAY , this.textureArray);
        this.gl.texParameteri( this.gl.TEXTURE_2D_ARRAY , this.gl.TEXTURE_MIN_FILTER , this.gl.LINEAR);
        this.gl.texParameteri( this.gl.TEXTURE_2D_ARRAY , this.gl.TEXTURE_MAG_FILTER , this.gl.LINEAR);
        this.gl.texParameteri( this.gl.TEXTURE_2D_ARRAY , this.gl.TEXTURE_WRAP_S , this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri( this.gl.TEXTURE_2D_ARRAY , this.gl.TEXTURE_WRAP_T , this.gl.CLAMP_TO_EDGE);

        const waterImage = this.assetManager.imageMap.get("./water.webp")
        const panelImage = this.assetManager.imageMap.get("./ceiling-tiles.webp")
        const caveWallImage = this.assetManager.imageMap.get("./cave-wall.webp")
        const brickWallImage = this.assetManager.imageMap.get("./brick-wall.webp")
        
        const numOfTextures = 5;

        // allocate storage
        this.gl.texStorage3D( this.gl.TEXTURE_2D_ARRAY , 1 , this.gl.RGBA8 , waterImage.width , waterImage.height , numOfTextures);

        // tell webgl how wide the image is so it can correctly get sub areas of the image
        this.gl.pixelStorei( this.gl.UNPACK_ROW_LENGTH , waterImage.width );

        const waterIndex = Texture.Water
        const waterBuffer = this.getImageData(waterImage)
        this.gl.texSubImage3D( this.gl.TEXTURE_2D_ARRAY , 0 , 0 , 0 , waterIndex, 
                    waterImage.width , waterImage.height , 1 , this.gl.RGBA , this.gl.UNSIGNED_BYTE , 
                    waterBuffer , 0); 

        const panelIndex = Texture.Ceiling
        const panelBuffer = this.getImageData(panelImage)
        this.gl.texSubImage3D( this.gl.TEXTURE_2D_ARRAY , 0 , 0 , 0 , panelIndex, 
                    panelImage.width , waterImage.height , 1 , this.gl.RGBA , this.gl.UNSIGNED_BYTE , 
                    panelBuffer , 0); 

        const caveWallIndex = Texture.CaveWall
        const caveWallBuffer = this.getImageData(caveWallImage)
        this.gl.texSubImage3D( this.gl.TEXTURE_2D_ARRAY , 0 , 0 , 0 , caveWallIndex, 
                    caveWallImage.width , caveWallImage.height , 1 , this.gl.RGBA , this.gl.UNSIGNED_BYTE , 
                    caveWallBuffer , 0); 
                
        const brickWallIndex = Texture.Brick
        const brickWallBuffer = this.getImageData(brickWallImage)
        this.gl.texSubImage3D( this.gl.TEXTURE_2D_ARRAY , 0 , 0 , 0 , brickWallIndex, 
                    brickWallImage.width , waterImage.height , 1 , this.gl.RGBA , this.gl.UNSIGNED_BYTE , 
                    brickWallBuffer , 0); 

        const plainIndex = Texture.Plain
        let canvas = new OffscreenCanvas( waterImage.width , waterImage.height );
        let ctx = canvas.getContext( "2d" );
        ctx.fillStyle = "grey"
        ctx.fillRect(0 , 0 , canvas.width , canvas.height)
        let plainBuffer = ctx.getImageData( 0 , 0 , canvas.width , canvas.height ).data;
        this.gl.texSubImage3D( this.gl.TEXTURE_2D_ARRAY , 0 , 0 , 0 , plainIndex, 
                    brickWallImage.width , waterImage.height , 1 , this.gl.RGBA , this.gl.UNSIGNED_BYTE , 
                    plainBuffer , 0); 

        // reset unpack row length to its default value
        this.gl.pixelStorei( this.gl.UNPACK_ROW_LENGTH , 0 );
    }

    getImageData(image: HTMLImageElement){
        let canvas = new OffscreenCanvas( image.width , image.height );
        let ctx = canvas.getContext( "2d" );

        ctx.drawImage( image , 0 , 0 );

        let imageData = ctx.getImageData( 0 , 0 , canvas.width , canvas.height ).data;
        
        return new Uint8Array( imageData );
    }
}