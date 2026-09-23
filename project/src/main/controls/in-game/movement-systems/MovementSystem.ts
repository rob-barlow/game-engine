import { Intent } from "../../../maths/Intent.js";
import { Scene } from "../../../scene/Scene.js";
import { GameObject } from "../../../scene/game-objects/GameObject.js";

export default interface MovementSystem {
    move(target: GameObject, cameraIntent: Intent, scene: Scene, dt: number): void
}