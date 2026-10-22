import { Matrix4, Transform, Vec2, Vec3, Vec4 } from "../maths/index";
import { Scene } from "../scene/Scene";
import { CanvasSize } from "../utils/types";
import { Projection } from "./Projection";
import { Renderer } from "./Renderer";

export class GpuRenderer implements Renderer {
    positionBuffer: WebGLBuffer
    colourBuffer: WebGLBuffer

    worldMatrixLocation: WebGLUniformLocation
    cameraMatrixLocation: WebGLUniformLocation

    gl: WebGLRenderingContext;
    size: CanvasSize;

    constructor(){
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.size = {
            width: canvas.width,
            height: canvas.height
        };

        this.gl = canvas.getContext("webgl") as WebGLRenderingContext;
        this.gl.clearColor(0, 0, 0, 1.0);
                
        const vertexShader = createShader(this.gl, this.gl.VERTEX_SHADER, vertexShaderSource) as WebGLShader;
        const fragmentShader = createShader(this.gl, this.gl.FRAGMENT_SHADER, fragmentShaderSource) as WebGLShader;
        const program = createProgram(this.gl, vertexShader, fragmentShader) as WebGLProgram;
        this.gl.useProgram(program);

        this.positionBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        
        const positionAttributeLocation = this.gl.getAttribLocation(program, "aVertexPosition");
        this.gl.enableVertexAttribArray(positionAttributeLocation);
        this.gl.vertexAttribPointer(positionAttributeLocation, 3, this.gl.FLOAT, false, 0, 0);

        this.worldMatrixLocation = this.gl.getUniformLocation(program, "worldMatrix");
        this.cameraMatrixLocation = this.gl.getUniformLocation(program, "cameraMatrix");

        // set uniform matrices
        this.setUniformMatrix(this.gl.getUniformLocation(program, "projectionMatrix"), Transform.getProjectionMatrix(this.size));
        this.setUniformMatrix(this.gl.getUniformLocation(program, "viewportMatrix"), Transform.getViewportMatrix(this.size));

        const uniform = this.gl.getUniform(program, this.gl.getUniformLocation(program, "projectionMatrix"))

        console.log("uniform: " + uniform)
        console.log(Transform.getProjectionMatrix(this.size))

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);
        
        this.colourBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);

        const colourAttributeLocation = this.gl.getAttribLocation(program, "aVertexColour");
        this.gl.enableVertexAttribArray(colourAttributeLocation);
        this.gl.vertexAttribPointer(colourAttributeLocation, 4, this.gl.FLOAT, false, 0, 0);
    }

    public render(scene: Scene){
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        
        const camera = scene.activeCamera;
        const triangles: [Vec3, Vec3, Vec3][] = []
        const colours: number[] = []

        const gameObjects = scene.gameObjects;
        
        const cameraMatrix = Transform.getInverseWorldMatrix(camera.transform);

        this.setUniformMatrix(this.cameraMatrixLocation, cameraMatrix);
        
        gameObjects.forEach(gameObject => {
            if (!gameObject.mesh) return;

            const worldMatrix: Matrix4 = Transform.getWorldMatrix(gameObject.transform);
            
            this.setUniformMatrix(this.worldMatrixLocation, worldMatrix);

            triangles.push(...gameObject.mesh.triangles);
            let colour = gameObject.mesh?.colour.map(c => c / 255);
            colour = colour ? colour : [0, 0, 0];
            
            for (let i = 0; i < 3 * gameObject.mesh.triangles.length; i++) {
                colours.push(colour[0]);
                colours.push(colour[1]);
                colours.push(colour[2]);
                colours.push(1.0);
            }
        })  

        triangles.push([
            {x: -1, y: -1, z: 0},
            {x: 1, y: -1, z: 0},
            {x: 0, y: 1, z: 0},
        ])

        for (let i = 0; i < 3; i++) {
            colours.push(1);
            colours.push(0);
            colours.push(0);
            colours.push(1.0);
        }

        const verticesData = this.trianglesToArray(triangles);
        const coloursData = new Float32Array(colours);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, verticesData, this.gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colourBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, coloursData, this.gl.STATIC_DRAW);

        // this.gl.POINTS
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

    setUniformMatrix(location: WebGLUniformLocation, matrix: Matrix4){
        this.gl.uniformMatrix4fv(location, false, [
            matrix[0][0],matrix[1][0],matrix[2][0],matrix[3][0],
            matrix[0][1],matrix[1][1],matrix[2][1],matrix[3][1],
            matrix[0][2],matrix[1][2],matrix[2][2],matrix[3][2],
            matrix[0][3],matrix[1][3],matrix[2][3],matrix[3][3],
        ])
    }
}

const vertexShaderSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColour;

    uniform mat4 worldMatrix;
    uniform mat4 cameraMatrix;
    uniform mat4 projectionMatrix;
    uniform mat4 viewportMatrix;

    varying lowp vec4 vColour;

   void main() {
        mat4 viewMatrix = cameraMatrix * worldMatrix;
        vec4 viewPoint = viewMatrix * aVertexPosition;
        vec4 ndcPoint = projectionMatrix * viewPoint;
        vec4 scaledPoint = ndcPoint * (1.0 / ndcPoint.w);

        gl_Position = vec4(scaledPoint.x, scaledPoint.y, 0.0, 1.0);
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

// clipTriangle(triangle: [RasterVertex, RasterVertex, RasterVertex]): [RasterVertex, RasterVertex, RasterVertex][]{
//         const returnTriangles: [RasterVertex, RasterVertex, RasterVertex][] = []

//         const bufferA : RasterVertex[] = []
//         const bufferB : RasterVertex[] = [...triangle]
//         let currentBuffer = 0

//         const planes: Axis[] = ['X', 'Y', 'Z']

        
//         for (let planeIndex = 0; planeIndex < 3; planeIndex++){
//             const plane = planes[planeIndex]
       
//             const getAxis = plane == 'X'
//                 ? (rasterVertex: RasterVertex) => rasterVertex.clipPosition.x 
//                 : plane == 'Y' 
//                     ? (rasterVertex: RasterVertex) => rasterVertex.clipPosition.y 
//                     : (rasterVertex: RasterVertex) => rasterVertex.clipPosition.z 

//             for (let wMultiplier = -1; wMultiplier < 2; wMultiplier += 2){
//                 const currentBufferIsA = currentBuffer % 2 == 0
//                 const polygonVertices = currentBufferIsA ? bufferA : bufferB
//                 const lastVertices = currentBufferIsA ? bufferB : bufferA

//                 for (let lastVerticesIndex = 0; lastVerticesIndex < lastVertices.length; lastVerticesIndex++){
//                     const v1 = lastVertices[lastVerticesIndex]
//                     const v2 = lastVertices[(lastVerticesIndex + 1) % lastVertices.length]

//                     const v1AxisCoord = getAxis(v1)
//                     const v2AxisCoord = getAxis(v2)
            
//                     const v1Inside = wMultiplier == 1 ? v1AxisCoord < v1.clipPosition.w :  v1AxisCoord > -v1.clipPosition.w
//                     const v2Inside = wMultiplier == 1 ? v2AxisCoord < v2.clipPosition.w :  v2AxisCoord > -v2.clipPosition.w

//                     // maintain the order
//                     if (v1Inside && v2Inside){
//                         polygonVertices.push(v1)
//                         continue
//                     }
//                     else if (!v1Inside && !v2Inside){
//                         // could loop until find the next vertex inside and start there
//                         continue
//                     }
//                     else {
//                         let t = ((wMultiplier * v2.clipPosition.w) - v2AxisCoord)/(v1AxisCoord + (wMultiplier * v2.clipPosition.w) - v2AxisCoord - (wMultiplier * v1.clipPosition.w))
//                         const newPoint = Lerp.lerpRasterVertex(v1, v2, t)
                        
//                         if (v1Inside){
//                             polygonVertices.push(v1)
//                             polygonVertices.push(newPoint)
//                             continue
//                         }
//                         else {
//                             polygonVertices.push(newPoint)
//                             continue
//                         }
//                     }
//                 }

//                 lastVertices.length = 0
//                 currentBuffer++
//             }
//         }

//         const currentBufferIsA = currentBuffer % 2 == 0
//         const lastVertices = currentBufferIsA ? bufferB : bufferA

//         if (lastVertices.length < 3){
//             return []
//         }

//         // triangulate the polygon
//         for (let i = 0; i < lastVertices.length - 2; i++){
//             const newTriangle = [
//                 lastVertices[0],
//                 lastVertices[(i + 1) % lastVertices.length],
//                 lastVertices[(i + 2) % lastVertices.length]] as [RasterVertex, RasterVertex, RasterVertex]

//             returnTriangles.push(newTriangle)
//         }

//         return returnTriangles;
//     },