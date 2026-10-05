import { CpuRenderer } from "./rendering/CpuRenderer.js";
import { Engine } from "./app/Engine.js";
import { createMazeScene } from "./app/scenes/MazeScene/MazeScene.js";

export default async function main() {

    const {scene, controllers}  = createMazeScene();

    const engine: Engine = new Engine(scene, controllers);

    engine.start();
}

main()