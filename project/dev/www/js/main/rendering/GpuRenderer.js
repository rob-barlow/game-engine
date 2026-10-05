import { Transform } from "../maths/index.js";
import { Projection } from "./Projection.js";
import { ScreenBuffer } from "./ScreenBuffer.js";
export class GpuRenderer {
    screenBuffer;
    ctx;
    size;
    projectionMatrix;
    viewportMatrix;
    constructor() {
        const canvas = document.getElementById("canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.ctx = canvas.getContext("webgl");
        this.size = {
            width: canvas.width,
            height: canvas.height
        };
        this.screenBuffer = new ScreenBuffer(this.size.width, this.size.height, 128);
        this.projectionMatrix = Transform.getProjectionMatrix(this.size);
        this.viewportMatrix = Transform.getViewportMatrix(this.size);
    }
    render(scene, fps = undefined) {
        this.screenBuffer.resetBuffer();
        const camera = scene.activeCamera;
        const triangles = [];
        const gameObjects = scene.gameObjects;
        const cameraMatrix = Transform.getInverseWorldMatrix(camera.transform);
        const projectionMatrix = this.projectionMatrix;
        const viewportMatrix = this.viewportMatrix;
        gameObjects.forEach(gameObject => {
            if (!gameObject.mesh)
                return;
            Projection.projectTriangles(gameObject.mesh.triangles, gameObject.transform, cameraMatrix, projectionMatrix, viewportMatrix).forEach(triangle => {
            });
        });
        this.drawBuffer();
    }
    async drawBuffer() {
        console.log("Drawing buffer");
        // this.ctx.putImageData(this.screenBuffer.imageData, 0, 0)
    }
}
