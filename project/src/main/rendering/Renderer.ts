import { Scene } from "../scene/Scene.js";

export interface Renderer {
    render(scene: Scene, fps: number | undefined): void
}