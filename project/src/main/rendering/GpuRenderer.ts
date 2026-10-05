import { Matrix4, Transform, Vec2, Vec3, Vec4 } from "../maths/index.js";
import { RasterVertex } from "../maths/RasterVertex.js";
import { Scene } from "../scene/Scene.js";
import { CanvasSize } from "../utils/types.js";
import { Projection } from "./Projection.js";
import { Renderer } from "./Renderer.js";
import { ScreenBuffer } from "./ScreenBuffer.js";

export class GpuRenderer implements Renderer {
    screenBuffer: ScreenBuffer

    ctx: WebGLRenderingContext;
    size: CanvasSize;
    projectionMatrix: Matrix4
    viewportMatrix: Matrix4

    constructor(){
        const canvas = document.getElementById("canvas") as HTMLCanvasElement;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.ctx = canvas.getContext("webgl") as WebGLRenderingContext;

        this.size = {
            width: canvas.width,
            height: canvas.height
        };

        this.screenBuffer = new ScreenBuffer(this.size.width, this.size.height, 128)
        this.projectionMatrix = Transform.getProjectionMatrix(this.size)
        this.viewportMatrix = Transform.getViewportMatrix(this.size)
    }

    public render(scene: Scene, fps: number | undefined = undefined){
        this.screenBuffer.resetBuffer();
        const camera = scene.activeCamera;
        const triangles: [Vec3, Vec3, Vec3][] = []

        const gameObjects = scene.gameObjects
        
        const cameraMatrix = Transform.getInverseWorldMatrix(camera.transform);
        const projectionMatrix = this.projectionMatrix;
        const viewportMatrix = this.viewportMatrix;
        
        gameObjects.forEach(gameObject => {
            if (!gameObject.mesh) return
            
            Projection.projectTriangles(gameObject.mesh.triangles, gameObject.transform, cameraMatrix, projectionMatrix, viewportMatrix).forEach(triangle => {

            })
        })  

        this.drawBuffer();
    }

    private async drawBuffer(): Promise<void> {
        console.log("Drawing buffer");
        // this.ctx.putImageData(this.screenBuffer.imageData, 0, 0)
    }
}