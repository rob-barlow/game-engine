import { Matrix4, Transform } from "../maths/index.js";
import { Projection } from "./Projection.js";
import { ScreenBuffer } from "./ScreenBuffer.js";
export class CpuRenderer {
    screenBuffer;
    ctx;
    size;
    projectionMatrix;
    viewportMatrix;
    constructor() {
        const canvas = document.getElementById("cpu-canvas");
        // calculate and set height and width of canvas here
        // should be a multiple of 64
        // Math.floor(window.innerHeight / 64) * 64
        // Math.floor(window.innerWidth / 64) * 64
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.ctx = canvas.getContext("2d");
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
            // if (gameObject.colour[2] != 255){
            //     console.log("Hi")
            // }
            // triangles.push(...Projection.projectTriangles(gameObject.triangles, gameObject.transform, camera.transform, this.size))
            // Projection.projectTriangles(gameObject.triangles, gameObject.transform, cameraMatrix, projectionMatrix, viewportMatrix).forEach(triangle => {
            //     this.drawTriangle(triangle[0], triangle[1], triangle[2], gameObject.colour)
            // })
            Projection.projectTriangles(gameObject.mesh.triangles, gameObject.transform, cameraMatrix, projectionMatrix, viewportMatrix).forEach(triangle => {
                triangle = triangle.map(vertex => {
                    return { clipPosition: Matrix4.apply(viewportMatrix, vertex.clipPosition), viewZ: vertex.viewZ };
                });
                this.drawTriangle(triangle[0], triangle[1], triangle[2], gameObject.mesh.colour);
            });
        });
        // triangles.sort((a, b) => {
        //     return Math.min(a[0].z, a[2].z, a[2].z) - Math.min(b[0].z, b[2].z, b[2].z);
        // });
        // triangles.forEach(triangle => {
        //     let colour: [number, number, number] = [0,0,255]
        //     this.drawTriangle(triangle[0], triangle[1], triangle[2], colour)
        // })    
        this.drawBuffer();
        if (fps)
            this.ctx.fillText("fps: " + fps.toString(), 5, 10);
        this.ctx.fillText("triangles: " + triangles.length.toString(), 5, 20);
        this.ctx.fillText("x: " + Math.trunc(camera.transform.position.x) + " z: " + Math.trunc(camera.transform.position.z), 5, 30);
        // this.ctx.fillText("objects: " + gameObjects.length.toString(), 5, 30) 
    }
    drawTriangle(p1, p2, p3, colour = [0, 0, 255]) {
        const screenBuffer = this.screenBuffer;
        let highestClip, middleClip, lowestClip, highestDepth, middleDepth, lowestDepth;
        if (p1.clipPosition.y > p2.clipPosition.y) {
            highestClip = p1.clipPosition;
            highestDepth = p1.viewZ;
            lowestClip = p2.clipPosition;
            lowestDepth = p2.viewZ;
        }
        else {
            highestClip = p2.clipPosition;
            highestDepth = p2.viewZ;
            lowestClip = p1.clipPosition;
            lowestDepth = p1.viewZ;
        }
        if (p3.clipPosition.y > highestClip.y) {
            middleClip = highestClip;
            middleDepth = highestDepth;
            highestClip = p3.clipPosition;
            highestDepth = p3.viewZ;
        }
        else if (p3.clipPosition.y < lowestClip.y) {
            middleClip = lowestClip;
            middleDepth = lowestDepth;
            lowestClip = p3.clipPosition;
            lowestDepth = p3.viewZ;
        }
        else {
            middleClip = p3.clipPosition;
            middleDepth = p3.viewZ;
        }
        const minY = lowestClip.y;
        const maxY = highestClip.y;
        const middleYtoMaxY = maxY - middleClip.y;
        const minYtoMaxY = maxY - minY;
        const minYtoMiddleY = middleClip.y - minY;
        const dxMiddleToHighest = (highestClip.x - middleClip.x) / middleYtoMaxY;
        const dxLowestToHighest = (highestClip.x - lowestClip.x) / minYtoMaxY;
        const dxLowestToMiddle = (middleClip.x - lowestClip.x) / minYtoMiddleY;
        const dxDepthMiddleToHighest = (highestDepth - middleDepth) / middleYtoMaxY;
        const dxDepthLowestToHighest = (highestDepth - lowestDepth) / minYtoMaxY;
        const dxDepthLowestToMiddle = (middleDepth - lowestDepth) / minYtoMiddleY;
        const middleOnLeft = dxLowestToMiddle < dxLowestToHighest;
        let leftGradient, rightGradient, leftDepthGradient, rightDepthGradient;
        if (middleOnLeft) {
            leftGradient = dxLowestToMiddle;
            rightGradient = dxLowestToHighest;
            leftDepthGradient = dxDepthLowestToMiddle;
            rightDepthGradient = dxDepthLowestToHighest;
        }
        else {
            leftGradient = dxLowestToHighest;
            rightGradient = dxLowestToMiddle;
            leftDepthGradient = dxDepthLowestToHighest;
            rightDepthGradient = dxDepthLowestToMiddle;
        }
        const startY = Math.ceil(minY);
        const middleY = Math.ceil(middleClip.y);
        const endY = Math.floor(maxY);
        let dY = startY - minY;
        let leftBoundary = (dY * leftGradient) + lowestClip.x;
        let rightBoundary = (dY * rightGradient) + lowestClip.x;
        let leftDepth = (dY * leftDepthGradient) + lowestDepth;
        let rightDepth = (dY * rightDepthGradient) + lowestDepth;
        let leftTrunc;
        let rightTrunc;
        for (let row = startY; row < middleY; row++) {
            leftTrunc = Math.ceil(leftBoundary);
            rightTrunc = Math.floor(rightBoundary);
            screenBuffer.updateRangeColour(row, leftTrunc, rightTrunc, leftDepth, rightDepth, colour);
            leftBoundary += leftGradient;
            rightBoundary += rightGradient;
            leftDepth += leftDepthGradient;
            rightDepth += rightDepthGradient;
            dY++;
        }
        dY = middleY - middleClip.y;
        if (middleOnLeft) {
            leftGradient = dxMiddleToHighest;
            leftDepthGradient = dxDepthMiddleToHighest;
            leftBoundary = middleClip.x;
            rightBoundary = (minYtoMiddleY * rightGradient) + lowestClip.x;
            leftDepth = middleDepth;
            rightDepth = (minYtoMiddleY * rightDepthGradient) + lowestDepth;
        }
        else {
            rightGradient = dxMiddleToHighest;
            rightDepthGradient = dxDepthMiddleToHighest;
            leftBoundary = (minYtoMiddleY * leftGradient) + lowestClip.x;
            rightBoundary = middleClip.x;
            leftDepth = (minYtoMiddleY * leftDepthGradient) + lowestDepth;
            rightDepth = middleDepth;
        }
        leftBoundary += (dY * leftGradient);
        rightBoundary += (dY * rightGradient);
        leftDepth += (dY * leftDepthGradient);
        rightDepth += (dY * rightDepthGradient);
        for (let row = middleY; row <= endY; row++) {
            leftTrunc = Math.ceil(leftBoundary);
            rightTrunc = Math.floor(rightBoundary);
            screenBuffer.updateRangeColour(row, leftTrunc, rightTrunc, leftDepth, rightDepth, colour);
            leftDepth += leftDepthGradient;
            rightDepth += rightDepthGradient;
            leftBoundary += leftGradient;
            rightBoundary += rightGradient;
            dY++;
        }
    }
    async drawBuffer() {
        this.ctx.putImageData(this.screenBuffer.imageData, 0, 0);
    }
}
