import Pass from "./Pass";
import { CanvasSize } from "../../../utils/types";
import AssetManager from "../../../app/AssetManager";
import FrameBufferProgram from "../programs/FrameBufferProgram";

export default class PresentPass implements Pass {
    size: CanvasSize;
    gl: WebGLRenderingContext;
    assetManager: AssetManager;
    
    program: FrameBufferProgram;

    constructor(gl: WebGLRenderingContext, size: CanvasSize, assetManager: AssetManager){
        this.gl = gl;
        this.size = size;
        this.assetManager = assetManager;

        this.program = new FrameBufferProgram(this.gl, this.size, assetManager);
    }

    public render() {
        this.gl.useProgram(this.program.program);
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null)

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.program.positionBuffer);
        this.gl.enableVertexAttribArray(this.program.positionAttributeLocation);
        this.gl.vertexAttribPointer(this.program.positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.program.textureCoordBuffer);
        this.gl.enableVertexAttribArray(this.program.textureCoordAttributeLocation);
        this.gl.vertexAttribPointer(this.program.textureCoordAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.program.texture);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, 12);
    }
}