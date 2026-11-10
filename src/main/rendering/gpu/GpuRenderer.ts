import AssetManager from "../../app/AssetManager";
import { Scene } from "../../scene/Scene";
import { CanvasSize } from "../../utils/types";
import { Renderer } from "../Renderer";
import GeometryPass from "./passes/GeometryPass";
import { PostProcessingOptions } from "./PostProcessingOptions";
import PostProcessProgram from "./programs/PostProcessProgram";

export class GpuRenderer implements Renderer {
    size: CanvasSize;
    assetManager: AssetManager;

    gl: WebGLRenderingContext;

    geometryPass: GeometryPass;

    currentFrameBufferA: Boolean = true;
    
    renderBufferA: WebGLFramebuffer;
    frameBufferA: WebGLFramebuffer;
    frameBufferTextureA: WebGLTexture;

    renderBufferB: WebGLFramebuffer;
    frameBufferB: WebGLFramebuffer;
    frameBufferTextureB: WebGLTexture;

    pixelationProgram: PostProcessProgram;
    grayscaleProgram: PostProcessProgram;
    kernelProgram: PostProcessProgram;
    frameBufferProgram: PostProcessProgram;

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
        console.log("version: "+ this.gl.getParameter(this.gl.SHADING_LANGUAGE_VERSION))
        
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

        this.pixelationProgram = new PostProcessProgram(this.gl, this.size, pixelationFragmentShaderSource);
        this.grayscaleProgram = new PostProcessProgram(this.gl, this.size, grayscaleFragmentShaderSource);
        this.kernelProgram = new PostProcessProgram(this.gl, this.size, kernelFragmentShaderSource);
        this.frameBufferProgram = new PostProcessProgram(this.gl, this.size, regularFragmentShaderSource);

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
        this.currentFrameBufferA = true;

        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
        this.gl.enable(this.gl.DEPTH_TEST)
        
        // GEOMETRY PASS
        this.geometryPass.render(scene);

        this.gl.disable(this.gl.DEPTH_TEST)
        this.gl.activeTexture(this.gl.TEXTURE0);

        this.swapFrameTextureBuffer();
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        // GRAYSCALE PASS
        if (scene.postProcessingOptions.includes(PostProcessingOptions.Grayscale)){
            this.runPostProcess(this.grayscaleProgram);
            this.swapFrameTextureBuffer();
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }

        // PIXELATION PASS
        if (scene.postProcessingOptions.includes(PostProcessingOptions.Pixelation)){
            this.runPostProcess(this.pixelationProgram);
            this.swapFrameTextureBuffer();
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }

        // KERNEL PASS
        if (scene.postProcessingOptions.includes(PostProcessingOptions.Kernel)){
            this.runPostProcess(this.pixelationProgram);
            this.swapFrameTextureBuffer();
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        }

        // PRESENT PASS
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.present();
    }

    runPostProcess(program){
        this.gl.useProgram(program.program);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, program.positionBuffer);
        this.gl.enableVertexAttribArray(program.positionAttributeLocation);
        this.gl.vertexAttribPointer(program.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, program.textureCoordBuffer);
        this.gl.enableVertexAttribArray(program.textureCoordAttributeLocation);
        this.gl.vertexAttribPointer(program.textureCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    swapFrameTextureBuffer(){
        if (this.currentFrameBufferA){
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.frameBufferTextureA);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBufferB);
        }
        else {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.frameBufferTextureB);
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.frameBufferA);
        }

        this.currentFrameBufferA = !this.currentFrameBufferA;
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

const regularFragmentShaderSource = `
    varying highp vec2 vTextureCoord;
    uniform sampler2D uScreenTexture;

    void main() {
        gl_FragColor = texture2D(uScreenTexture, vTextureCoord);
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

const grayscaleFragmentShaderSource = `
    precision mediump float;

    varying highp vec2 vTextureCoord;
    uniform sampler2D uScreenTexture;

    void main()
    {
        gl_FragColor = texture2D(uScreenTexture, vTextureCoord);
        float average = 0.2126 * gl_FragColor.r + 0.7152 * gl_FragColor.g + 0.0722 * gl_FragColor.b;
        gl_FragColor = vec4(average, average, average, 1.0);
    }   
`;

const fogFragmentShaderSource = ``;

const kernelFragmentShaderSource = `precision mediump float;

varying highp vec2 vTextureCoord;
uniform sampler2D uScreenTexture;

const float offset = 1.0 / 300.0;

void main()
{
    vec2 offsets[9];

    offsets[0] = vec2(-offset,  offset);
    offsets[1] = vec2( 0.0,     offset);
    offsets[2] = vec2( offset,  offset);
    offsets[3] = vec2(-offset,  0.0);
    offsets[4] = vec2( 0.0,     0.0);
    offsets[5] = vec2( offset,  0.0);
    offsets[6] = vec2(-offset, -offset);
    offsets[7] = vec2( 0.0,    -offset);
    offsets[8] = vec2( offset, -offset);

    float kernel[9];

    kernel[0] = -1.0;
    kernel[1] = -1.0;
    kernel[2] = -1.0;
    kernel[3] = -1.0;
    kernel[4] =  9.0;
    kernel[5] = -1.0;
    kernel[6] = -1.0;
    kernel[7] = -1.0;
    kernel[8] = -1.0;

    vec3 sampleTex[9];

    for (int i = 0; i < 9; i++)
    {
        sampleTex[i] = texture2D(
            uScreenTexture,
            vTextureCoord + offsets[i]
        ).rgb;
    }

    vec3 col = vec3(0.0);

    for (int i = 0; i < 9; i++)
    {
        col += sampleTex[i] * kernel[i];
    }

    gl_FragColor = vec4(col, 1.0);
}`;