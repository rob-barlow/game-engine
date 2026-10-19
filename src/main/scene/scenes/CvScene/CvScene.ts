import { Controller } from "../../../controls/in-game/controllers/Controller";
import { Matrix3, Transform } from "../../../maths/index";
import LetterMeshes from "../../../meshes/LetterMesh";
import { GameObject } from "../../game-objects";
import { Letter } from "../../game-objects/Letter";
import { Scene } from "../../Scene";
import { addPlayer } from "../Extensions";

const cvText = "Hi I am Rob";

const char = "I";

export function createCvScene(): {scene: Scene, controllers: Controller[]} {
    const scene = new Scene();

    addLetters(scene)

    const playerController = addPlayer(scene);

    return {scene: scene, controllers: [playerController]};
}

const addLetters = async (scene: Scene) => {
    const meshes = new LetterMeshes();
    const meshA = meshes.MeshA;
    
    let letterTransform: Transform = {
        position: {x: 0, y: 1, z: 10},
        orientation: Matrix3.identity(),
        scale: {x: 1, y: 1, z: 1},
    }

    let letterA: GameObject = new Letter(letterTransform, [0,0,255], meshA)
    scene.add(letterA);
}