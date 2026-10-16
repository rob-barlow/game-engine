import { Engine } from "./app/Engine";
import { createMazeScene } from "./scene/scenes/MazeScene/MazeScene";

export default async function main() {

    const {scene, controllers}  = createMazeScene();

    const engine: Engine = new Engine(scene, controllers);

    engine.start();
}

main()