import Texture from "../meshes/Textures/Textures";

export default class AssetManager {
    imageMap: Map<string, HTMLImageElement>
    textures: Map<Texture, WebGLTexture> = new Map<Texture, WebGLTexture>()

    textureUrls = ["./cave-wall.webp", "./water.webp", "./ceiling-tiles.webp", "./brick-wall.webp"];

    constructor(){
        this.load();
    }

    async load(){
        this.imageMap = new Map<string, HTMLImageElement>();

        for (let i = 0; i < this.textureUrls.length; i++) {
            const url = this.textureUrls[i];

            const image =  new Image();

            image.src = url

            await image.decode();
            this.imageMap.set(url, image);
        }
                
    }

    getTexture(texture: Texture): WebGLTexture {
        return this.textures.get(texture);
    }

    loadTexture(gl: WebGLRenderingContext, url: string) {
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
      
        const image =  this.imageMap.get(url);

        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            srcFormat,
            srcType,
            image,
        );

        // WebGL1 has different requirements for power of 2 images
        // vs. non power of 2 images so check if the image is a
        // power of 2 in both dimensions.
        if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
            // Yes, it's a power of 2. Generate mips.
            gl.generateMipmap(gl.TEXTURE_2D);
        } 
        else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }

        return texture;
    }

    loadTextures(gl: WebGLRenderingContext) {
        const waterTexture = this.loadTexture(gl, "./water.webp");
        this.textures.set(Texture.Water, waterTexture);

        const caveWallTexture = this.loadTexture(gl, "./cave-wall.webp");
        this.textures.set(Texture.CaveWall, caveWallTexture);

        const ceilingTexture = this.loadTexture(gl, "./ceiling-tiles.webp");
        this.textures.set(Texture.Ceiling, ceilingTexture);

        const brickTexture = this.loadTexture(gl, "./brick-wall.webp");
        this.textures.set(Texture.Brick, brickTexture);

        // Plain texture stuff
        const plainTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D,  plainTexture);

        const level = 0;
        const internalFormat = gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([255, 255, 255, 255]);
        gl.texImage2D(
            gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel,
        );

        this.textures.set(Texture.Plain, plainTexture);
    }

    isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }
}