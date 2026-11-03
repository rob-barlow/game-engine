import AssetManager from "../../app/AssetManager";
import { Scene } from "../../scene/Scene";
import { CanvasSize } from "../../utils/types";
import { Renderer } from "../Renderer";
import GeometryPass from "./passes/GeometryPass";
import DarknessProgram from "./programs/DarknessProgram";
import FrameBufferProgram from "./programs/FrameBufferProgram";

export class GpuRenderer implements Renderer {
    size: CanvasSize;
    assetManager: AssetManager;

    gl: WebGLRenderingContext;

    geometryPass: GeometryPass;
    
    
    renderBufferA: WebGLFramebuffer;
    frameBufferA: WebGLFramebuffer;
    frameBufferTextureA: WebGLTexture;

    renderBufferB: WebGLFramebuffer;
    frameBufferB: WebGLFramebuffer;
    frameBufferTextureB: WebGLTexture;

    frameBufferProgram: FrameBufferProgram;
    darknessProgram: DarknessProgram;


    constructor(assetManager: AssetManager){
        this.assetManager = assetManager;
        
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.size = {
            width: canvas.width,
            height: canvas.height
        };

        this.gl = canvas.getContext("webgl") as WebGLRenderingContext;
        
        this.geometryPass = new GeometryPass(this.gl, this.size, this.assetManager);
        
        const {
            frameBufferTexture: frameBufferTextureA,
            frameBuffer: frameBufferA,
            renderBuffer: renderBufferA,
        } = this.createFrameAndRenderBuffer();

        this.frameBufferTextureA = frameBufferTextureA;
        this.frameBufferA = frameBufferA;
        this.renderBufferA = renderBufferA;

        const {
            frameBufferTexture: frameBufferTextureB,
            frameBuffer: frameBufferB,
            renderBuffer: renderBufferB,
        } = this.createFrameAndRenderBuffer();

        this.frameBufferTextureB = frameBufferTextureB;
        this.frameBufferB = frameBufferB;
        this.renderBufferB = renderBufferB;

        this.frameBufferProgram = new FrameBufferProgram(this.gl, this.size);
        this.darknessProgram = new DarknessProgram(this.gl, this.size, this.frameBufferTextureA);

        // face culling
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.FRONT)

        // depth test
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        // viewport
        this.gl.viewport(0, 0, this.size.width, this.size.height);

        this.gl.clearColor(0, 0, 0, 1.0);

        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) != this.gl.FRAMEBUFFER_COMPLETE) {
            console.log("SHIT")
        }
    }

    public render(scene: Scene) {
        // SET UP
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBufferA);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST)
        
        // GEOMETRY PASS
        this.geometryPass.render(scene);

        this.gl.disable(this.gl.DEPTH_TEST)
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.frameBufferTextureA);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBufferB);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // DARKNESS PASS
        this.darknessPass();

        this.gl.bindTexture(this.gl.TEXTURE_2D, this.frameBufferTextureB);

        // STAR PASS

        // PRESENT PASS
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.present();
    }

    darknessPass(){
        this.gl.useProgram(this.darknessProgram.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.darknessProgram.positionBuffer);
        this.gl.enableVertexAttribArray(this.darknessProgram.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.darknessProgram.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.darknessProgram.textureCoordBuffer);
        this.gl.enableVertexAttribArray(this.darknessProgram.textureCoordAttributeLocation);
        this.gl.vertexAttribPointer(this.darknessProgram.textureCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    present(){
        this.gl.useProgram(this.frameBufferProgram.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.frameBufferProgram.positionBuffer);
        this.gl.enableVertexAttribArray(this.frameBufferProgram.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.frameBufferProgram.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.frameBufferProgram.textureCoordBuffer);
        this.gl.enableVertexAttribArray(this.frameBufferProgram.textureCoordAttributeLocation);
        this.gl.vertexAttribPointer(this.frameBufferProgram.textureCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);


        this.gl.drawArrays(this.gl.TRIANGLES, 0, 12);
    }

    resize(){
    }

    createFrameAndRenderBuffer(){
        const frameBufferTexture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, frameBufferTexture);

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGB, this.size.width, this.size.height, 0, this.gl.RGB, this.gl.UNSIGNED_BYTE, null)
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);

        const frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, frameBuffer);

        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            frameBufferTexture,
            0
        );

        const renderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.size.width, this.size.height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderBuffer);

        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

        return {frameBufferTexture, frameBuffer, renderBuffer};
    }
}



//     render(scene: Scene) {
//     // 1. Build draw list / culling
//     const visibleObjects = scene.getVisibleObjects();

//     // 2. Geometry pass
//     geometryPass.render(visibleObjects);

//     // 3. Lighting pass (optional)
//     lightingPass.render();

//     // 4. Post-processing passes (optional)
//     bloomPass.render();
//     fogPass.render();

//     // 5. UI pass
//     uiPass.render(scene.ui);

//     // 6. Present to screen
//     this.present();
// }
    