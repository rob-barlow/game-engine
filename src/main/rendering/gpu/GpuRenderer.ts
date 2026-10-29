import AssetManager from "../../app/AssetManager";
import { Scene } from "../../scene/Scene";
import { CanvasSize } from "../../utils/types";
import { Renderer } from "../Renderer";
import GeometryPass from "./passes/GeometryPass";

export class GpuRenderer implements Renderer {
    gl: WebGLRenderingContext;
    size: CanvasSize;

    assetManager: AssetManager;

    geometryPass: GeometryPass;

    constructor(assetManager: AssetManager){
        this.assetManager = assetManager;

        const canvas = document.getElementById("gpu-canvas") as HTMLCanvasElement;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.size = {
            width: canvas.width,
            height: canvas.height
        };

        this.gl = canvas.getContext("webgl") as WebGLRenderingContext;

        this.geometryPass = new GeometryPass(this.gl, this.size, this.assetManager);

        // face culling
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.FRONT)

        // depth test
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.depthFunc(this.gl.LESS);

        // viewport
        this.gl.viewport(0, 0, this.size.width, this.size.height);


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

    resize(){
    }
}

