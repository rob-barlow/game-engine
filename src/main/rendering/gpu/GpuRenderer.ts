import { Matrix4, Transform, Vec2, Vec3, Vec4 } from "../../maths/index";
import { GameObject } from "../../scene/game-objects";
import { Panel } from "../../scene/game-objects/Panel";
import Rabbit from "../../scene/game-objects/Rabbit";
import { Scene } from "../../scene/Scene";
import { farPlaneZ, nearPlaneZ } from "../../utils/constants";
import { CanvasSize } from "../../utils/types";
import GpuInstancingProgram from "./programs/GpuInstancingProgram";
import RegularProgram from "./programs/RegularProgram";
import { Renderer } from "../Renderer";
import GeometryPass from "./passes/GeometryPass";

export class GpuRenderer implements Renderer {
    gl: WebGLRenderingContext;
    size: CanvasSize;

    wallTexture: WebGLTexture;

    geometryPass: GeometryPass;

    constructor(){
        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.size = {
            width: canvas.width,
            height: canvas.height
        };

        this.gl = canvas.getContext("webgl") as WebGLRenderingContext;

        this.geometryPass = new GeometryPass(this.gl, this.size);

        // face culling
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.FRONT)

        // depth test
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        // viewport
        this.gl.viewport(0, 0, this.size.width, this.size.height);

        const imageUrl = "./wall.jpg";
        this.wallTexture = this.loadTexture(imageUrl);

        this.gl.clearColor(0, 0, 0, 1.0);
    }

//     render(scene: Scene) {
//     // 1. Build draw list / culling
//     const visibleObjects = scene.getVisibleObjects();

//     // 2. Geometry pass
//     geometryPass.render(visibleObjects);

//     // 3. Lighting pass (optional)
//     lightingPass.render();

//     // 4. Post-processing passes (optional)
//     bloomPass.render();
//     fogPass.render();

//     // 5. UI pass
//     uiPass.render(scene.ui);

//     // 6. Present to screen
//     this.present();
// }
    
    public render(scene: Scene) {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        this.geometryPass.render(scene);
    }

    loadTexture(url: string) {
        const texture = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        // Because images have to be downloaded over the internet
        // they might take a moment until they are ready.
        // Until then put a single pixel in the texture so we can
        // use it immediately. When the image has finished downloading
        // we'll update the texture with the contents of the image.
        const level = 0;
        const internalFormat = this.gl.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = this.gl.RGBA;
        const srcType = this.gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]); // opaque blue
        this.gl.texImage2D(
            this.gl.TEXTURE_2D,
            level,
            internalFormat,
            width,
            height,
            border,
            srcFormat,
            srcType,
            pixel,
        );

        const image = new Image();
        image.onload = () => {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
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
                this.gl.generateMipmap(this.gl.TEXTURE_2D);
            } 
            else {
            // No, it's not a power of 2. Turn off mips and set
            // wrapping to clamp to edge
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
            this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
            }
        };

        image.src = url;

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);

        return texture;
    }

    isPowerOf2(value: number) {
        return (value & (value - 1)) === 0;
    }
}

