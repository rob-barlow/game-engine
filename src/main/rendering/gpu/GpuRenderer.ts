import AssetManager from "../../app/AssetManager";
import { Scene } from "../../scene/Scene";
import { CanvasSize } from "../../utils/types";
import { Renderer } from "../Renderer";
import GeometryPass from "./passes/GeometryPass";
import PresentPass from "./passes/PresentPass";
import FrameBufferProgram from "./programs/FrameBufferProgram";

export class GpuRenderer implements Renderer {
    size: CanvasSize;
    assetManager: AssetManager;

    gl: WebGLRenderingContext;

    geometryPass: GeometryPass;
    presentPass: PresentPass;
    
    frameBuffer: WebGLFramebuffer;
    renderBuffer: WebGLFramebuffer;
    frameBufferTexture: WebGLTexture;

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
        this.presentPass = new PresentPass(this.gl, this.size, this.assetManager);

        this.frameBuffer = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.framebufferTexture2D(
            this.gl.FRAMEBUFFER,
            this.gl.COLOR_ATTACHMENT0,
            this.gl.TEXTURE_2D,
            this.presentPass.program.texture,
            0
        );

        this.renderBuffer = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.renderBuffer);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.size.width, this.size.height);
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);

        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.renderBuffer);
        
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
    
    public render(scene: Scene) {
        // SET UP
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBuffer);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST)
        
        // GEOMETRY PASS
        this.geometryPass.render(scene);

        // DARKNESS PASS

        // PRESENT PASS
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        this.gl.disable(this.gl.DEPTH_TEST)
        this.presentPass.render();
    }

    // present(){
    //     this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
    //     this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
    //     this.gl.disable(this.gl.DEPTH_TEST)

    //     this.gl.useProgram(this.program.program);
    //     this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)

    //     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.program.positionBuffer);
    //     this.gl.enableVertexAttribArray(this.program.positionAttributeLocation);
    //     this.gl.vertexAttribPointer(this.program.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    //     this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.program.textureCoordBuffer);
    //     this.gl.enableVertexAttribArray(this.program.textureCoordAttributeLocation);
    //     this.gl.vertexAttribPointer(this.program.textureCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    //     this.gl.activeTexture(this.gl.TEXTURE0);
    //     this.gl.bindTexture(this.gl.TEXTURE_2D, this.program.texture);

    //     this.gl.drawArrays(this.gl.LINES, 0, 12);
    // }

    resize(){
    }
}

