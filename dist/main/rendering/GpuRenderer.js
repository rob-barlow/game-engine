import { Transform } from "../maths/index.js";
import { Projection } from "./Projection.js";
export class GpuRenderer {
    positionBuffer;
    colourBuffer;
    gl;
    size;
    projectionMatrix;
    viewportMatrix;
    constructor() {
        const canvas = document.getElementById("gpu-canvas");
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.gl = canvas.getContext("webgl");
        this.gl.clearColor(0.5, 0.5, 0.5, 1.0);
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource);
        const program = createProgram(this.gl, vertexShader, fragmentShader);
        this.gl.useProgram(program);
        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        const positionAttributeLocation = this.gl.getAttribLocation(program, "aVertexPosition");
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.colourBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        const colourAttributeLocation = this.gl.getAttribLocation(program, "aVertexColour");
        this.gl.enableVertexAttribArray(colourAttributeLocation);
        this.gl.vertexAttribPointer(colourAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        this.size = {
            width: canvas.width,
            height: canvas.height
        };
        this.projectionMatrix = Transform.getProjectionMatrix(this.size);
        this.viewportMatrix = Transform.getViewportMatrix(this.size);
    }
    render(scene, fps = undefined) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        const camera = scene.activeCamera;
        const triangles = [];
        const colours = [];
        const gameObjects = scene.gameObjects;
        const cameraMatrix = Transform.getInverseWorldMatrix(camera.transform);
        const projectionMatrix = this.projectionMatrix;
        const viewportMatrix = this.viewportMatrix;
        gameObjects.forEach(gameObject => {
            if (!gameObject.mesh)
                return;
            Projection.projectTriangles(gameObject.mesh.triangles, gameObject.transform, cameraMatrix, projectionMatrix, viewportMatrix).forEach(triangle => {
                const currentTriangle = [
                    { x: triangle[0].clipPosition.x, y: triangle[0].clipPosition.y, z: triangle[0].viewZ / 100 },
                    { x: triangle[1].clipPosition.x, y: triangle[1].clipPosition.y, z: triangle[1].viewZ / 100 },
                    { x: triangle[2].clipPosition.x, y: triangle[2].clipPosition.y, z: triangle[2].viewZ / 100 }
                ];
                triangles.push(currentTriangle);
                let colour = gameObject.mesh?.colour.map(c => c / 255);
                colour = colour ? colour : [0, 0, 0];
                for (let i = 0; i < 3; i++) {
                    colours.push(colour[0]);
                    colours.push(colour[1]);
                    colours.push(colour[2]);
                    colours.push(1.0);
                }
            });
        });
        const verticesData = this.trianglesToArray(triangles);
        const coloursData = new Float32Array(colours);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verticesData, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, coloursData, this.gl.STATIC_DRAW);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, verticesData.length / 3);
    }
    trianglesToArray(triangles) {
        const vertices = new Float32Array(triangles.length * 3 * 3);
        for (let i = 0; i < triangles.length; i++) {
            const currentTriangle = triangles[i];
            vertices[i * 9 + 0] = currentTriangle[0].x;
            vertices[i * 9 + 1] = currentTriangle[0].y;
            vertices[i * 9 + 2] = currentTriangle[0].z;
            vertices[i * 9 + 3] = currentTriangle[1].x;
            vertices[i * 9 + 4] = currentTriangle[1].y;
            vertices[i * 9 + 5] = currentTriangle[1].z;
            vertices[i * 9 + 6] = currentTriangle[2].x;
            vertices[i * 9 + 7] = currentTriangle[2].y;
            vertices[i * 9 + 8] = currentTriangle[2].z;
        }
        return vertices;
    }
}
const vertexShaderSource = `
   attribute vec4 aVertexPosition;
   attribute vec4 aVertexColour;

    varying lowp vec4 vColour;

   void main() {
       gl_Position = vec4(aVertexPosition.x, aVertexPosition.y, 0.0, 1.0);
       vColour = aVertexColour;
   }
`;
const fragmentShaderSource = `
    varying lowp vec4 vColour;
   void main() {
       gl_FragColor = vColour;
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
