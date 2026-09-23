import { CanvasRenderer } from "./rendering/CanvasRenderer.js";
import { Engine } from "./app/Engine.js";
import { createMazeScene } from "./app/scenes/MazeScene/MazeScene.js";

export default async function main() {
    const renderer = new CanvasRenderer();

    const {scene, controllers}  = createMazeScene();

    const engine: Engine = new Engine(renderer, scene, controllers);

    document.querySelector(".play-button")?.addEventListener("click", () => {
        document.body.requestPointerLock();
    });

    engine.start();
}

main()