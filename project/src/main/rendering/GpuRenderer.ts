import { Matrix4, Transform, Vec2, Vec3, Vec4 } from "../maths/index.js";
import { RasterVertex } from "../maths/RasterVertex.js";
import { Scene } from "../scene/Scene.js";
import { CanvasSize } from "../utils/types.js";
import { Projection } from "./Projection.js";
import { Renderer } from "./Renderer.js";

export class GpuRenderer implements Renderer {
    positionBuffer: WebGLBuffer
    colourBuffer: WebGLBuffer

    gl: WebGLRenderingContext;
    size: CanvasSize;
    projectionMatrix: Matrix4
    viewportMatrix: Matrix4
    

    constructor(){
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        this.gl = canvas.getContext("webgl") as WebGLRenderingContext;
        this.gl.clearColor(0.5, 0.5, 0.5, 1.0);
                
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource) as WebGLShader;
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource) as WebGLShader;
        const program = createProgram(this.gl, vertexShader, fragmentShader) as WebGLProgram;
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

        this.projectionMatrix = Transform.getProjectionMatrix(this.size)
        this.viewportMatrix = Transform.getViewportMatrix(this.size)
    }

    public render(scene: Scene, fps: number | undefined = undefined){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        const camera = scene.activeCamera;
        const triangles: [Vec3, Vec3, Vec3][] = []
        const colours: number[] = []

        const gameObjects = scene.gameObjects
        
        const cameraMatrix = Transform.getInverseWorldMatrix(camera.transform);
        const projectionMatrix = this.projectionMatrix;
        const viewportMatrix = this.viewportMatrix;
        
        gameObjects.forEach(gameObject => {
            if (!gameObject.mesh) return
            
            Projection.projectTriangles(gameObject.mesh.triangles, gameObject.transform, cameraMatrix, projectionMatrix, viewportMatrix).forEach(triangle => {
                const currentTriangle: [Vec3, Vec3, Vec3] = [
                    {x: triangle[0].clipPosition.x, y: triangle[0].clipPosition.y, z: triangle[0].viewZ/100},
                    {x: triangle[1].clipPosition.x, y: triangle[1].clipPosition.y, z: triangle[1].viewZ/100},
                    {x: triangle[2].clipPosition.x, y: triangle[2].clipPosition.y, z: triangle[2].viewZ/100}
                ]

                triangles.push(currentTriangle);
                let colour = gameObject.mesh?.colour.map(c => c / 255);
                colour = colour ? colour : [0, 0, 0];
                
                for (let i = 0; i < 3; i++) {
                    colours.push(colour[0]);
                    colours.push(colour[1]);
                    colours.push(colour[2]);
                    colours.push(1.0);
                }
            })
        })  

        const verticesData = this.trianglesToArray(triangles);
        const coloursData = new Float32Array(colours);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verticesData, this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, coloursData, this.gl.STATIC_DRAW);

        this.gl.drawArrays(this.gl.TRIANGLES, 0, verticesData.length / 3);
    }

    private trianglesToArray(triangles: [Vec3, Vec3, Vec3][]): Float32Array {
        const vertices = new Float32Array(triangles.length * 3 * 3); 
        for (let i = 0; i < triangles.length; i++){
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

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
   const shader: WebGLShader = gl.createShader(type) as WebGLShader;
   gl.shaderSource(shader, source);
   gl.compileShader(shader);
   if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
       console.error("Error compiling shader:", gl.getShaderInfoLog(shader));
       gl.deleteShader(shader);
       return null;
   }
   return shader;
}

function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
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
