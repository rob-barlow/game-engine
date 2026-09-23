export class ScreenBuffer{
    rowLength: number;
    columnLength: number;

    backgroundColour: number

    screenArrayBuffer: ArrayBuffer
    screenBuffer: Uint8ClampedArray<ArrayBuffer>;
    
    depthArrayBuffer: ArrayBuffer
    depthBuffer: Uint8ClampedArray<ArrayBuffer>;
    imageData: ImageData

    constructor(canvasWidth: number, canvasHeight: number, fillValue: number){
        this.rowLength = canvasWidth
        this.columnLength = canvasHeight
        this.backgroundColour = fillValue;
        
        this.depthArrayBuffer = new ArrayBuffer(this.rowLength * this.columnLength)
        this.depthBuffer = new Uint8ClampedArray(this.depthArrayBuffer).fill(1);

        this.screenArrayBuffer = new ArrayBuffer(this.rowLength * this.columnLength * 4)
        this.screenBuffer = new Uint8ClampedArray(this.screenArrayBuffer).fill(this.backgroundColour);
        this.imageData = new ImageData(this.screenBuffer, canvasWidth, canvasHeight)
    }

    resetBuffer(){
        this.screenBuffer.fill(this.backgroundColour);
        this.depthBuffer.fill(100); // another slow line
    }

    public updatePixelColour(row: number, column: number, depth: number, colour: [number, number, number]){
        let arrayIndex = (row * this.rowLength) + column
        
        if (depth < this.depthBuffer[arrayIndex]){
            this.depthBuffer[arrayIndex] = depth

            arrayIndex *= 4
            this.screenBuffer[arrayIndex] = colour[0]
            this.screenBuffer[arrayIndex + 1] = colour[1]
                this.screenBuffer[arrayIndex + 2] = colour[2]
                this.screenBuffer[arrayIndex + 3] = 255
        }
    }

    public updateRangeColour(row: number, startColumn: number, endColumn: number, startDepth: number, endDepth: number, colour: [number, number, number]){
        const depthBuffer = this.depthBuffer;
        const screenBuffer = this.screenBuffer;
        
        const r = colour[0];
        const g = colour[1];
        const b = colour[2];
        let arrayIndex = (row * this.rowLength) + startColumn
        let screenBufferArrayIndex = arrayIndex * 4
        
        let depth = startDepth
        let colourScale = depth * 30
        const depthIncrement = endColumn == startColumn ? 0 : (endDepth - startDepth)/(endColumn - startColumn)
        const colourScaleIncrement = depthIncrement * 30
        for (let _column = startColumn; _column <= endColumn; _column ++)
        {
            if (depth < depthBuffer[arrayIndex]){
                depthBuffer[arrayIndex] = depth

                screenBuffer[screenBufferArrayIndex] = r - colourScale
                screenBuffer[screenBufferArrayIndex + 1] = g - colourScale
                screenBuffer[screenBufferArrayIndex + 2] = b - colourScale
                screenBuffer[screenBufferArrayIndex + 3] = 255
            }   

            arrayIndex ++
            screenBufferArrayIndex += 4
            depth += depthIncrement
            colourScale += colourScaleIncrement
        }
    }
}