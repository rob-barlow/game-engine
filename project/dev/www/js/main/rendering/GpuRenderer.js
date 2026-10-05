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
        const canvas = document.getElementById("gpu-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.ctx = canvas.getContext("webgl");
        this.ctx.clearColor(0.5, 0.5, 0.5, 1.0);
        const vertexShader = createShader(this.ctx, this.ctx.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(this.ctx, this.ctx.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(this.ctx, vertexShader, fragmentShader);
        this.ctx.useProgram(program);
        const buffer = this.ctx.createBuffer();
        this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, buffer);
        const positionAttributeLocation = this.ctx.getAttribLocation(program, "aVertexPosition");
        this.ctx.enableVertexAttribArray(positionAttributeLocation);
        this.ctx.vertexAttribPointer(positionAttributeLocation, 3, this.ctx.FLOAT, false, 0, 0);
        this.size = {
            width: canvas.width,
            height: canvas.height
        };
        this.screenBuffer = new ScreenBuffer(this.size.width, this.size.height, 128);
        this.projectionMatrix = Transform.getProjectionMatrix(this.size);
        this.viewportMatrix = Transform.getViewportMatrix(this.size);
    }
    render(scene, fps = undefined) {
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT);
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
                const currentTriangle = [
                    { x: triangle[0].clipPosition.x, y: triangle[0].clipPosition.y, z: triangle[0].viewZ },
                    { x: triangle[1].clipPosition.x, y: triangle[1].clipPosition.y, z: triangle[1].viewZ },
                    { x: triangle[2].clipPosition.x, y: triangle[2].clipPosition.y, z: triangle[2].viewZ }
                ];
                triangles.push(currentTriangle);
            });
        });
        const vertices = new Float32Array([
            0.0, 1.0,
            -1.0, -1.0,
            1.0, -1.0,
        ]);
        this.ctx.bufferData(this.ctx.ARRAY_BUFFER, vertices, this.ctx.STATIC_DRAW);
        this.ctx.drawArrays(this.ctx.TRIANGLES, 0, 3);
    }
}
const vertexShaderSource = `
   attribute vec4 aVertexPosition;
   void main() {
       gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, 0.0, 1.0);
   }
`;
const fragmentShaderSource = `
   void main() {
       gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Red color
   }
`;
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Error linking program:", gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}
