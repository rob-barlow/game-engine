import { Scene } from "../scene/Scene";

export interface Renderer {
    render(scene: Scene, fps: number | undefined): void
}