import { Matrix4, Transform, Vec3, Vec4 } from "../maths/index.js";
import { Lerp } from "../maths/Lerp.js";
import { RasterVertex } from "../maths/RasterVertex.js";
import { Axis } from "../utils/types.js";

export const Projection = {
    projectTriangles(triangles: [Vec3, Vec3, Vec3][], transform: Transform, cameraMatrix: Matrix4, projectionMatrix: Matrix4, viewportMatrix: Matrix4): 
    ([RasterVertex, RasterVertex, RasterVertex])[] {
        const worldMatrix: Matrix4 = Transform.getWorldMatrix(transform);
        const viewMatrix: Matrix4 = Matrix4.multiply(cameraMatrix, worldMatrix)
        //const mvpMatrix = Matrix4.multiply(projectionMatrix, viewMatrix)

        const projectedTriangles: [RasterVertex, RasterVertex, RasterVertex][] = []

        triangles.forEach(triangle => {
            projectedTriangles.push(...this.projectTriangle(triangle, viewMatrix, projectionMatrix, viewportMatrix))
        });

        return projectedTriangles;
    },

    projectTriangle(triangle: [Vec3, Vec3, Vec3], viewMatrix: Matrix4, projectionMatrix: Matrix4, viewportMatrix: Matrix4):  [RasterVertex, RasterVertex, RasterVertex][] {
        let rasterVertices = triangle.map(p => {
            let v4p = Vec3.toVec4(p, 1)
            const viewPoint = Matrix4.apply(viewMatrix, v4p)
            const ndcPoint = Matrix4.apply(projectionMatrix, viewPoint)
            return {clipPosition: ndcPoint, viewZ: viewPoint.z}
        }) as [RasterVertex, RasterVertex, RasterVertex]

        const trianglesAfterClipping: [RasterVertex, RasterVertex, RasterVertex][] = this.clipTriangle(rasterVertices)

        const canvasTriangles: [RasterVertex, RasterVertex, RasterVertex][] = []

        for (let i = 0; i < trianglesAfterClipping.length; i++){
            let currentTriangle = trianglesAfterClipping[i]

            const rasterVertex0 = {
                clipPosition: Matrix4.apply(viewportMatrix, Vec4.scale(currentTriangle[0].clipPosition, 1/currentTriangle[0].clipPosition.w)),
                viewZ: currentTriangle[0].viewZ}

            const rasterVertex1 = {
                clipPosition: Matrix4.apply(viewportMatrix, Vec4.scale(currentTriangle[1].clipPosition, 1/currentTriangle[1].clipPosition.w)),
                viewZ: currentTriangle[1].viewZ}

            const rasterVertex2 = {
                clipPosition: Matrix4.apply(viewportMatrix, Vec4.scale(currentTriangle[2].clipPosition, 1/currentTriangle[2].clipPosition.w)),
                viewZ: currentTriangle[2].viewZ}

            const v1x = rasterVertex1.clipPosition.x - rasterVertex0.clipPosition.x
            const v1y = rasterVertex1.clipPosition.y - rasterVertex0.clipPosition.y
            const v2x = rasterVertex2.clipPosition.x - rasterVertex1.clipPosition.x
            const v2y = rasterVertex2.clipPosition.y - rasterVertex1.clipPosition.y
            const cross = (v1x * v2y) - (v1y * v2x);

            if (cross > 0)
                canvasTriangles.push([rasterVertex0, rasterVertex1, rasterVertex2])
        }

        return canvasTriangles;
    },

    clipTriangle(triangle: [RasterVertex, RasterVertex, RasterVertex]): [RasterVertex, RasterVertex, RasterVertex][]{
        const returnTriangles: [RasterVertex, RasterVertex, RasterVertex][] = []

        const bufferA : RasterVertex[] = []
        const bufferB : RasterVertex[] = [...triangle]
        let currentBuffer = 0

        const planes: Axis[] = ['X', 'Y', 'Z']

        
        for (let planeIndex = 0; planeIndex < 3; planeIndex++){
            const plane = planes[planeIndex]
       
            const getAxis = plane == 'X'
                ? (rasterVertex: RasterVertex) => rasterVertex.clipPosition.x 
                : plane == 'Y' 
                    ? (rasterVertex: RasterVertex) => rasterVertex.clipPosition.y 
                    : (rasterVertex: RasterVertex) => rasterVertex.clipPosition.z 

            for (let wMultiplier = -1; wMultiplier < 2; wMultiplier += 2){
                const currentBufferIsA = currentBuffer % 2 == 0
                const polygonVertices = currentBufferIsA ? bufferA : bufferB
                const lastVertices = currentBufferIsA ? bufferB : bufferA

                for (let lastVerticesIndex = 0; lastVerticesIndex < lastVertices.length; lastVerticesIndex++){
                    const v1 = lastVertices[lastVerticesIndex]
                    const v2 = lastVertices[(lastVerticesIndex + 1) % lastVertices.length]

                    const v1AxisCoord = getAxis(v1)
                    const v2AxisCoord = getAxis(v2)
            
                    const v1Inside = wMultiplier == 1 ? v1AxisCoord < v1.clipPosition.w :  v1AxisCoord > -v1.clipPosition.w
                    const v2Inside = wMultiplier == 1 ? v2AxisCoord < v2.clipPosition.w :  v2AxisCoord > -v2.clipPosition.w

                    // maintain the order
                    if (v1Inside && v2Inside){
                        polygonVertices.push(v1)
                        continue
                    }
                    else if (!v1Inside && !v2Inside){
                        // could loop until find the next vertex inside and start there
                        continue
                    }
                    else {
                        let t = ((wMultiplier * v2.clipPosition.w) - v2AxisCoord)/(v1AxisCoord + (wMultiplier * v2.clipPosition.w) - v2AxisCoord - (wMultiplier * v1.clipPosition.w))
                        const newPoint = Lerp.lerpRasterVertex(v1, v2, t)
                        
                        if (v1Inside){
                            polygonVertices.push(v1)
                            polygonVertices.push(newPoint)
                            continue
                        }
                        else {
                            polygonVertices.push(newPoint)
                            continue
                        }
                    }
                }

                lastVertices.length = 0
                currentBuffer++
            }
        }

        const currentBufferIsA = currentBuffer % 2 == 0
        const lastVertices = currentBufferIsA ? bufferB : bufferA

        if (lastVertices.length < 3){
            return []
        }

        // triangulate the polygon
        for (let i = 0; i < lastVertices.length - 2; i++){
            const newTriangle = [
                lastVertices[0],
                lastVertices[(i + 1) % lastVertices.length],
                lastVertices[(i + 2) % lastVertices.length]] as [RasterVertex, RasterVertex, RasterVertex]

            returnTriangles.push(newTriangle)
        }

        return returnTriangles;
    },
}
