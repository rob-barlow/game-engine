import { Intent } from "../../../maths/Intent";
import { Scene } from "../../../scene/Scene";
import { GameObject } from "../../../scene/game-objects/GameObject";

export default interface MovementSystem {
    move(target: GameObject, cameraIntent: Intent, scene: Scene, dt: number): void
}